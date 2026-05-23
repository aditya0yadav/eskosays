/**
 * Unified Zamplia Callback Handler
 *
 * Zamplia only allows ONE redirect URL per account.
 * This handler is shared between RealSays and any other service using the same Zamplia account.
 *
 * Routing logic:
 *   - uid starts with "rs_"  → RealSays user → process completion/termination in our DB
 *   - uid is anything else   → Other service user → redirect to OTHER_SERVICE_CALLBACK_URL
 *
 * Zamplia callback parameters:
 *   - platform: "zamplia"
 *   - status: c (complete) | t (terminate) | q (quota full) | s (security termination)
 *   - sid: Survey ID (Zamplia study variable)
 *   - uid: TransactionId we sent during link generation (= "rs_<clickId>" for RealSays users)
 */

const { SurveyClick, SurveyCompletion, Panelist, Survey } = require('../../../models');

const RS_PREFIX = 'rs_';

// Map Zamplia single-letter status codes → our internal status strings
const STATUS_MAP = {
    'c': 'completed',
    't': 'terminated',
    'q': 'overquota',
    's': 'terminated' // security termination treated as terminate
};

// Map to the frontend survey-status page query value
const FRONTEND_STATUS_MAP = {
    'c': 'success',
    't': 'terminate',
    'q': 'overquota',
    's': 'terminate'
};

const handleZampliaUnifiedCallback = async (req, res, next) => {
    try {
        const { uid, status, sid } = req.query;

        console.log(`[ZampliaCallback] uid=${uid} | status=${status} | sid=${sid}`);

        if (!uid) {
            console.warn('[ZampliaCallback] Missing uid parameter');
            return res.status(400).send('Missing uid');
        }

        // ── Route: Is this a RealSays user? ─────────────────────────────────
        if (uid.startsWith(RS_PREFIX)) {
            const clickId = uid.slice(RS_PREFIX.length); // strip "rs_" prefix
            console.log(`[ZampliaCallback] 🏠 RealSays user detected | clickId: ${clickId}`);
            return await processRealSaysCallback(clickId, status, res);
        }

        // ── Route: Other service user → forward to realsays.com callback ────
        const otherServiceUrl = process.env.OTHER_SERVICE_CALLBACK_URL;
        if (!otherServiceUrl) {
            console.error('[ZampliaCallback] ⚠️  OTHER_SERVICE_CALLBACK_URL not configured in .env');
            return res.status(500).send('Routing misconfigured');
        }

        // Forward ALL original Zamplia params to the other service intact
        const forwarded = new URLSearchParams();
        Object.entries(req.query).forEach(([k, v]) => v && forwarded.set(k, v));
        const redirectTo = `${otherServiceUrl}?${forwarded.toString()}`;
        console.log(`[ZampliaCallback] 🔀 realsays.com user → forwarding to: ${redirectTo}`);
        return res.redirect(302, redirectTo);

    } catch (error) {
        console.error('[ZampliaCallback] Unexpected error:', error.message);
        next(error);
    }
};

/**
 * Process a RealSays user's Zamplia callback
 */
async function processRealSaysCallback(clickId, statusCode, res) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const internalStatus = STATUS_MAP[statusCode] || 'pending';
    const frontendStatus = FRONTEND_STATUS_MAP[statusCode] || 'unknown';

    // 1. Find the SurveyClick record
    const click = await SurveyClick.findByPk(clickId, {
        include: [{ model: Survey, as: 'survey' }]
    });

    if (!click) {
        console.warn(`[ZampliaCallback] SurveyClick not found: ${clickId}`);
        // Still redirect user to frontend with status rather than showing an error page
        return res.redirect(`${frontendUrl}/survey-status?survey_status=${frontendStatus}`);
    }

    // 2. Update click status (idempotent — update even if already set)
    await click.update({ status: internalStatus });

    // 3. If completed, create completion record and credit the panelist
    if (statusCode === 'c') {
        const payout = click.survey?.payout || 0;

        const [, created] = await SurveyCompletion.findOrCreate({
            where: { click_id: click.id },
            defaults: {
                click_id: click.id,
                panelist_id: click.panelist_id,
                survey_id: click.survey_id,
                status: 'complete',
                payout
            }
        });

        if (created) {
            const panelist = await Panelist.findByPk(click.panelist_id);
            if (panelist) {
                const updates = {
                    balance: parseFloat(panelist.balance) + parseFloat(payout),
                    lifetime_earnings: parseFloat(panelist.lifetime_earnings) + parseFloat(payout),
                    completions_count: (panelist.completions_count || 0) + 1
                };

                // Bonus unlock: 5 completions unlocks pending bonus
                if (updates.completions_count === 5 && parseFloat(panelist.pending_bonus || 0) > 0) {
                    updates.balance += parseFloat(panelist.pending_bonus);
                    updates.lifetime_earnings += parseFloat(panelist.pending_bonus);
                    updates.pending_bonus = 0;
                }

                await panelist.update(updates);
                console.log(`[ZampliaCallback] ✅ Credited $${payout} to panelist ${click.panelist_id}`);
            }
        } else {
            console.log(`[ZampliaCallback] ⚠️  Duplicate completion ignored for click ${clickId}`);
        }
    }

    // 4. Redirect to RealSays frontend
    return res.redirect(`${frontendUrl}/survey-status?survey_status=${frontendStatus}`);
}

module.exports = { handleZampliaUnifiedCallback };

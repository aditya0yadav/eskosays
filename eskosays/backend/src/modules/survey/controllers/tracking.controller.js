const { SurveyClick, SurveyCompletion, Panelist, Survey } = require('../../../models');

class TrackingController {
    /**
     * Handle GoWeb callback
     * Expects: ?clickId=...&status=success|disqualify|terminate|overquota&uid=...
     */
    handleGoWebCallback = async (req, res, next) => {
        try {
            const { clickId, status } = req.query;
            await this._processCallback(clickId, status, res);
        } catch (error) {
            console.error('Error in handleGoWebCallback:', error.message);
            next(error);
        }
    }

    /**
     * Handle Zamplia callback
     * Expects: ?clickId=...&status=success|disqualify|terminate|overquota
     */
    handleZampliaCallback = async (req, res, next) => {
        try {
            const { clickId, status } = req.query;
            await this._processCallback(clickId, status, res);
        } catch (error) {
            console.error('Error in handleZampliaCallback:', error.message);
            next(error);
        }
    }

    /**
     * Unified callback processing
     */
    _processCallback = async (clickId, status, res) => {
        if (!clickId) return res.status(400).send('Missing clickId');

        // 1. Find the click record
        const click = await SurveyClick.findByPk(clickId, {
            include: [{ model: Survey, as: 'survey' }]
        });

        if (!click) return res.status(404).send('Click not found');

        // 2. Update click status
        const statusMap = {
            'success': 'completed',
            'disqualify': 'disqualified',
            'terminate': 'terminated',
            'overquota': 'overquota'
        };

        await click.update({ status: statusMap[status] || 'pending' });

        // 3. If success, create a completion record and update panelist balance
        if (status === 'success') {
            const payout = click.survey ? click.survey.payout : 0;

            const [completion, created] = await SurveyCompletion.findOrCreate({
                where: { click_id: click.id },
                defaults: {
                    click_id: click.id,
                    panelist_id: click.panelist_id,
                    survey_id: click.survey_id,
                    status: 'complete',
                    payout: payout
                }
            });

            // Increment panelist balance only if this is a NEW completion
            if (created) {
                const panelist = await Panelist.findByPk(click.panelist_id);
                if (panelist) {
                    const updates = {
                        balance: parseFloat(panelist.balance) + parseFloat(payout),
                        lifetime_earnings: parseFloat(panelist.lifetime_earnings) + parseFloat(payout),
                        completions_count: (panelist.completions_count || 0) + 1
                    };

                    // Bonus Unlock Logic: If completions reach 5, unlock the pending bonus
                    if (updates.completions_count === 5 && parseFloat(panelist.pending_bonus || 0) > 0) {
                        updates.balance += parseFloat(panelist.pending_bonus);
                        updates.lifetime_earnings += parseFloat(panelist.pending_bonus);
                        updates.pending_bonus = 0;
                    }

                    await panelist.update(updates);
                }
            }
        }

        // 4. Redirect user back to frontend dashboard with a status message
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/survey-status?survey_status=${status}`);
    }
}

module.exports = new TrackingController();

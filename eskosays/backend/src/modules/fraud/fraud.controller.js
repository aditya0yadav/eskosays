const fraudService = require('./fraud.service');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../../config/admin_settings.json');

/**
 * POST /api/fraud/check
 *
 * Body (from frontend):
 * {
 *   fingerprintHash: string,   // SHA-256 of browser fingerprint
 *   surveyId:        string,   // Provider's survey ID
 *   platform:        string,   // 'goweb' | 'zamplia' | ...
 *   username:        string    // Username of the member
 * }
 *
 * IP address is extracted from the request by the backend (not trusted from body).
 *
 * Response:
 * {
 *   allowed: boolean,
 *   reason:  string | null,    // 'duplicate_fingerprint' | 'duplicate_ip' | null
 *   message: string,
 *   score:   number
 * }
 */
const check = async (req, res, next) => {
    try {
        const { fingerprintHash, surveyId, platform, username } = req.body;

        // ── Validate required fields ──────────────────────────────────────
        if (!fingerprintHash || !surveyId || !platform) {
            return res.status(400).json({
                allowed: false,
                reason: 'invalid_request',
                message: 'fingerprintHash, surveyId, and platform are required.',
            });
        }

        // ── Extract real IP (backend-side, not trusted from body) ─────────
        const rawIp = (
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            '0.0.0.0'
        );

        // Normalise: strip IPv6 loopback prefix "::ffff:" for IPv4 addresses
        const ipAddress = rawIp.replace(/^::ffff:/, '');
        const userAgent = req.headers['user-agent'] || null;

        // ── Run fraud check ───────────────────────────────────────────────
        const result = await fraudService.checkAndRecord({
            fingerprintHash,
            ipAddress,
            surveyId,
            platform,
            username,
            userAgent,
        });

        // Send result

        if (result.allowed) {
            return res.status(200).json({
                allowed: true,
                reason: null,
                message: 'OK — proceed to survey.',
                score: result.score,
            });
        }

        return res.status(200).json({
            allowed: false,
            reason: result.reason,
            message:
                result.reason === 'duplicate_ip'
                    ? 'This survey has already been filled from your network address.'
                    : 'This survey has already been filled from this device.',
            score: result.score,
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/fraud/ipqs-check
 *
 * Body (from frontend):
 * {
 *   surveyId:        string,   // Provider's survey ID
 *   platform:        string,   // 'goweb' | 'zamplia' | ...
 *   username:        string    // Username of the member
 * }
 */
const ipqsCheck = async (req, res, next) => {
    try {
        const { surveyId, platform, username } = req.body;

        if (!surveyId || !platform) {
            return res.status(400).json({
                allowed: false,
                reason: 'invalid_request',
                message: 'surveyId and platform are required.',
            });
        }

        const rawIp = (
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            '0.0.0.0'
        );

        const ipAddress = rawIp.replace(/^::ffff:/, '');
        const userAgent = req.headers['user-agent'] || null;
        const language = req.headers['accept-language'] || null;

        const result = await fraudService.checkAndRecordIpqs({
            ipAddress,
            surveyId,
            platform,
            username,
            userAgent,
            language,
        });

        if (result.allowed) {
            return res.status(200).json({
                allowed: true,
                reason: null,
                message: 'OK — proceed to survey.',
                score: result.score,
            });
        }

        return res.status(200).json({
            allowed: false,
            reason: result.reason,
            message:
                result.reason === 'duplicate_ip'
                    ? 'This survey has already been filled from your network address.'
                    : 'Fraudulent activity detected.',
            score: result.score,
        });

    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/fraud/recent
 *
 * Query params (all optional):
 *   limit      - Max results (default 50)
 *   platform   - Filter by provider: goweb, zamplia, opinio, etc.
 *   status     - Filter by status: new, flagged, blocked
 *   username   - Filter by username (partial match)
 *   surveyId   - Filter by exact survey ID
 *   from       - Start date (ISO string, e.g. 2026-04-01)
 *   to         - End date (ISO string, e.g. 2026-04-11)
 *   minScore   - Minimum trust score (0-100)
 *   maxScore   - Maximum trust score (0-100)
 */
const recentActivities = async (req, res, next) => {
    try {
        const filters = {
            limit: parseInt(req.query.limit) || 50,
            platform: req.query.platform || null,
            status: req.query.status || null,
            username: req.query.username || null,
            surveyId: req.query.surveyId || null,
            from: req.query.from || null,
            to: req.query.to || null,
            minScore: req.query.minScore !== undefined ? parseInt(req.query.minScore) : undefined,
            maxScore: req.query.maxScore !== undefined ? parseInt(req.query.maxScore) : undefined,
        };

        const activities = await fraudService.getRecentActivities(filters);
        return res.status(200).json({ activities });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/fraud/service-config
 * Public route for frontend to fetch active fraud service setting
 */
const getServiceConfig = async (req, res, next) => {
    try {
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        const service = settings.fraudService || 'fingerprint';
        return res.status(200).json({ success: true, service });
    } catch (err) {
        next(err);
    }
};

module.exports = { check, ipqsCheck, recentActivities, getServiceConfig };
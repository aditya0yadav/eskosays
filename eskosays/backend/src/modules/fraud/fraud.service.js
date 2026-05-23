const { Op } = require('sequelize');
const { FingerprintServerApiClient, Region } = require('@fingerprint/node-sdk');
const axios = require('axios');

const redis = require('../../config/redis');
const SurveyVisit = require('../../models/fraud/SurveyVisit.model');
const SurveyFraudFlag = require('../../models/fraud/SurveyFraudFlag.model');

// Fingerprint Pro Server API Client
const client = new FingerprintServerApiClient({
    apiKey: process.env.FINGERPRINT_SECRET_API_KEY || "W3rPw26FTMLdBYH9GPls",
    region: Region.Global // Matches the 'ap' region used in the frontend
});

// ─── Redis TTL: 7 days ────────────────────────────────────────────────────────
const CACHE_TTL = 60 * 60 * 24 * 7;

// ─── Cache key builders ────────────────────────────────────────────────────────
const key = {
    fp: (surveyId, hash) => `fraud:fp:${surveyId}:${hash}`,
    ip: (surveyId, ip) => `fraud:ip:${surveyId}:${ip}`,
};

/**
 * Write both cache keys for a known (already recorded) visit.
 * Uses a pipeline so both SET commands are sent in a single round-trip.
 */
const _cache = async (surveyId, fingerprintHash, visitId) => {
    await redis.setex(key.fp(surveyId, fingerprintHash), CACHE_TTL, visitId);
};

/**
 * Record a fraud flag for an already-existing visit.
 * Fire-and-forget — we don't await this in the hot path so the response
 * is returned immediately while the audit write happens in the background.
 */
const _recordFlag = (visitId, flagType, detail) => {
    SurveyFraudFlag.create({ visit_id: visitId, flag_type: flagType, detail })
        .catch(err => console.error('[Fraud] Flag write error:', err.message));
};



// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Check whether an anonymous visitor is allowed to take a survey.
 *
 * Strategy: Redis fast-path → optimistic DB insert → conflict handling.
 *
 * The optimistic-insert approach eliminates the TOCTOU race condition that
 * exists in a read-then-write pattern under high concurrency:
 *   - We attempt to INSERT immediately.
 *   - If the DB rejects with a UNIQUE constraint error, someone already has
 *     this fingerprint or IP for this survey — we fetch that record and block.
 *   - This means the Redis cache and the DB unique index together form a
 *     two-layer defence: Redis handles the ≥99% of repeat requests instantly;
 *     the DB unique constraint handles the residual concurrent-first-visit race.
 *
 * @param {{ fingerprintHash, ipAddress, surveyId, platform, userAgent }} params
 * @returns {{ allowed: boolean, reason: string|null, visitId: string }}
 */
const checkAndRecord = async ({ fingerprintHash, ipAddress, surveyId, platform, username, userAgent }) => {

    // ── 0. Initialize Sub-scores & IDs ───────────────────────────────────────
    let fpScore = 100;
    let effectiveIp = ipAddress; // Fallback to request IP
    let fpAnalysisDetails = null;

    // ── 1. Fingerprint Pro Analysis (80% Weight) ──────────────────────────────
    try {
        if (fingerprintHash && fingerprintHash !== 'blocked_or_failed' && fingerprintHash !== 'unidentified_v2') {
            const event = await client.getEvent(fingerprintHash);

            if (event) {
                const meta = {};

                // Use the highly-accurate IP detected by Fingerprint Pro
                if (event.ip_address) {
                    effectiveIp = event.ip_address;
                }

                // Identification Confidence
                const confidence = event.identification?.confidence?.score;
                if (confidence !== undefined) {
                    meta.confidence_score = confidence;
                    if (confidence < 0.6) {
                        fpScore -= 50;
                    } else if (confidence < 0.8) {
                        fpScore -= 20;
                    }
                }

                // Bot Detection
                const botResult = event.bot || 'not_detected';
                if (botResult === 'detected') fpScore -= 100;
                meta.bot = botResult;

                // Tampering
                if (event.tampering === true) {
                    fpScore -= 70;
                    meta.tampering = true;
                }

                // Virtual Machine
                if (event.virtual_machine === true) {
                    fpScore -= 40;
                    meta.vm = true;
                }

                // Jailbroken / Rooted (if present)
                if (event.jailbroken === true || event.root_apps === true) {
                    fpScore -= 80;
                    meta.jailbroken = true;
                }

                // IP Info / Hosting / Datacenter
                const ipV4 = event.ip_info?.v4;
                if (ipV4) {
                    if (ipV4.asn_type === 'hosting') fpScore -= 40;
                    if (ipV4.datacenter_result === true) fpScore -= 30;
                    meta.ip_info = { type: ipV4.asn_type, dc: ipV4.datacenter_result };
                }

                // VPN / Proxy (With confidence weighting)
                if (event.vpn === true) {
                    const vpnConf = event.vpn_confidence || 'high';
                    fpScore -= (vpnConf === 'high' ? 50 : 30);
                    meta.vpn = { detected: true, confidence: vpnConf };
                }
                if (event.proxy === true) {
                    const proxyConf = event.proxy_confidence || 'high';
                    fpScore -= (proxyConf === 'high' ? 40 : 20);
                    meta.proxy = { detected: true, confidence: proxyConf };
                }

                // Incognito Mode
                if (event.incognito === true) {
                    fpScore -= 30;
                    meta.incognito = true;
                }

                // Location Spoofing (if present)
                if (event.location_spoofing === true) {
                    fpScore -= 100;
                    meta.location_spoofing = true;
                }

                // Cloned App / Emulator (if present)
                if (event.cloned_app === true || event.emulator === true) {
                    fpScore -= 60;
                    meta.emulator = true;
                }

                // Suspect Score
                const suspectScore = event.suspect_score || 0;
                if (suspectScore > 20) fpScore -= 30;
                meta.suspect_score = suspectScore;

                fpAnalysisDetails = meta;
            }
        }
    } catch (err) {
        // Silent fail for FP API - using neutral score and request IP
    }

    // ── 3. Calculate Final Score ─────────────────────────────────────────────
    const score = Math.max(0, Math.min(100, fpScore));

    // ── Layer 1: Redis cache (sub-millisecond for repeat visitors) ────────────
    const fpHit = await redis.get(key.fp(surveyId, fingerprintHash));

    if (fpHit) {
        return { allowed: false, reason: 'duplicate_fingerprint', visitId: fpHit, score };
    }

    // Layer 2: INSERT
    try {
        const visit = await SurveyVisit.create({
            survey_id: surveyId,
            platform,
            fingerprint_hash: fingerprintHash,
            ip_address: effectiveIp,
            username: username || null,
            user_agent: userAgent || null,
            score,
            status: 'new',
            fingerprint_details: fpAnalysisDetails,
        });

        // Populate cache
        await _cache(surveyId, fingerprintHash, visit.id);

        return { allowed: true, reason: null, visitId: visit.id, score };

    } catch (err) {

        // ── Layer 3: Unique constraint violated — concurrent or repeat visit ──
        if (err.name === 'SequelizeUniqueConstraintError') {

            // Find the original visit that caused the conflict
            const original = await SurveyVisit.findOne({
                    where: {
                        survey_id: surveyId,
                        fingerprint_hash: fingerprintHash,
                    },
            });

            if (!original) {
                return { allowed: false, reason: 'conflict', visitId: null, score };
            }

            const reason = 'duplicate_fingerprint';

            // Upgrade status to 'flagged' if still 'new'
            if (original.status === 'new') {
                original.update({ status: 'flagged' }).catch(() => { });
            }

            // Async audit log — non-blocking
            _recordFlag(original.id, reason, {
                attempted_fingerprint: fingerprintHash,
                attempted_ip: ipAddress,
                matched_on: reason,
            });

            // Populate cache — prevents this from hitting DB again
            await _cache(surveyId, fingerprintHash, original.id);

            return { allowed: false, reason, visitId: original.id, score };
        }

        // Unknown error — rethrow for global error handler
        console.error(`[Fraud Service] Database error: ${err.message}`);
        throw err;
    }
};

const checkAndRecordIpqs = async ({ ipAddress, surveyId, platform, username, userAgent, language }) => {
    let score = 100;
    let details = null;
    let allowed = true;
    let reason = null;

    try {
        const key = process.env.IPQS_API_KEY || 'YOUR_API_KEY_HERE';
        const strictness = 1;
        const allow_public_access_points = 'true';
        const url = `https://www.ipqualityscore.com/api/json/ip/${key}/${ipAddress}?strictness=${strictness}&allow_public_access_points=${allow_public_access_points}&user_agent=${encodeURIComponent(userAgent || '')}&user_language=${encodeURIComponent(language || '')}`;
        
        const response = await axios.get(url);
        const ip_result = response.data;
        
        if (ip_result && ip_result.success) {
            details = ip_result;
            score = 100 - (ip_result.fraud_score || 0); // Convert 0-100 risk to 0-100 trust score
            
            const allowCrawlers = true;
            const fraudScoreMinBlock = 75;
            const fraudScoreMinBlockForMobiles = 75;
            const lowerPenaltyForMobiles = false;
            
            if (allowCrawlers && ip_result.is_crawler) {
                // Allow verified crawlers
            } else if (ip_result.mobile && lowerPenaltyForMobiles) {
                if (ip_result.fraud_score >= fraudScoreMinBlockForMobiles) {
                    allowed = false;
                    reason = 'ipqs_high_fraud_score';
                } else if (ip_result.vpn) {
                    allowed = false;
                    reason = 'ipqs_vpn';
                } else if (ip_result.tor) {
                    allowed = false;
                    reason = 'ipqs_tor';
                }
            } else {
                if (ip_result.fraud_score >= fraudScoreMinBlock) {
                    allowed = false;
                    reason = 'ipqs_high_fraud_score';
                } else if (ip_result.proxy) {
                    allowed = false;
                    reason = 'ipqs_proxy';
                }
            }
        }
    } catch (err) {
        console.error('[Fraud] IPQS request error:', err.message);
    }

    // Layer 1: Redis cache for IP
    const ipHit = await redis.get(key.ip(surveyId, ipAddress));
    if (ipHit) {
        return { allowed: false, reason: 'duplicate_ip', visitId: ipHit, score };
    }

    // Use IP as fingerprintHash fallback
    const fingerprintHash = `ipqs_${ipAddress}`;

    try {
        const visit = await SurveyVisit.create({
            survey_id: surveyId,
            platform,
            fingerprint_hash: fingerprintHash,
            ip_address: ipAddress,
            username: username || null,
            user_agent: userAgent || null,
            score,
            status: allowed ? 'new' : 'blocked',
            fingerprint_details: details,
        });

        await redis.setex(key.ip(surveyId, ipAddress), CACHE_TTL, visit.id);
        
        if (!allowed) {
            _recordFlag(visit.id, reason, {
                attempted_ip: ipAddress,
                matched_on: reason,
                ipqs_score: details?.fraud_score
            });
            return { allowed: false, reason, visitId: visit.id, score };
        }

        return { allowed: true, reason: null, visitId: visit.id, score };

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            const original = await SurveyVisit.findOne({
                where: { survey_id: surveyId, fingerprint_hash: fingerprintHash },
            });

            if (!original) {
                return { allowed: false, reason: 'conflict', visitId: null, score };
            }

            const duplicateReason = 'duplicate_ip';
            if (original.status === 'new') {
                original.update({ status: 'flagged' }).catch(() => { });
            }

            _recordFlag(original.id, duplicateReason, {
                attempted_ip: ipAddress,
                matched_on: duplicateReason,
            });

            await redis.setex(key.ip(surveyId, ipAddress), CACHE_TTL, original.id);
            return { allowed: false, reason: duplicateReason, visitId: original.id, score };
        }
        console.error(`[Fraud Service] Database error: ${err.message}`);
        throw err;
    }
};

const getRecentActivities = async (filters = {}) => {
    const { limit = 50, platform, status, username, surveyId, from, to, minScore, maxScore } = filters;

    const where = {};

    if (platform) where.platform = platform;
    if (status) where.status = status;
    if (surveyId) where.survey_id = surveyId;

    // Partial match on username
    if (username) {
        where.username = { [Op.like]: `%${username}%` };
    }

    // FIX: Use 'createdAt' (Sequelize camelCase default) consistently
    // instead of mixed 'created_at' in WHERE and 'createdAt' in ORDER BY.
    // If your model has `underscored: true`, change both to 'created_at'.
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = new Date(from);
        if (to) where.createdAt[Op.lte] = new Date(to + 'T23:59:59.999Z');
    }

    // Score range filter
    if (minScore !== undefined || maxScore !== undefined) {
        where.score = {};
        if (minScore !== undefined && !isNaN(minScore)) where.score[Op.gte] = minScore;
        if (maxScore !== undefined && !isNaN(maxScore)) where.score[Op.lte] = maxScore;
    }

    return SurveyVisit.findAll({
        where,
        order: [['createdAt', 'DESC']],  // consistent with the where clause above
        limit,
        raw: true,
    });
};

module.exports = { checkAndRecord, checkAndRecordIpqs, getRecentActivities };
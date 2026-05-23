const { DeviceFingerprint } = require('../../models');

/**
 * Calculates trust score based on how many times a device has been seen.
 * @param {number} seenCount
 * @returns {number} trust score (10 | 40 | 70 | 95)
 */
function getTrustScore(seenCount) {
    if (seenCount >= 16) return 95;  // Trusted
    if (seenCount >= 6) return 70;  // Regular
    if (seenCount >= 2) return 40;  // Familiar
    return 10;                        // New device
}

/**
 * Returns a human-readable trust label.
 * @param {number} score
 * @returns {string}
 */
function getTrustLabel(score) {
    if (score >= 95) return 'trusted';
    if (score >= 70) return 'regular';
    if (score >= 40) return 'familiar';
    return 'new';
}

/**
 * Create or update a device fingerprint for a user.
 * Returns trust score metadata to include in the auth response.
 *
 * @param {string} userId
 * @param {string} fingerprintHash - SHA-256 hex from client
 * @param {string} userAgent
 * @returns {{ score: number, label: string, isNewDevice: boolean, seenCount: number }}
 */
async function upsertFingerprint(userId, fingerprintHash, userAgent) {
    if (!fingerprintHash) {
        console.warn(`[Fingerprint] No fingerprint provided for user ${userId} — skipping`);
        return null;
    }

    try {
        const [record, created] = await DeviceFingerprint.findOrCreate({
            where: { user_id: userId, fingerprint_hash: fingerprintHash },
            defaults: {
                user_agent: userAgent,
                trust_score: 10,
                seen_count: 1,
                first_seen_at: new Date(),
                last_seen_at: new Date()
            }
        });

        if (!created) {
            // Existing device — increment seen count, recalculate trust
            record.seen_count += 1;
            record.trust_score = getTrustScore(record.seen_count);
            record.last_seen_at = new Date();
            // Update user agent in case browser was updated
            if (userAgent) record.user_agent = userAgent;
            await record.save();
        }

        const result = {
            score: record.trust_score,
            label: getTrustLabel(record.trust_score),
            isNewDevice: created,
            seenCount: record.seen_count
        };

        console.log(
            `📱 [Fingerprint] userId: ${userId} | hash: ${fingerprintHash.slice(0, 8)}... | ` +
            `seenCount: ${record.seen_count} | trust: ${result.score} (${result.label}) | ` +
            `${created ? '🆕 New device' : '🔁 Known device'}`
        );

        return result;
    } catch (err) {
        // Non-fatal — never block login due to fingerprinting errors
        console.error(`[Fingerprint] Failed to upsert for user ${userId}:`, err.message);
        return null;
    }
}

/**
 * Get all registered devices for a user (for admin or profile view).
 * @param {string} userId
 */
async function getUserDevices(userId) {
    return DeviceFingerprint.findAll({
        where: { user_id: userId },
        order: [['last_seen_at', 'DESC']]
    });
}

module.exports = { upsertFingerprint, getTrustScore, getTrustLabel, getUserDevices };

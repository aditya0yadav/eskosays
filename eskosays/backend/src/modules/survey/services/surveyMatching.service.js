/**
 * Service to match users with surveys based on their profile attributes
 */
class SurveyMatchingService {
    /**
     * Matches a user's attributes against a survey's qualifications
     * @param {Object} panelist User's panelist data including attributes
     * @param {Object} survey Survey data including qualifications
     * @param {Object} mappings Pre-loaded mappings keyed by provider
     * @returns {Object} { isMatch: boolean, score: number, reasons: Array }
     */
    static match(panelist, survey, mappings = {}) {
        let qualifications = survey.qualifications || [];
        const userAttributes = panelist.attributes || [];
        const providerSlug = survey.provider;

        // Ensure qualifications is an array
        if (!Array.isArray(qualifications)) {
            qualifications = [];
        }

        // Default match if no qualifications specified
        if (qualifications.length === 0) {
            return { isMatch: true, score: 100, reasons: ['No qualifications required'] };
        }

        let matches = 0;
        const totalReqs = qualifications.length;
        const failedReasons = [];

        for (const req of qualifications) {
            const reqKey = req.key || req.id;

            // 1. Find the mapping for this provider and question
            // Try matching by the provider_question_key or provider_question_id
            const providerMappings = mappings[providerSlug] || {};
            const attrMapping = providerMappings[reqKey] || providerMappings[req.id];

            const internalKey = attrMapping?.internal_key || reqKey;

            // 2. Find user attribute by the internal key
            const userAttr = userAttributes.find(a => a.definition?.key === internalKey);

            if (!userAttr) {
                failedReasons.push(`Missing attribute: ${internalKey}`);
                continue;
            }

            // 3. Translate user value if mapping exists
            let userValue = userAttr ? userAttr.value : null;
            if (attrMapping?.options && userValue !== null) {
                const options = attrMapping.options;
                // Case-insensitive lookup for options
                const translated = options[userValue] ||
                    options[String(userValue).toLowerCase()] ||
                    options[String(userValue).charAt(0).toUpperCase() + String(userValue).slice(1)];

                if (translated !== undefined) {
                    userValue = translated;
                }
            }

            // 4. Check requirement
            const isPassing = this.checkRequirement(req, userValue);

            if (isPassing) {
                matches++;
            } else {
                const reason = `Mismatch for ${reqKey}: user has ${JSON.stringify(userValue)}, expected ${JSON.stringify(req.allowed_values || { min: req.min, max: req.max })}`;
                failedReasons.push(reason);
            }
        }

        const score = totalReqs > 0 ? (matches / totalReqs) * 100 : 100;

        return {
            isMatch: score === 100,
            score,
            failedReasons
        };
    }

    /**
     * Helper to check if a value satisfies a requirement
     */
    static checkRequirement(req, userValue) {
        // Handle Missing Value
        if (userValue === undefined || userValue === null || userValue === 'N/A') {
            return false;
        }

        // 1. LIST TYPE (Exact or Case-Insensitive Match)
        if (req.type === 'list') {
            if (!Array.isArray(req.allowed_values)) return false;

            // Convert everything to string for comparison
            const userStr = String(userValue).trim();
            return req.allowed_values.some(v => String(v).trim() === userStr);
        }

        // 2. RANGE TYPE (Numeric Comparison)
        if (req.type === 'range') {
            const val = Number(userValue);

            // If user value is not a number, fail
            if (isNaN(val)) return false;

            // Ensure min/max are numbers
            const min = Number(req.min);
            const max = Number(req.max);

            if (isNaN(min) || isNaN(max)) return false;

            return val >= min && val <= max;
        }

        // 3. TEXT TYPE (Can be range string or list)
        if (req.type === 'text') {
            if (req.allowed_values && req.allowed_values.length > 0) {
                const allowed = req.allowed_values[0];
                const allowedStr = String(allowed).trim();

                // Handle "18-24" style ranges in text
                if (allowedStr.includes('-') && !isNaN(parseFloat(allowedStr))) {
                    const parts = allowedStr.split('-');
                    if (parts.length === 2) {
                        const min = Number(parts[0].trim());
                        const max = Number(parts[1].trim());
                        const val = Number(userValue);
                        return !isNaN(val) && val >= min && val <= max;
                    }
                }

                // Fallback to simple inclusion
                return req.allowed_values.includes(String(userValue));
            }
            return true;
        }

        return true;
    }
}

module.exports = SurveyMatchingService;

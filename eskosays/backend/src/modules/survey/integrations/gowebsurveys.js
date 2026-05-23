const axios = require('axios');
const CircuitBreaker = require('opossum');

// shared breaker options
const breakerOptions = {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 25 * 60 * 1000 // 25 minutes
};

const fetchBreaker = new CircuitBreaker(async (config, limit) => {
    const { listUrl, auth } = config;
    const separator = listUrl.includes('?') ? '&' : '?';
    const finalUrl = `${listUrl}${separator}countrieISOcode=US`;
    const { data } = await axios.get(
        finalUrl,
        {
            headers: {
                'Authorization': auth.app_key,
                'payload': auth.app_id,
                'Accept': 'application/json'
            }
        }
    );
    return data;
}, breakerOptions);

async function fetchGoWebSurveys(config, limit = 50) {
    try {
        const data = await fetchBreaker.fire(config, limit);

        if (!data || !data.surveys) return [];

        return data.surveys
            .slice(0, limit)
            .map(normalizeGoWebSurvey);
    } catch (error) {
        if (error.message === 'Open' || error.message === 'HalfOpen') {
            console.error('[GoWebBreaker] Circuit is OPEN. Skipping fetch.');
        } else {
            console.error('Error fetching GoWebSurveys:', error.message);
        }
        return [];
    }
}

function normalizeGoWebSurvey(survey) {
    return {
        provider: "goweb",
        providerSurveyId: survey.surveyID,
        title: survey.projectBrief || 'No Description available',
        payout: parseFloat(survey.surveyCPI) || 0,
        duration: survey.LOI ? `${survey.LOI} mins` : 'Flexible',
        qualifications: [], // GoWeb usually sends these via a separate qualification endpoint
        quota: { target_count: survey.surveyTargetCount },
        status: 'active',
        raw_data: survey
    };
}

const qualificationBreaker = new CircuitBreaker(async (config, surveyId) => {
    const { qualification_url, auth } = config;
    const { data } = await axios.post(
        qualification_url,
        {
            surveyID: surveyId
        },
        {
            headers: {
                'Authorization': auth.app_key,
                'payload': auth.app_id,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    );
    return data;
}, breakerOptions);

async function fetchGoWebQualifications(config, surveyId) {
    try {
        const { qualification_url } = config;
        if (!qualification_url) return {};

        const data = await qualificationBreaker.fire(config, surveyId);

        // GoWeb returns nested data in 'targeting'
        return data?.targeting || {};
    } catch (error) {
        if (error.message === 'Open' || error.message === 'HalfOpen') {
            // Already logged by fetchBreaker or similar pattern
        } else {
            console.error(`Error fetching GoWeb Qualifications for ${surveyId}:`, error.message);
        }
        return {};
    }
}

async function registerSurvey(config, surveyId, panelistId, ipAddress, clickId) {
    try {
        const { baseUrl, auth } = config;
        const registerUrl = `${baseUrl}/register`;

        // Use a default or config backend URL for callbacks
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const callbackBase = `${backendUrl}/api/survey/callback/goweb?clickId=${clickId}`;

        const payload = {
            surveyID: parseInt(surveyId),
            SuccessLink: `${callbackBase}&status=success&uid=${panelistId}`,
            disQualifiedLink: `${callbackBase}&status=disqualify&uid=${panelistId}`,
            TermLink: `${callbackBase}&status=terminate&uid=${panelistId}`,
            OverQuotaLink: `${callbackBase}&status=overquota&uid=${panelistId}`,
            useStaticLink: 0
        };

        const { data } = await axios.post(
            registerUrl,
            payload,
            {
                headers: {
                    'Authorization': auth.app_key,
                    'payload': String(auth.app_id),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (data.surveyInfo?.[0]?.SurveyEntryUrl) {
            let entryUrl = data.surveyInfo[0].SurveyEntryUrl;
            // Append panelist ID for tracking
            const separator = entryUrl.includes('?') ? '&' : '?';
            return `${entryUrl}${separator}pid=${panelistId}`;
        }

        throw new Error(data.apiMessages || 'Failed to register GoWeb survey');
    } catch (error) {
        console.error(`Error registering GoWeb survey ${surveyId}:`, error.message);
        throw error;
    }
}

module.exports = { fetchGoWebSurveys, fetchGoWebQualifications, registerSurvey };

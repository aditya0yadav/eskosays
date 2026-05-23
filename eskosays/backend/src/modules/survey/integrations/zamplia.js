const axios = require('axios');
const CircuitBreaker = require('opossum');

const breakerOptions = {
    timeout: 50000,
    errorThresholdPercentage: 50,
    resetTimeout: 25 * 60 * 1000 // 25 minutes
};

const fetchBreaker = new CircuitBreaker(async (config, limit) => {
    const { listUrl, auth } = config;
    const separator = listUrl.includes('?') ? '&' : '?';
    const finalUrl = `${listUrl}${separator}LanguageCode=En-US`;
    const { data } = await axios.get(
        finalUrl,
        {
            headers: {
                "accept": "application/json",
                "ZAMP-KEY": auth.app_key
            }
        }
    );
    return data;
}, breakerOptions);

async function fetchZampliaSurveys(config, limit = 50) {
    try {
        const data = await fetchBreaker.fire(config, limit);

        if (!data || !data.result || !data.result.data) return [];

        return data.result.data
            .slice(0, limit)
            .map(normalizeZampliaSurvey);
    } catch (error) {
        if (error.message === 'Open' || error.message === 'HalfOpen') {
            console.error('[ZampliaBreaker] Circuit is OPEN. Skipping fetch.');
        } else {
            console.error('Error fetching ZampliaSurveys:', error.message);
        }
        return [];
    }
}

function normalizeZampliaSurvey(survey) {
    return {
        provider: "zamplia",
        providerSurveyId: survey.SurveyId,
        title: survey.Name || `Survey #${survey.SurveyId}`,
        payout: parseFloat(survey.CPI) || 0,
        duration: survey.LOI ? `${survey.LOI} mins` : 'Flexible',
        qualifications: [],
        quota: { total_required: survey.TotalCompleteRequired },
        status: "active",
        raw_data: survey
    };
}

const qualificationBreaker = new CircuitBreaker(async (config, surveyId) => {
    const { qualification_url, auth } = config;
    const { data } = await axios.get(
        `${qualification_url}?SurveyId=${surveyId}`,
        {
            headers: {
                "accept": "application/json",
                "ZAMP-KEY": auth.app_key
            }
        }
    );
    return data;
}, breakerOptions);

async function fetchZampliaQualifications(config, surveyId) {
    try {
        const { qualification_url } = config;
        if (!qualification_url || !surveyId) return [];

        const data = await qualificationBreaker.fire(config, surveyId);

        // Zamplia returns specific qualification JSON for the survey in result.data
        return data?.result?.data || [];
    } catch (error) {
        if (error.message === 'Open' || error.message === 'HalfOpen') {
            // Already logged
        } else {
            console.error(`Error fetching Zamplia Qualifications for ${surveyId}:`, error.message);
        }
        return [];
    }
}

async function registerSurvey(config, surveyId, panelistId, ipAddress, clickId) {
    try {
        const { baseUrl, auth } = config;
        // Prefix our clickId with 'rs_' so the shared Zamplia callback can identify
        // this as a RealSays user (vs users from other services on the same Zamplia account)
        const transactionId = `rs_${clickId}`;
        const generateUrl = `${baseUrl}/GenerateLink?SurveyId=${surveyId}&IpAddress=${ipAddress}&TransactionId=${transactionId}`;

        const { data } = await axios.get(
            generateUrl,
            {
                headers: {
                    "accept": "application/json",
                    "ZAMP-KEY": auth.app_key
                }
            }
        );

        if (data.success && data.result?.data?.[0]?.LiveLink) {
            return data.result.data[0].LiveLink;
        }

        throw new Error(data.message || 'Failed to generate Zamplia link');
    } catch (error) {
        console.error(`Error registering Zamplia survey ${surveyId}:`, error.message);
        throw error;
    }
}

module.exports = { fetchZampliaSurveys, fetchZampliaQualifications, registerSurvey };

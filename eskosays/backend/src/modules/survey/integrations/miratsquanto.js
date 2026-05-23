const axios = require('axios');

async function fetchMiratsQuantoSurveys(config, limit = 50) {
    try {
        const { listUrl, auth } = config;
        const { data } = await axios.get(
            listUrl,
            {
                headers: {
                    Authorization: `Bearer ${auth.app_key}`
                }
            }
        );

        if (!data || !data.data) return [];

        return data.data
            .slice(0, limit)
            .map(normalizeMiratsSurvey);
    } catch (error) {
        console.error('Error fetching MiratsQuantoSurveys:', error.message);
        return [];
    }
}

function normalizeMiratsSurvey(survey) {
    return {
        provider: "miratsquanto",
        providerSurveyId: survey.id,
        title: survey.title,
        payout: survey.cpi,
        qualifications: survey.qualifications,
        quota: survey.quota,
        status: survey.status,
        raw_data: survey
    };
}

module.exports = { fetchMiratsQuantoSurveys };

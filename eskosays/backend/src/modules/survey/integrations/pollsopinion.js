const axios = require('axios');

async function fetchPollsOpinionSurveys(config, limit = 50) {
    try {
        const { listUrl, auth } = config;
        const { data } = await axios.get(
            listUrl,
            {
                headers: {
                    Authorization: auth.app_key
                }
            }
        );

        if (!data || !data.surveys) return [];

        return data.surveys
            .slice(0, limit)
            .map(normalizePollsSurvey);
    } catch (error) {
        console.error('Error fetching PollsOpinionSurveys:', error.message);
        return [];
    }
}

function normalizePollsSurvey(survey) {
    return {
        provider: "pollsopinion",
        providerSurveyId: survey.survey_id,
        title: survey.title,
        payout: survey.payout,
        qualifications: survey.quals,
        quota: survey.quota,
        status: survey.live ? "active" : "inactive",
        raw_data: survey
    };
}

module.exports = { fetchPollsOpinionSurveys };

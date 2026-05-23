const Redis = require('ioredis');
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null
});

async function check() {
    try {
        const lastFetched = await redis.get('survey_registry_last_fetched');
        console.log('--- Redis Cache Status ---');
        if (lastFetched) {
            console.log('Last Fetched:', new Date(parseInt(lastFetched)).toString());
        } else {
            console.log('Last Fetched: Never/Expired');
        }

        const registry = await redis.get('survey_registry');
        if (registry) {
            const data = JSON.parse(registry);
            console.log(`Total Surveys: ${data.length}`);
            console.log('--- Cached Survey IDs ---');
            data.forEach((s, index) => {
                // Try to find the payout and title for better context
                const payout = s.payout || s.surveyCPI || 'N/A';
                const id = s.providerSurveyId || s.surveyID || 'Unknown';
                console.log(`${index + 1}. [${s.provider}] ID: ${id} | Payout: $${payout}`);
            });
        } else {
            console.log('Registry is empty.');
        }

        redis.disconnect();
    } catch (error) {
        console.error('Error:', error);
        redis.disconnect();
    }
}

check();

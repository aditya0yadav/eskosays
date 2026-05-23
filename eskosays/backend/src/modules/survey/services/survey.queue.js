const { Queue } = require('bullmq');
const redis = require('../../../config/redis');

const surveyFetchQueue = new Queue('survey-fetch', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000, // 5s, 10s, 20s
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

/**
 * Add a job to fetch surveys from all providers
 */
async function addSurveyFetchJob(force = false) {
    await surveyFetchQueue.add('refresh-registry', { force }, {
        // Prevent duplicate jobs if one is already pending/active
        jobId: 'refresh-registry-singleton'
    });
}

module.exports = { surveyFetchQueue, addSurveyFetchJob };

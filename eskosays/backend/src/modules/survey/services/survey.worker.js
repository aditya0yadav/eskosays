const { Worker } = require('bullmq');
const redis = require('../../../config/redis');
const surveyService = require('./survey.service');

const surveyWorker = new Worker('survey-fetch', async (job) => {
    if (job.name === 'refresh-registry') {
        const { force } = job.data;
        await surveyService.refreshSurveyRegistry(force);
    }
}, {
    connection: redis,
    concurrency: 1 // Only one fetch at a time per worker instance
});

surveyWorker.on('failed', (job, err) => {
    console.error(`[SurveyWorker] Job ${job.id} failed:`, err.message);
});

module.exports = surveyWorker;

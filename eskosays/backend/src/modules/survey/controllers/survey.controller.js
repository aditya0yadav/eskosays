const surveyService = require('../services/survey.service');

class SurveyController {
    /**
     * Get all surveys from integrated providers
     */
    async getSurveys(req, res, next) {
        try {
            const surveys = await surveyService.getAllSurveys(req.panelistId);
            res.status(200).json({
                success: true,
                count: surveys.length,
                data: surveys
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Initiate survey entry
     */
    async initiateSurvey(req, res, next) {
        try {
            const { provider, surveyId } = req.params;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            const result = await surveyService.initiateSurvey(
                req.panelistId,
                provider,
                surveyId,
                ipAddress
            );

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SurveyController();

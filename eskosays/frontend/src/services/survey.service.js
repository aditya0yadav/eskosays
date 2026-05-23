import api from './api';

/**
 * Service to handle survey-related API calls
 */
const surveyService = {
    /**
     * Fetch aggregated surveys from the backend
     * @returns {Promise<Array>} List of normalized surveys
     */
    getSurveys: async () => {
        try {
            const { data } = await api.get('/survey');
            if (data.success) {
                return data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching surveys:', error);
            return [];
        }
    },

    /**
     * Initiate survey entry
     * @param {string} provider Provider slug (goweb, zamplia)
     * @param {string} surveyId Provider survey ID
     * @returns {Promise<Object>} The entry link and click ID
     */
    initiateSurvey: async (provider, surveyId) => {
        try {
            const { data } = await api.get(`/survey/${provider}/${surveyId}/initiate`);
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Failed to initiate survey');
        } catch (error) {
            console.error('Error initiating survey:', error);
            throw error;
        }
    }
};

export default surveyService;

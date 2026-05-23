import api from './api';

const personaService = {
    /**
     * Get all profile questions
     */
    getQuestions: async () => {
        const response = await api.get('/persona/questions');
        return response.data;
    },

    /**
     * Get current user's profile
     */
    getProfile: async () => {
        const response = await api.get('/persona/profile');
        return response.data;
    },

    /**
     * Update current user's profile
     * @param {Object} responses - Key-value pairs of attribute keys and values
     */
    updateProfile: async (responses) => {
        const response = await api.post('/persona/profile', { responses });
        return response.data;
    }
};

export default personaService;

import api from './api';

const userService = {
    /**
     * Get user profile info
     */
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    /**
     * Get consolidated user profile summary
     */
    getProfileSummary: async () => {
        const response = await api.get('/user/summary');
        return response.data;
    },

    /**
     * Update user profile details
     * @param {Object} data - The profile data to update
     */
    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    /**
     * Update user avatar
     * @param {File} file - The image file to upload
     */
    updateAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Get user wallet data
     */
    getWallet: async () => {
        const response = await api.get('/user/wallet');
        return response.data;
    },

    /**
     * Get home dashboard stats
     */
    getHomeStats: async () => {
        const response = await api.get('/user/home-stats');
        return response.data;
    }
};

export default userService;

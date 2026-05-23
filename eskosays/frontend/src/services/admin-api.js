import axios from 'axios';

export const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    const { hostname, protocol } = window.location;

    // In local development (localhost or IP), we use port 5000
    const isLocal = hostname === 'localhost' || /^(\d+\.){3}\d+$/.test(hostname);

    if (isLocal) {
        return `${protocol}//${hostname}:5000/api`;
    }

    // In production, try to use api. subdomain if not present
    const prodHost = hostname.startsWith('api.') ? hostname : `api.${hostname}`;
    return `${protocol}//${prodHost}/api`;
};
const adminApi = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add admin token
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// API Methods
const getDashboardStats = async (params = {}) => {
    const response = await adminApi.get('/admin/dashboard-stats', { params });
    return response.data;
};

const getInitialData = async () => {
    const response = await adminApi.get('/survey/mappings/initial-data');
    return response.data;
};

const getProviderMappings = async (providerId) => {
    const response = await adminApi.get(`/survey/mappings/${providerId}`);
    return response.data;
};

const saveAttributeMapping = async (data) => {
    const response = await adminApi.post('/survey/mappings/attribute', data);
    return response.data;
};

const saveOptionMapping = async (data) => {
    const response = await adminApi.post('/survey/mappings/option', data);
    return response.data;
};

export const adminService = {
    getDashboardStats,
    getInitialData,
    // --- User Management ---
    getUsers: async (params = {}) => {
        const response = await adminApi.get('/admin/users', { params });
        return response.data;
    },

    getUserDetails: async (userId) => {
        const response = await adminApi.get(`/admin/users/${userId}`);
        return response.data;
    },

    getLeaderboard: async () => {
        const response = await adminApi.get('/admin/leaderboard');
        return response.data;
    },

    // --- Provider Mappings ---
    getProviderMappings, // Kept existing method
    saveAttributeMapping,
    saveOptionMapping,

    // --- Provider Management ---
    getProviders: async () => {
        const response = await adminApi.get('/admin/providers');
        return response.data;
    },

    updateProviderStatus: async (providerId, isActive) => {
        const response = await adminApi.patch(`/admin/providers/${providerId}`, { is_active: isActive });
        return response.data;
    }
};

export default adminApi;

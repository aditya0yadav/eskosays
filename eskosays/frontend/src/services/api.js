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

export const getAssetUrl = (path) => {
    if (!path) return null;
    if (!path.startsWith('/uploads')) return path;

    const apiUrl = import.meta.env.VITE_API_URL;
    let baseUrl;

    if (apiUrl) {
        // SAFE REGEX: Only strip /api from the END of the string
        // This prevents 'https://api.domain.com/api' from becoming 'https:/.domain.com/api'
        baseUrl = apiUrl.replace(/\/api\/?$/, '');
    } else {
        const { hostname, protocol } = window.location;
        const isLocal = hostname === 'localhost' || /^(\d+\.){3}\d+$/.test(hostname);

        if (isLocal) {
            baseUrl = `${protocol}//${hostname}:5000`;
        } else {
            // In production fallback, use the api. subdomain
            const prodHost = hostname.startsWith('api.') ? hostname : `api.${hostname}`;
            baseUrl = `${protocol}//${prodHost}`;
        }
    }

    return `${baseUrl}${path}`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            console.error('Frontend API Error: 401 Unauthorized at', originalRequest.url);

            if (!originalRequest._retry) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        // Attempting token refresh
                        const { data } = await axios.post(`${getBaseURL()}/auth/refresh`, {
                            refreshToken,
                        });

                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        console.error('Frontend: Refresh failed', refreshError);
                    }
                } else {
                    console.warn('Frontend: No refresh token available for 401 retry');
                }
            }

            // If we get here, refresh either didn't happen or failed
            console.warn('Frontend: Redirecting to login due to persistent 401');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;

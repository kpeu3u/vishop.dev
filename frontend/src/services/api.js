
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API methods
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        // Clear local storage
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/user/profile');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/api/auth/refresh');
        return response.data;
    },
};

// Profile API methods with proper error handling
export const profileAPI = {
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.post('/api/user/profile/change-password', {
                currentPassword,
                newPassword,
                confirmPassword,
            });
            return response.data;
        } catch (error) {
            // Re-throw with standardized format
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Network error occurred'
                    }
                }
            };
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/user/profile/update', profileData);
            return response.data;
        } catch (error) {
            // Re-throw with standardized format
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Network error occurred'
                    }
                }
            };
        }
    },
};

export default api;

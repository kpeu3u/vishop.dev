
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
    console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null'); // Debug log
    
    if (token) {
        console.log('Adding token to request:', token.substring(0, 20) + '...'); // Debug log
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log('No token found in localStorage'); // Debug log
    }
    
    console.log('Request headers:', config.headers); // Debug log
    return config;
});

// Handle authentication errors - but don't auto-logout on page refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error.response?.status, error.response?.data); // Debug log
        
        // Only auto-logout and redirect on 401 for specific conditions:
        // 1. Not a login attempt
        // 2. Not a profile/user verification request (which happens on page refresh)
        // 3. Not already on login page
        const isLoginRequest = error.config?.url?.includes('/api/auth/login');
        const isProfileRequest = error.config?.url?.includes('/api/user/profile');
        const isOnLoginPage = window.location.pathname === '/login';
        
        if (error.response?.status === 401 && !isLoginRequest && !isProfileRequest && !isOnLoginPage) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
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

    // Password reset methods
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
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

    validateResetToken: async (token) => {
        try {
            const response = await api.post('/api/auth/validate-reset-token', { token });
            return response.data;
        } catch (error) {
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

    resetPassword: async (token, password, confirmPassword) => {
        try {
            const response = await api.post('/api/auth/reset-password', {
                token,
                password,
                confirmPassword,
            });
            return response.data;
        } catch (error) {
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

// Product API methods
export const productAPI = {
    getProducts: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                    params.append(key, filters[key]);
                }
            });

            const response = await api.get(`/api/products${params.toString() ? `?${params.toString()}` : ''}`);
            return response.data;
        } catch (error) {
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

    searchProducts: async (searchTerm) => {
        try {
            const response = await api.get(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
            return response.data;
        } catch (error) {
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

    getProduct: async (id) => {
        try {
            const response = await api.get(`/api/products/${id}`);
            return response.data;
        } catch (error) {
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

    createProduct: async (productData) => {
        try {
            const response = await api.post('/api/products', productData);
            return response.data;
        } catch (error) {
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Network error occurred',
                        errors: error.response?.data?.errors || {}
                    }
                }
            };
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/api/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Network error occurred',
                        errors: error.response?.data?.errors || {}
                    }
                }
            };
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/api/products/${id}`);
            return response.data;
        } catch (error) {
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

    getMyProducts: async () => {
        try {
            const response = await api.get('/api/products/my-products');
            return response.data;
        } catch (error) {
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

    followProduct: async (id) => {
        try {
            const response = await api.post(`/api/products/${id}/follow`);
            return response.data;
        } catch (error) {
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

    unfollowProduct: async (id) => {
        try {
            const response = await api.delete(`/api/products/${id}/unfollow`);
            return response.data;
        } catch (error) {
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

    getFollowedProducts: async () => {
        try {
            const response = await api.get('/api/products/followed');
            return response.data;
        } catch (error) {
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Network error occurred'
                    }
                }
            };
        }
    }
};

export default api;

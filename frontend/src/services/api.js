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
    } else {
        console.log('No token found in localStorage'); // Debug log
    }
    return config;
});

// Update the response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const refreshResponse = await api.post('/api/token/refresh', {
                        refresh_token: refreshToken
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (refreshResponse.data.token) {
                        localStorage.setItem('jwt_token', refreshResponse.data.token);
                        if (refreshResponse.data.refresh_token) {
                            localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
                        }

                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear all tokens and redirect to login
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

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
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const refreshResponse = await api.post('/api/token/refresh', {
                refresh_token: refreshToken
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Store new tokens
            if (refreshResponse.data.token) {
                localStorage.setItem('jwt_token', refreshResponse.data.token);
            }
            if (refreshResponse.data.refresh_token) {
                localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
            }

            return refreshResponse.data;
        } catch (error) {
            // If refresh fails, clear all tokens
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            throw {
                response: {
                    data: {
                        success: false,
                        error: error.response?.data?.error || 'Token refresh failed'
                    }
                }
            };
        }
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
            const response = await api.post('/api/user/change-password', {
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
            const response = await api.put('/api/user/update', profileData);
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

// Vehicle API methods
export const vehicleAPI = {
    getVehicles: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                    params.append(key, filters[key]);
                }
            });

            const response = await api.get(`/api/vehicles${params.toString() ? `?${params.toString()}` : ''}`);
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

    searchVehicles: async (searchTerm) => {
        try {
            const response = await api.get(`/api/vehicles/search?q=${encodeURIComponent(searchTerm)}`);
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

    getVehicle: async (id) => {
        try {
            const response = await api.get(`/api/vehicles/${id}`);
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

    createVehicle: async (vehicleData) => {
        try {
            const response = await api.post('/api/vehicles', vehicleData);
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

    updateVehicle: async (id, vehicleData) => {
        try {
            const response = await api.put(`/api/vehicles/${id}`, vehicleData);
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

    deleteVehicle: async (id) => {
        try {
            const response = await api.delete(`/api/vehicles/${id}`);
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

    getMyVehicles: async () => {
        try {
            const response = await api.get('/api/vehicles/my-vehicles');
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

    followVehicle: async (id) => {
        try {
            const response = await api.post(`/api/vehicles/${id}/follow`);
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

    unfollowVehicle: async (id) => {
        try {
            const response = await api.delete(`/api/vehicles/${id}/unfollow`);
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

    getFollowedVehicles: async () => {
        try {
            const response = await api.get('/api/vehicles/followed');
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

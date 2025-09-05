import {makeAutoObservable, runInAction} from 'mobx';
import {authAPI} from '../services/api';

class AuthStore {
    user = null;
    isAuthenticated = false;
    isLoading = false;
    error = null;
    successMessage = null;
    validationErrors = {};

    constructor() {
        makeAutoObservable(this);
        this.initAuth();
    }

    // Helper method to decode JWT token
    decodeJWT(token) {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    initAuth() {
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user_data');
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                const jwtPayload = this.decodeJWT(token);

                // Create a complete user object by merging stored data with JWT data
                const completeUser = {
                    id: user.id || jwtPayload?.id,
                    email: user.email || jwtPayload?.email,
                    fullName: user.fullName || jwtPayload?.fullName || jwtPayload?.username || user.email,
                    roles: user.roles || jwtPayload?.roles || []
                };

                // If the stored user data was incomplete, update it
                if (!user.fullName && jwtPayload?.fullName) {
                    localStorage.setItem('user_data', JSON.stringify(completeUser));
                }

                runInAction(() => {
                    this.user = completeUser;
                    this.isAuthenticated = true;
                });
                this.verifyToken();
            } catch (error) {
                this.logout();
            }
        } else if (token && !userData) {
            // Handle case where we have token but no user data - extract from JWT
            try {
                const jwtPayload = this.decodeJWT(token);
                if (jwtPayload) {
                    const userFromJWT = {
                        id: jwtPayload.id,
                        email: jwtPayload.email || jwtPayload.username,
                        fullName: jwtPayload.fullName || jwtPayload.username,
                        roles: jwtPayload.roles || []
                    };

                    localStorage.setItem('user_data', JSON.stringify(userFromJWT));

                    runInAction(() => {
                        this.user = userFromJWT;
                        this.isAuthenticated = true;
                    });
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        }
    }

    // Update the login method to store refresh token
    async login(email, password) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await authAPI.login(email, password);
            if (response.token) {
                let user;

                // Check if response includes user data (from our custom listener)
                if (response.user) {
                    user = response.user;
                } else {
                    // Fallback: extract user data from JWT token
                    const jwtPayload = this.decodeJWT(response.token);
                    user = {
                        id: jwtPayload?.id,
                        email: email,
                        roles: jwtPayload?.roles || [],
                        fullName: jwtPayload?.fullName
                    };
                }

                localStorage.setItem('jwt_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(user));
                
                // Store refresh token if provided
                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                }

                runInAction(() => {
                    this.user = user;
                    this.isAuthenticated = true;
                    this.isLoading = false;
                });

                return { success: true };
            } else {
                throw new Error('No token received from server');
            }
        } catch (error) {

            // Handle different types of errors
            let errorMessage;
            
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.message || 'Invalid request';
                } else if (error.response.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = error.response.data?.message || 'Login failed';
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Unable to connect to server. Please check your connection.';
            } else {
                // Other error
                errorMessage = error.message || 'Login failed';
            }
            
            runInAction(() => {
                this.error = errorMessage;
                this.isLoading = false;
            });
            return { success: false, error: errorMessage };
        }
    }

    async register(userData) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.successMessage = null;
            this.validationErrors = {};
        });

        try {
            const response = await authAPI.register(userData);
            
            // Check if registration was successful based on the backend response structure
            // Backend returns: { message: "User created successfully", user: {...} }
            if (response.message && response.user) {
                runInAction(() => {
                    this.successMessage = 'Registration successful! Please log in to continue.';
                    this.isLoading = false;
                });
                return { 
                    success: true, 
                    message: 'Registration successful! Please log in to continue.',
                    user: response.user 
                };
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
            return { success: false };
        }
    }

    handleError(error) {
        if (error.response?.data?.errors) {
            // Handle validation errors array from backend
            if (Array.isArray(error.response.data.errors)) {
                this.error = error.response.data.errors.join(', ');
            } else {
                this.validationErrors = error.response.data.errors;
                this.error = 'Please fix the validation errors';
            }
        } else if (error.response?.data?.error) {
            this.error = error.response.data.error;
        } else if (error.response?.status >= 500) {
            this.error = 'Server error. Please try again later.';
        } else {
            this.error = error.message || 'An error occurred during registration';
        }
    }

    setSuccessMessage(message) {
        runInAction(() => {
            this.successMessage = message;
        });
    }

    clearMessages() {
        runInAction(() => {
            this.error = null;
            this.successMessage = null;
            this.validationErrors = {};
        });
    }

    // Update logout method to clear refresh token
    async logout() {
        runInAction(() => {
            this.isLoading = true;
        });

        try {
            await authAPI.logout();
        } catch (error) {
            // Even if API call fails, we should clear local state
            console.warn('Logout API call failed:', error);
        }

        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');

        runInAction(() => {
            this.user = null;
            this.isAuthenticated = false;
            this.isLoading = false;
            this.error = null;
        });
    }

    // Add manual refresh token method
    async refreshToken() {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await authAPI.refreshToken();

            // Update user data if provided
            if (response.user) {
                runInAction(() => {
                    this.user = response.user;
                });
                localStorage.setItem('user_data', JSON.stringify(response.user));
            }

            runInAction(() => {
                this.isLoading = false;
            });

            return { success: true };
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });

            // If refresh fails, logout user
            await this.logout();
            return { success: false };
        }
    }

    // Verify token method for explicit verification only
    async verifyToken() {
        try {
            console.log('Verifying token...'); // Debug log
            const userData = await authAPI.getCurrentUser();
            runInAction(() => {
                this.updateUser(userData);
            });
            return { success: true };
        } catch (error) {
            console.log('Token verification failed:', error); // Debug log
            // Only logout if it's an authentication error
            if (error.response?.status === 401 || error.response?.status === 403) {
                await this.logout();
            }
            return { success: false, error: error.message };
        }
    }

    updateUser(userData) {
        this.user = userData;
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    clearError() {
        runInAction(() => {
            this.error = null;
        });
    }

    hasRole(role) {
        return this.user?.roles?.includes(role) || false;
    }

    isMerchant() {
        return this.hasRole('ROLE_MERCHANT');
    }

    isBuyer() {
        return this.hasRole('ROLE_BUYER');
    }
}
export default new AuthStore();

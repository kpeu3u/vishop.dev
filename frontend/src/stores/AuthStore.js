import {makeAutoObservable, runInAction} from 'mobx';
import {authAPI} from '../services/api';

class AuthStore {
    user = null;
    isAuthenticated = false;
    isLoading = false;
    error = null;

    constructor() {
        makeAutoObservable(this);
        this.initAuth();
    }

    // Helper method to decode JWT token
    decodeJWT(token) {
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded;
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    initAuth() {
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user_data');

        console.log('InitAuth - Token exists:', !!token); // Debug log
        console.log('InitAuth - User data exists:', !!userData); // Debug log

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                
                // If user data doesn't have roles, extract them from JWT token
                if (!user.roles && token) {
                    const jwtPayload = this.decodeJWT(token);
                    if (jwtPayload && jwtPayload.roles) {
                        user.roles = jwtPayload.roles;
                        // Update localStorage with the enhanced user data
                        localStorage.setItem('user_data', JSON.stringify(user));
                    }
                }

                runInAction(() => {
                    this.user = user;
                    this.isAuthenticated = true;
                });
                
                console.log('InitAuth - User set:', this.user); // Debug log
                console.log('InitAuth - User roles:', this.user?.roles); // Debug log
                console.log('InitAuth - isMerchant():', this.isMerchant()); // Debug log
                console.log('InitAuth - isBuyer():', this.isBuyer()); // Debug log
                
            } catch (error) {
                console.log('InitAuth - Error parsing user data:', error); // Debug log
                this.logout();
            }
        }
    }

    async login(email, password) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await authAPI.login(email, password);

            console.log('Login response:', response); // Debug log

            if (response.token) {
                let user = response.user || { email };
                
                // Extract roles from JWT token if not present in user object
                if (!user.roles) {
                    const jwtPayload = this.decodeJWT(response.token);
                    if (jwtPayload && jwtPayload.roles) {
                        user.roles = jwtPayload.roles;
                    }
                }

                localStorage.setItem('jwt_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(user));

                runInAction(() => {
                    this.user = user;
                    this.isAuthenticated = true;
                    this.isLoading = false;
                });

                console.log('Login successful - Token stored:', response.token.substring(0, 20) + '...'); // Debug log
                console.log('Login successful - User data:', this.user); // Debug log
                console.log('Login successful - User roles:', this.user?.roles); // Debug log

                return { success: true };
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error); // Debug logging
            
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
        });

        try {
            const response = await authAPI.register(userData);
            runInAction(() => {
                this.isLoading = false;
            });
            return { success: true, data: response };
        } catch (error) {
            console.error('Registration error:', error); // Debug logging
            
            let errorMessage;
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid registration data';
            } else {
                errorMessage = 'Registration failed. Please try again.';
            }
            
            runInAction(() => {
                this.error = errorMessage;
                this.isLoading = false;
            });
            return { success: false, error: errorMessage };
        }
    }

    async logout() {
        console.log('Logout called'); // Debug log
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
        localStorage.removeItem('user_data');

        runInAction(() => {
            this.user = null;
            this.isAuthenticated = false;
            this.isLoading = false;
            this.error = null;
        });
    }

    // Verify token method for explicit verification only (when needed)
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
        console.log('hasRole check:', role, 'User roles:', this.user?.roles, 'Result:', this.user?.roles?.includes(role)); // Debug log
        return this.user?.roles?.includes(role) || false;
    }

    isMerchant() {
        const result = this.hasRole('ROLE_MERCHANT');
        console.log('isMerchant() result:', result); // Debug log
        return result;
    }

    isBuyer() {
        const result = this.hasRole('ROLE_BUYER');
        console.log('isBuyer() result:', result); // Debug log
        return result;
    }
}
export default new AuthStore();

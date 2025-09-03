import {makeAutoObservable} from 'mobx';
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

    initAuth() {
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                this.user = JSON.parse(userData);
                this.isAuthenticated = true;
                // Optionally verify token is still valid
                this.verifyToken();
            } catch (error) {
                this.logout();
            }
        }
    }

    async login(email, password) {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await authAPI.login(email, password);

            if (response.token) {
                localStorage.setItem('jwt_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(response.user || { email }));

                this.user = response.user || { email };
                this.isAuthenticated = true;
                this.isLoading = false;

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
            
            this.error = errorMessage;
            this.isLoading = false;
            return { success: false, error: errorMessage };
        }
    }

    async register(userData) {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await authAPI.register(userData);
            this.isLoading = false;
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
            
            this.error = errorMessage;
            this.isLoading = false;
            return { success: false, error: errorMessage };
        }
    }

    async logout() {
        this.isLoading = true;

        try {
            await authAPI.logout();
        } catch (error) {
            // Even if API call fails, we should clear local state
            console.warn('Logout API call failed:', error);
        }

        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');

        this.user = null;
        this.isAuthenticated = false;
        this.isLoading = false;
        this.error = null;
    }

    async verifyToken() {
        try {
            this.user = await authAPI.getCurrentUser();
        } catch (error) {
            // Token is invalid, logout user
            await this.logout();
        }
    }

    updateUser(userData) {
        this.user = userData;
        localStorage.setItem('user_data', JSON.stringify(userData));
    }


    clearError() {
        this.error = null;
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

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
            this.error = error.response?.data?.message || error.message || 'Login failed';
            this.isLoading = false;
            return { success: false, error: this.error };
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
            this.error = error.response?.data?.message || error.message || 'Registration failed';
            this.isLoading = false;
            return { success: false, error: this.error };
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

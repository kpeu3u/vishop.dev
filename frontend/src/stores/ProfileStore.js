
import { makeAutoObservable, runInAction } from 'mobx';
import { profileAPI } from '../services/api';

class ProfileStore {
    isLoading = false;
    error = null;
    successMessage = null;
    validationErrors = {};

    constructor() {
        makeAutoObservable(this);
    }

    clearMessages() {
        this.error = null;
        this.successMessage = null;
        this.validationErrors = {};
    }

    validatePasswordChange(data) {
        const errors = {};

        if (!data.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!data.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (data.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters long';
        }

        if (!data.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (data.newPassword !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    validateProfileUpdate(data) {
        const errors = {};

        if (data.fullName !== undefined) {
            if (!data.fullName || data.fullName.trim().length < 2) {
                errors.fullName = 'Full name must be at least 2 characters long';
            }
        }

        if (data.email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!data.email || !emailRegex.test(data.email)) {
                errors.email = 'Please enter a valid email address';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    async changePassword(passwordData) {
        // Clear previous messages
        this.clearMessages();

        // Client-side validation
        const validation = this.validatePasswordChange(passwordData);
        if (!validation.isValid) {
            runInAction(() => {
                this.validationErrors = validation.errors;
            });
            return { success: false, errors: validation.errors };
        }

        runInAction(() => {
            this.isLoading = true;
        });

        try {
            const response = await profileAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            );

            runInAction(() => {
                this.isLoading = false;
                if (response.success) {
                    this.successMessage = response.message;
                } else {
                    this.error = response.error;
                }
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to change password';

            runInAction(() => {
                this.isLoading = false;
                this.error = errorMessage;
            });

            return { success: false, error: errorMessage };
        }
    }

    async updateProfile(profileData, authStore) {
        // Clear previous messages
        this.clearMessages();

        // Client-side validation
        const validation = this.validateProfileUpdate(profileData);
        if (!validation.isValid) {
            runInAction(() => {
                this.validationErrors = validation.errors;
            });
            return { success: false, errors: validation.errors };
        }

        runInAction(() => {
            this.isLoading = true;
        });

        try {
            const response = await profileAPI.updateProfile(profileData);

            runInAction(() => {
                this.isLoading = false;
                if (response.success) {
                    this.successMessage = response.message;
                    // Update auth store with new user data
                    if (response.user) {
                        authStore.updateUser(response.user);
                    }
                } else {
                    this.error = response.error;
                }
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile';

            runInAction(() => {
                this.isLoading = false;
                this.error = errorMessage;
            });

            return { success: false, error: errorMessage };
        }
    }
}

export default new ProfileStore();
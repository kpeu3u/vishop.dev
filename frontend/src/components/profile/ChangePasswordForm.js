import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import profileStore from '../../stores/ProfileStore';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ChangePasswordForm = observer(() => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data) => {
        const result = await profileStore.changePassword(data);

        if (result.success) {
            reset(); // Clear form on success
        }
    };

    return (
        <div className="change-password-form">
            <div className="form-card">
                <h3>Change Password</h3>

                {/* Success Message */}
                {profileStore.successMessage && (
                    <div className="alert alert-success">
                        {profileStore.successMessage}
                    </div>
                )}

                {/* Error Message */}
                {profileStore.error && (
                    <div className="alert alert-error">
                        {profileStore.error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            {...register('currentPassword')}
                            autoComplete="current-password"
                            className={`form-control ${errors.currentPassword ? 'error' : ''}`}
                        />
                        {errors.currentPassword && (
                            <span className="field-error">{errors.currentPassword.message}</span>
                        )}
                        {profileStore.validationErrors.currentPassword && (
                            <span className="field-error">{profileStore.validationErrors.currentPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            {...register('newPassword')}
                            autoComplete="new-password"
                            className={`form-control ${errors.newPassword ? 'error' : ''}`}
                        />
                        {errors.newPassword && (
                            <span className="field-error">{errors.newPassword.message}</span>
                        )}
                        {profileStore.validationErrors.newPassword && (
                            <span className="field-error">{profileStore.validationErrors.newPassword}</span>
                        )}
                        <small className="form-text">Password must be at least 6 characters long</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            autoComplete="new-password"
                            className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error">{errors.confirmPassword.message}</span>
                        )}
                        {profileStore.validationErrors.confirmPassword && (
                            <span className="field-error">{profileStore.validationErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={profileStore.isLoading}
                        className="btn btn-primary"
                    >
                        {profileStore.isLoading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
});

export default ChangePasswordForm;

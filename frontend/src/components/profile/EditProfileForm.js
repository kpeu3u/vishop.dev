import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import profileStore from '../../stores/ProfileStore';

const editProfileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

const EditProfileForm = observer(() => {
    const authStore = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            fullName: authStore.user?.fullName || '',
            email: authStore.user?.email || ''
        }
    });

    useEffect(() => {
        if (authStore.user) {
            setValue('fullName', authStore.user.fullName);
            setValue('email', authStore.user.email);
        }
    }, [authStore.user, setValue]);

    const onSubmit = async (data) => {
        const result = await profileStore.updateProfile(data, authStore);

        if (result.success) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        reset({
            fullName: authStore.user?.fullName || '',
            email: authStore.user?.email || ''
        });
        setIsEditing(false);
        profileStore.clearMessages();
    };

    return (
        <div className="edit-profile-form">
            <div className="form-card">
                <div className="card-header">
                    <h3>Edit Profile</h3>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-outline-primary btn-sm"
                        >
                            Edit
                        </button>
                    )}
                </div>

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
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            {...register('fullName')}
                            disabled={!isEditing}
                            className={`form-control ${errors.fullName ? 'error' : ''}`}
                        />
                        {errors.fullName && (
                            <span className="field-error">{errors.fullName.message}</span>
                        )}
                        {profileStore.validationErrors.fullName && (
                            <span className="field-error">{profileStore.validationErrors.fullName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')}
                            disabled={!isEditing}
                            className={`form-control ${errors.email ? 'error' : ''}`}
                        />
                        {errors.email && (
                            <span className="field-error">{errors.email.message}</span>
                        )}
                        {profileStore.validationErrors.email && (
                            <span className="field-error">{profileStore.validationErrors.email}</span>
                        )}
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={profileStore.isLoading}
                                className="btn btn-primary"
                            >
                                {profileStore.isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={profileStore.isLoading}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
});

export default EditProfileForm;
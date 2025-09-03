import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';
import EditProfileForm from './EditProfileForm';
import './ProfilePage.css';

const ProfilePage = observer(() => {
    const authStore = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    if (!authStore.user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="row">
                    <div className="col-md-10 offset-md-1">
                        <h1 className="page-title">My Profile</h1>

                        <div className="profile-tabs">
                            <button
                                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile Information
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                Change Password
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'profile' && (
                                <div className="profile-info-section">
                                    <div className="user-info-card">
                                        <h3>Current Information</h3>
                                        <div className="user-info">
                                            <div className="info-item">
                                                <label>Full Name:</label>
                                                <span>{authStore.user.fullName}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Email:</label>
                                                <span>{authStore.user.email}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Roles:</label>
                                                <span>{authStore.user.roles?.join(', ')}</span>
                                            </div>
                                            <div className="info-item">
                                                <label>Status:</label>
                                                <div className="status-badges">
                                                    <span className={`badge ${authStore.user.isVerified ? 'verified' : 'unverified'}`}>
                                                        {authStore.user.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                    <span className={`badge ${authStore.user.isActive ? 'active' : 'inactive'}`}>
                                                        {authStore.user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <EditProfileForm />
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="password-section">
                                    <ChangePasswordForm />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProfilePage;

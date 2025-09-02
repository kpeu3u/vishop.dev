import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = observer(() => {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.logout();
        navigate('/');
    };

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    VShop
                </Link>

                <div className="nav-links">
                    <Link to="/vehicles">Browse Vehicles</Link>

                    {auth.isAuthenticated ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>

                            {auth.isMerchant() && (
                                <>
                                    <Link to="/my-vehicles">My Vehicles</Link>
                                    <Link to="/add-vehicle">Add Vehicle</Link>
                                </>
                            )}

                            {auth.isBuyer() && (
                                <Link to="/favorites">My Favorites</Link>
                            )}

                            <div className="user-menu">
                                <span>Welcome, {auth.user?.fullName}</span>
                                <Link to="/profile">Profile</Link>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login">Sign In</Link>
                            <Link to="/register" className="register-btn">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navigation;

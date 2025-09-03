import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './components/profile/ProfilePage';
import './App.css';

// Example dashboard component
const Dashboard = () => (
    <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
    </div>
);

const Home = () => (
    <div>
        <h1>Welcome to VShop</h1>
        <p>Your premier vehicle shopping destination</p>
    </div>
);

const Unauthorized = () => (
    <div>
        <h1>Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navigation />

                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                            <Route path="/reset-password" element={<ResetPasswordForm />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Protected routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Merchant-only routes */}
                            <Route
                                path="/add-vehicle"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_MERCHANT">
                                        <div>Add Vehicle Form (Merchant Only)</div>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Buyer-only routes */}
                            <Route
                                path="/favorites"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_BUYER">
                                        <div>Favorites Page (Buyer Only)</div>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

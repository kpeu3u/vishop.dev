import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from "./components/auth/RegistrationForm";
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './components/profile/ProfilePage';
import Dashboard from './components/dashboard/Dashboard';

// Vehicle Components
import VehicleList from './components/vehicles/VehicleList';
import VehicleDetail from './components/vehicles/VehicleDetail';
import VehicleForm from './components/vehicles/VehicleForm';
import MyVehicles from './components/vehicles/MyVehicles';
import FollowedVehicles from './components/vehicles/FollowedVehicles';

import './App.css';

const Home = () => (
    <div className="bg-light">
        <Container className="py-5">
            <Row className="text-center">
                <Col>
                    <h1 className="display-3 fw-bold text-primary mb-4">
                        Welcome to ViShop
                    </h1>
                    <p className="lead fs-4 text-muted mb-4">
                        Your premier vehicle shopping destination
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Link to="/vehicles" className="btn btn-primary btn-lg px-4 text-decoration-none">
                            Browse Vehicles
                        </Link>

                    </div>
                </Col>
            </Row>
        </Container>
        
        <Container className="py-5">
            <Row className="g-4">
                <Col md={4}>
                    <div className="text-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                            <i className="bi bi-car-front fs-1 text-primary" style={{ padding: '0 10px' }}></i>
                        </div>
                        <h4>Quality Vehicles</h4>
                        <p className="text-muted">
                            Browse through our extensive collection of quality vehicles
                        </p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="text-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                            <i className="bi bi-shield-check fs-1 text-success" style={{ padding: '0 10px' }}></i>
                        </div>
                        <h4>Trusted Sellers</h4>
                        <p className="text-muted">
                            Connect with verified and trusted vehicle sellers
                        </p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="text-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                            <i className="bi bi-lightning fs-1 text-info" style={{ padding: '0 10px' }}></i>
                        </div>
                        <h4>Fast & Easy</h4>
                        <p className="text-muted">
                            Quick and easy vehicle buying and selling process
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
);

const Unauthorized = () => (
    <Container className="my-5 text-center">
        <Row>
            <Col>
                <h1 className="display-1 text-danger">401</h1>
                <h2>Unauthorized</h2>
                <p className="text-muted">You don't have permission to access this page.</p>
            </Col>
        </Row>
    </Container>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App d-flex flex-column min-vh-100">
                    <Navigation />

                    <main className="flex-grow-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegistrationForm />} />
                            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                            <Route path="/reset-password" element={<ResetPasswordForm />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Public Vehicle Routes */}
                            <Route path="/vehicles" element={<VehicleList />} />
                            <Route path="/vehicles/:id" element={<VehicleDetail />} />

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
                                path="/vehicles/new"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_MERCHANT">
                                        <VehicleForm />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/vehicles/:id/edit"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_MERCHANT">
                                        <VehicleForm />
                                    </ProtectedRoute>
                                }
                            />
                            
                            <Route
                                path="/my-vehicles"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_MERCHANT">
                                        <MyVehicles />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Buyer-only routes */}
                            <Route
                                path="/followed"
                                element={
                                    <ProtectedRoute requiredRole="ROLE_BUYER">
                                        <FollowedVehicles />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Legacy route redirects */}
                            <Route path="/add-vehicle" element={<ProtectedRoute requiredRole="ROLE_MERCHANT"><VehicleForm /></ProtectedRoute>} />
                            <Route path="/favorites" element={<ProtectedRoute requiredRole="ROLE_BUYER"><FollowedVehicles /></ProtectedRoute>} />
                        </Routes>
                    </main>

                    <footer className="footer bg-light mt-auto">
                        <Container>
                            <Row>
                                <Col className="text-center">
                                    <p className="text-muted mb-0">
                                        © 2025 ViShop. All rights reserved.
                                    </p>
                                </Col>
                            </Row>
                        </Container>
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

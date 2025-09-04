import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import MessageAlert from '../common/MessageAlert';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['ROLE_BUYER', 'ROLE_MERCHANT'], {
        required_error: 'Please select a role',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const RegistrationForm = observer(() => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const watchedFields = watch(); // Watch all form fields

    // Clear error when user starts typing (but only after 500ms delay)
    useEffect(() => {
        if (auth.error && Object.keys(watchedFields).some(key => watchedFields[key])) {
            const timer = setTimeout(() => {
                auth.clearError();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [watchedFields, auth]);

    // Clear error when component mounts
    useEffect(() => {
        auth.clearError();
    }, [auth]);

    const onSubmit = async (data) => {
        const { confirmPassword, ...registerData } = data;
        registerData.roles = [data.role]; // Convert single role to array

        const result = await auth.register(registerData);

        if (result.success) {
            setShowSuccess(true);
            // Show success message for 3 seconds, then redirect
            setTimeout(() => {
                navigate('/login', {
                    state: { message: result.message || 'Registration successful! Please log in to continue.' }
                });
            }, 3000);
        }
    };

    return (
        <div className="auth-container min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">Create Account</h2>
                                    <p className="text-muted">Join ViShop and start shopping</p>
                                </div>

                                {/* Success Message */}
                                {showSuccess && (
                                    <Alert variant="success" className="alert-custom">
                                        <Alert.Heading>Registration Successful!</Alert.Heading>
                                        <p>Your account has been created successfully.</p>
                                        <p>Redirecting to login page in 3 seconds...</p>
                                    </Alert>
                                )}

                                {/* Error Message */}
                                {auth.error && !showSuccess && (
                                    <Alert variant="danger" className="alert-custom" dismissible onClose={() => auth.clearError()}>
                                        <Alert.Heading>Registration Failed</Alert.Heading>
                                        {auth.error}
                                    </Alert>
                                )}

                                {!showSuccess && (
                                    <Form onSubmit={handleSubmit(onSubmit)}>
                                        <Form.Floating className="mb-3">
                                            <Form.Control
                                                type="text"
                                                id="fullName"
                                                placeholder="Enter your full name"
                                                {...register('fullName')}
                                                isInvalid={!!errors.fullName}
                                                disabled={auth.isLoading}
                                            />
                                            <label htmlFor="fullName">Full Name</label>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.fullName?.message}
                                            </Form.Control.Feedback>
                                        </Form.Floating>

                                        <Form.Floating className="mb-3">
                                            <Form.Control
                                                type="email"
                                                id="email"
                                                placeholder="Enter your email"
                                                {...register('email')}
                                                isInvalid={!!errors.email}
                                                disabled={auth.isLoading}
                                            />
                                            <label htmlFor="email">Email Address</label>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email?.message}
                                            </Form.Control.Feedback>
                                        </Form.Floating>

                                        <Form.Floating className="mb-3">
                                            <Form.Select
                                                id="role"
                                                {...register('role')}
                                                isInvalid={!!errors.role}
                                                disabled={auth.isLoading}
                                            >
                                                <option value="">Select account type</option>
                                                <option value="ROLE_BUYER">Buyer - I want to buy vehicles</option>
                                                <option value="ROLE_MERCHANT">Merchant - I want to sell vehicles</option>
                                            </Form.Select>
                                            <label htmlFor="role">Account Type</label>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.role?.message}
                                            </Form.Control.Feedback>
                                        </Form.Floating>

                                        <Form.Floating className="mb-3">
                                            <Form.Control
                                                type="password"
                                                id="password"
                                                placeholder="Enter your password"
                                                {...register('password')}
                                                isInvalid={!!errors.password}
                                                disabled={auth.isLoading}
                                            />
                                            <label htmlFor="password">Password</label>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password?.message}
                                            </Form.Control.Feedback>
                                        </Form.Floating>

                                        <Form.Floating className="mb-3">
                                            <Form.Control
                                                type="password"
                                                id="confirmPassword"
                                                placeholder="Confirm your password"
                                                {...register('confirmPassword')}
                                                isInvalid={!!errors.confirmPassword}
                                                disabled={auth.isLoading}
                                            />
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirmPassword?.message}
                                            </Form.Control.Feedback>
                                        </Form.Floating>

                                        <div className="d-grid mb-3">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={auth.isLoading}
                                                className="btn-custom"
                                            >
                                                {auth.isLoading ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            className="me-2"
                                                        />
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    'Create Account'
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                )}

                                {!showSuccess && (
                                    <div className="text-center">
                                        <div>
                                            Already have an account?{' '}
                                            <Link 
                                                to="/login" 
                                                className="text-decoration-none fw-bold"
                                            >
                                                Sign in
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {showSuccess && (
                                    <div className="text-center">
                                        <Link 
                                            to="/login" 
                                            className="text-decoration-none fw-bold"
                                        >
                                            Go to Login Page Now
                                        </Link>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
});

export default RegistrationForm;

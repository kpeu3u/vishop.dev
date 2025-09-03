import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = observer(() => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const watchedFields = watch(); // Watch all form fields

    // Clear error when user starts typing (but only after 500ms delay)
    useEffect(() => {
        if (auth.error && (watchedFields.email || watchedFields.password)) {
            const timer = setTimeout(() => {
                auth.clearError();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [watchedFields.email, watchedFields.password, auth]);

    // Clear error when component mounts
    useEffect(() => {
        auth.clearError();
    }, [auth]);

    const onSubmit = async (event) => {
        event.preventDefault(); // Prevent form refresh
        
        const formData = {
            email: event.target.email.value,
            password: event.target.password.value,
        };

        // Validate form data
        const validation = loginSchema.safeParse(formData);
        if (!validation.success) {
            return;
        }

        const result = await auth.login(formData.email, formData.password);

        if (result.success) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
        // Error will be automatically displayed through auth.error in MobX
    };

    const successMessage = location.state?.message;

    return (
        <div className="auth-container min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">Welcome Back</h2>
                                    <p className="text-muted">Sign in to your VShop account</p>
                                </div>

                                {successMessage && (
                                    <Alert variant="success" className="alert-custom">
                                        {successMessage}
                                    </Alert>
                                )}

                                {auth.error && (
                                    <Alert variant="danger" className="alert-custom" dismissible>
                                        <Alert.Heading>Login Failed</Alert.Heading>
                                        {auth.error}
                                    </Alert>
                                )}

                                <form onSubmit={onSubmit}>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="email"
                                            id="email"
                                            name="email"
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
                                        <Form.Control
                                            type="password"
                                            id="password"
                                            name="password"
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
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                <div className="text-center">
                                    <div className="mb-2">
                                        <Link 
                                            to="/forgot-password" 
                                            className="text-decoration-none"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <div>
                                        Don't have an account?{' '}
                                        <Link 
                                            to="/register" 
                                            className="text-decoration-none fw-bold"
                                        >
                                            Sign up
                                        </Link>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
});

export default LoginForm;

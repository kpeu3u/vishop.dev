import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import {Alert, Button, Card, Col, Container, Form, Row, Spinner} from "react-bootstrap";

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await authAPI.forgotPassword(data.email);

            if (result.success) {
                setMessage(result.message);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-primary">Forgot Password</h2>
                                    <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
                                </div>

                                {message && (
                                    <Alert variant="success" className="alert-custom">
                                        {message}
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="danger" className="alert-custom" dismissible>
                                        <Alert.Heading>Login Failed</Alert.Heading>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            {...register('email')}
                                            isInvalid={!!errors.email}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="email">Email Address</label>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email?.message}
                                        </Form.Control.Feedback>
                                    </Form.Floating>

                                    <div className="d-grid mb-3">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={isLoading}
                                            className="btn-custom"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        className="me-2"
                                                    />
                                                    Sending Reset Link...
                                                </>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                <div className="text-center">
                                    <div className="mb-2">
                                        Remember your password?{' '}
                                        <Link
                                            to="/login"
                                            className="text-decoration-none"
                                        >
                                             Back to Login
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
};

export default ForgotPasswordForm;

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

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
        <div className="auth-container">
            <div className="auth-form">
                <h2>Forgot Password</h2>
                <p className="auth-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')}
                            placeholder="Enter your email address"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className="field-error">{errors.email.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="submit-button"
                    >
                        {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="form-links">
                    <p>
                        Remember your password? <Link to="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;

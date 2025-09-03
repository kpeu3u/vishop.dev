import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = React.useState(false);
    const [isValidating, setIsValidating] = React.useState(true);
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');
    const [userEmail, setUserEmail] = React.useState('');
    const [tokenValid, setTokenValid] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('No reset token provided');
                setIsValidating(false);
                return;
            }

            try {
                const result = await authAPI.validateResetToken(token);

                if (result.success) {
                    setTokenValid(true);
                    setUserEmail(result.email || '');
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Invalid or expired reset token');
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await authAPI.resetPassword(token, data.password, data.confirmPassword);

            if (result.success) {
                setMessage(result.message);
                // Redirect to login after successful reset
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Password reset successful! Please log in with your new password.' }
                    });
                }, 2000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="loading-message">
                        Validating reset token...
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <h2>Invalid Reset Token</h2>
                    <div className="error-message">
                        {error || 'The password reset token is invalid or has expired.'}
                    </div>
                    <div className="form-links">
                        <p>
                            <Link to="/forgot-password">Request a new password reset</Link>
                        </p>
                        <p>
                            <Link to="/login">Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Reset Password</h2>
                {userEmail && (
                    <p className="auth-subtitle">
                        Resetting password for: <strong>{userEmail}</strong>
                    </p>
                )}

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
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register('password')}
                            placeholder="Enter your new password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className="field-error">{errors.password.message}</span>
                        )}
                        <small className="form-text">Password must be at least 6 characters long</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            placeholder="Confirm your new password"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="submit-button"
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <div className="form-links">
                    <p>
                        <Link to="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;

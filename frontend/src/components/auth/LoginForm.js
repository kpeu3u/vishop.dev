import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = observer(() => {
    const auth = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const result = await auth.login(data.email, data.password);

        if (result.success) {
            // Redirect based on user role or to dashboard
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Sign In to VShop</h2>

                {auth.error && (
                    <div className="error-message">
                        {auth.error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email')}
                            placeholder="Enter your email"
                            disabled={auth.isLoading}
                        />
                        {errors.email && (
                            <span className="field-error">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register('password')}
                            placeholder="Enter your password"
                            disabled={auth.isLoading}
                        />
                        {errors.password && (
                            <span className="field-error">{errors.password.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={auth.isLoading}
                        className="submit-button"
                    >
                        {auth.isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="form-links">
                    <p>
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password">Forgot your password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
});

export default LoginForm;

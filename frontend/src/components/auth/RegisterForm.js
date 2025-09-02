import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const RegisterForm = observer(() => {
    const auth = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        const { confirmPassword, ...registerData } = data;
        registerData.roles = [data.role]; // Convert single role to array

        const result = await auth.register(registerData);

        if (result.success) {
            // Redirect to login with success message
            navigate('/login', {
                state: { message: 'Registration successful! Please log in.' }
            });
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Create Your VShop Account</h2>

                {auth.error && (
                    <div className="error-message">
                        {auth.error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            {...register('fullName')}
                            placeholder="Enter your full name"
                            disabled={auth.isLoading}
                        />
                        {errors.fullName && (
                            <span className="field-error">{errors.fullName.message}</span>
                        )}
                    </div>

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
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            {...register('role')}
                            disabled={auth.isLoading}
                        >
                            <option value="">Select account type</option>
                            <option value="ROLE_BUYER">Buyer - I want to buy vehicles</option>
                            <option value="ROLE_MERCHANT">Merchant - I want to sell vehicles</option>
                        </select>
                        {errors.role && (
                            <span className="field-error">{errors.role.message}</span>
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register('confirmPassword')}
                            placeholder="Confirm your password"
                            disabled={auth.isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={auth.isLoading}
                        className="submit-button"
                    >
                        {auth.isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="form-links">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
});

export default RegisterForm;

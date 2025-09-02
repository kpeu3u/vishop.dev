import React from 'react';
import { observer } from 'mobx-react-lite';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = observer(({ children, requiredRole = null }) => {
    const auth = useAuth();
    const location = useLocation();

    if (!auth.isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && !auth.hasRole(requiredRole)) {
        // User doesn't have required role
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
});

export default ProtectedRoute;

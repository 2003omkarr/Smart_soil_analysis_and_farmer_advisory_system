/**
 * Role-Based Route Protection Component
 * Restricts access based on user roles
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, hasRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        toast.error('You do not have permission to access this page');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleBasedRoute;

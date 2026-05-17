/**
 * Custom Authentication Hook
 * Provides authentication utilities and user information
 */

import { useSelector } from 'react-redux';

export const useAuth = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Get user role
    const userRole = user?.role || null;

    // Check if user has specific role
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    };

    // Check if user is admin
    const isAdmin = hasRole('admin');

    // Check if user is farmer
    const isFarmer = hasRole('farmer');

    // Check if user is lab technician
    const isLabTechnician = hasRole('lab_technician');

    // Check if user is agriculture expert
    const isAgricultureExpert = hasRole('agriculture_expert');

    // Get user token
    const token = user?.token || null;

    // Get user info
    const userInfo = user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
    } : null;

    return {
        user,
        userInfo,
        isAuthenticated,
        isLoading,
        isError,
        isSuccess,
        message,
        userRole,
        hasRole,
        isAdmin,
        isFarmer,
        isLabTechnician,
        isAgricultureExpert,
        token,
    };
};

export default useAuth;

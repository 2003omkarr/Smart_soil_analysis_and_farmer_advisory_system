/**
 * Dashboard Layout Component
 * Enterprise-level layout with sidebar and top navbar
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import LanguageToggle from './LanguageToggle';
import {
    FiMenu,
    FiLogOut,
    FiBell,
    FiSearch,
    FiMoon,
    FiSun,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useAuth();
    const { t } = useTranslation();

    // Persist and apply dark mode to the entire document HTML tag
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Navbar */}
                    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
                        <div className="flex items-center justify-between h-16 px-4 lg:px-6 w-full">
                            {/* Left Section */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>

                                {/* Search Bar */}
                                <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 w-64">
                                    <FiSearch className="w-5 h-5 text-gray-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder={t('search')}
                                        className="bg-transparent outline-none text-sm w-full dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Language Toggle */}
                                <LanguageToggle />

                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title={darkMode ? 'Light Mode' : 'Dark Mode'}
                                >
                                    {darkMode ? (
                                        <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    ) : (
                                        <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    )}
                                </button>

                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {userInfo?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {userInfo?.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                        title={t('logout')}
                                    >
                                        <FiLogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        <div className="px-4 lg:px-6 py-4 lg:py-6">
                            <Breadcrumbs />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;

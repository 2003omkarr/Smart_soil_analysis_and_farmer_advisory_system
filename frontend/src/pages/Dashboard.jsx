/**
 * Dashboard Page
 * Main dashboard with overview, stats, and quick actions
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import SoilHealthChart from '../components/dashboard/SoilHealthChart';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import MarketPricesWidget from '../components/dashboard/MarketPricesWidget';
import {
    FiFileText,
    FiTrendingUp,
    FiCheckCircle,
    FiClock,
    FiUpload,
    FiArrowRight,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { userInfo } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingAnalysis: 0,
        completedReports: 0,
        recommendations: 0,
    });
    const [latestReport, setLatestReport] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch soil reports
            const reportsResponse = await api.get('/soil/reports');
            const reports = reportsResponse.data;

            // Calculate stats
            setStats({
                totalReports: reports.length,
                pendingAnalysis: reports.filter((r) => r.status === 'pending').length,
                completedReports: reports.filter((r) => r.status === 'completed').length,
                recommendations: reports.filter((r) => r.recommendation).length,
            });

            // Get latest report
            if (reports.length > 0) {
                const latest = reports.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )[0];
                setLatestReport(latest);
            }

            // Fetch real weather data asynchronously so it doesn't block dashboard loading
            fetchRealWeather();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRealWeather = async () => {
        try {
            // Default fallback location (Mumbai)
            let lat = 19.0760;
            let lon = 72.8777;

            // ── Read location directly from localStorage (always in sync) ──
            // userInfo from React closure can be stale on first render,
            // localStorage is the single source of truth for the logged-in user.
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            const userLocation = storedUser?.location || userInfo?.location || '';
            let locationName = userLocation || 'Mumbai, India';

            console.log('[Weather] Using location from user profile:', userLocation);

            if (userLocation) {
                try {
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(userLocation)}&count=1&language=en&format=json`);
                    const geoData = await geoRes.json();

                    if (geoData.results && geoData.results.length > 0) {
                        lat = geoData.results[0].latitude;
                        lon = geoData.results[0].longitude;
                        locationName = `${geoData.results[0].name}${geoData.results[0].country ? `, ${geoData.results[0].country}` : ''}`;
                        console.log(`[Weather] Geocoded "${userLocation}" → lat=${lat}, lon=${lon}, display="${locationName}"`);
                    } else {
                        console.warn('[Weather] Geocoding returned no results for:', userLocation, '— using Mumbai fallback');
                    }
                } catch (geoErr) {
                    console.error('[Weather] Geocoding API failed:', geoErr);
                }
            } else {
                console.warn('[Weather] No user location found — using Mumbai fallback');
            }

            // Fetch current weather + 7-day daily forecast in one request
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
                `&timezone=auto&forecast_days=7`
            );
            const data = await res.json();

            // ── Current weather ──
            const code = data.current.weather_code;
            let desc = 'Clear';
            if (code >= 1  && code <= 3)  desc = 'Partly Cloudy';
            if (code >= 45 && code <= 48) desc = 'Foggy';
            if (code >= 51 && code <= 67) desc = 'Rainy';
            if (code >= 71 && code <= 77) desc = 'Snowy';
            if (code >= 80 && code <= 82) desc = 'Rain Showers';
            if (code >= 95)               desc = 'Thunderstorm';

            let advisory = 'Good conditions for field work today.';
            if ((code >= 51 && code <= 67) || code >= 80) advisory = 'Rain expected. Avoid spraying chemicals.';
            if (data.current.temperature_2m > 35) advisory = 'High temperatures detected. Ensure adequate irrigation.';

            // ── Build 7-day forecast array ──
            const daily = data.daily;
            const forecast = daily.time.map((date, i) => ({
                date,
                weatherCode: daily.weather_code[i],
                maxTemp:     daily.temperature_2m_max[i],
                minTemp:     daily.temperature_2m_min[i],
                rainProb:    daily.precipitation_probability_max[i] ?? 0,
                uvIndex:     Math.round(daily.uv_index_max?.[i] ?? 5),
            }));

            setWeather({
                temperature:  Math.round(data.current.temperature_2m),
                feelsLike:    Math.round(data.current.apparent_temperature),
                humidity:     Math.round(data.current.relative_humidity_2m),
                windSpeed:    Math.round(data.current.wind_speed_10m),
                weatherCode:  code,
                uvIndex:      Math.round(daily.uv_index_max?.[0] ?? 6),
                description:  desc,
                location:     locationName,
                advisory:     advisory,
                forecast,
            });
        } catch (error) {
            console.error('Failed to fetch real weather:', error);
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            const fallbackLocation = storedUser?.location || userInfo?.location || 'Your Location';
            // Fallback mock data if API fails
            setWeather({
                temperature:  28,
                feelsLike:    30,
                humidity:     75,
                windSpeed:    15,
                weatherCode:  1,
                uvIndex:      6,
                description:  'Partly Cloudy',
                location:     fallbackLocation,
                advisory:     'Good conditions for irrigation today',
                forecast:     [],
            });
        }
    };


    const recentActivities = [
        {
            id: 1,
            action: t('soilReportUploaded'),
            time: `2 ${t('hoursAgo')}`,
            status: 'completed',
        },
        {
            id: 2,
            action: t('cropRecommendationReceived'),
            time: `5 ${t('hoursAgo')}`,
            status: 'completed',
        },
        {
            id: 3,
            action: t('fertilizerAnalysisCompleted'),
            time: `1 ${t('dayAgo')}`,
            status: 'completed',
        },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('welcomeBack')}, {userInfo?.name}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {t('farmToday')}
                        </p>
                    </div>
                    <Link
                        to="/upload"
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FiUpload />
                        <span>{t('uploadReport')}</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={t('totalReports')}
                        value={stats.totalReports}
                        icon={FiFileText}
                        color="primary"
                        trend="up"
                        trendValue="+12%"
                    />
                    <StatCard
                        title={t('pendingAnalysis')}
                        value={stats.pendingAnalysis}
                        icon={FiClock}
                        color="warning"
                    />
                    <StatCard
                        title={t('completed')}
                        value={stats.completedReports}
                        icon={FiCheckCircle}
                        color="success"
                        trend="up"
                        trendValue="+8%"
                    />
                    <StatCard
                        title={t('recommendations')}
                        value={stats.recommendations}
                        icon={FiTrendingUp}
                        color="info"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Latest Recommendation */}
                        {latestReport?.recommendation && (
                            <RecommendationCard
                                recommendation={{
                                    crop: latestReport.recommendation.crop,
                                    confidence: latestReport.recommendation.confidence,
                                    explanation: latestReport.recommendation.explanation,
                                    alternatives: latestReport.recommendation.alternatives,
                                }}
                                type="crop"
                            />
                        )}

                        {/* Soil Health Chart */}
                        {latestReport && (
                            <SoilHealthChart
                                data={{
                                    N: latestReport.nitrogen,
                                    P: latestReport.phosphorus,
                                    K: latestReport.potassium,
                                    ph: latestReport.ph,
                                    humidity: latestReport.humidity,
                                }}
                            />
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {t('quickActions')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/upload"
                                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                            <FiUpload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {t('uploadNewReport')}
                                        </span>
                                    </div>
                                    <FiArrowRight className="text-gray-400" />
                                </Link>

                                <Link
                                    to="/history"
                                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {t('viewHistory')}
                                        </span>
                                    </div>
                                    <FiArrowRight className="text-gray-400" />
                                </Link>
                            </div>
                        </div>

                        {/* Market Prices Widget */}
                        {latestReport?.recommendation && (
                            <MarketPricesWidget 
                                recommendedCrop={latestReport.recommendation.crop}
                                location={{ state: 'Maharashtra', district: 'Nagpur' }}
                            />
                        )}
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">
                        {/* Weather Widget */}
                        <WeatherWidget weather={weather} />

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {t('recentActivity')}
                            </h3>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3"
                                    >
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/history"
                                className="block mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                {t('viewAllActivity')}
                            </Link>
                        </div>

                        {/* Soil Health Score */}
                        {latestReport?.soilHealthScore && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t('soilHealthScore')}
                                </h3>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle
                                                className="text-gray-200"
                                                strokeWidth="10"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="40"
                                                cx="50"
                                                cy="50"
                                            />
                                            <circle
                                                className="text-green-500"
                                                strokeWidth="10"
                                                strokeDasharray={`${(latestReport.soilHealthScore / 100) * 251.2
                                                    } 251.2`}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="40"
                                                cx="50"
                                                cy="50"
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {latestReport.soilHealthScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-4">
                                    {latestReport.soilHealthScore >= 80
                                        ? t('excellent')
                                        : latestReport.soilHealthScore >= 60
                                            ? t('good')
                                            : t('needsImprovement')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;

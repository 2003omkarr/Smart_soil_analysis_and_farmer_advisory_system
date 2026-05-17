/**
 * Weather Widget Component
 * Displays current weather + 7-day forecast with farm advisories
 */

import { useState } from 'react';
import { FiDroplet, FiWind, FiSun, FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/* ── WMO code → { emoji, label } ── */
const wmoIcon = (code) => {
    if (code === 0) return { emoji: '☀️', label: 'Clear' };
    if (code <= 3) return { emoji: '⛅', label: 'Partly Cloudy' };
    if (code <= 48) return { emoji: '🌫️', label: 'Foggy' };
    if (code <= 67) return { emoji: '🌧️', label: 'Rainy' };
    if (code <= 77) return { emoji: '❄️', label: 'Snowy' };
    if (code <= 82) return { emoji: '🌦️', label: 'Rain Showers' };
    if (code <= 99) return { emoji: '⛈️', label: 'Thunderstorm' };
    return { emoji: '🌡️', label: 'Unknown' };
};

/* ── Simple farm advisory per day ── */
const dayAdvisory = (code, maxTemp, rain) => {
    if (code >= 95) return { text: '⚠️ Thunderstorm risk — keep livestock sheltered.', urgent: true };
    if (code >= 80) return { text: '🌧️ Heavy showers expected — avoid field spraying.', urgent: true };
    if (code >= 51) return { text: '☔ Light rain — good for seedling establishment.', urgent: false };
    if (maxTemp > 38) return { text: '🌡️ Extreme heat — increase irrigation frequency.', urgent: true };
    if (maxTemp > 33) return { text: '☀️ Hot day — irrigate in early morning or evening.', urgent: false };
    if (rain > 60) return { text: '💧 High rain probability — hold off on fertilising.', urgent: false };
    return { text: '✅ Good conditions for field work.', urgent: false };
};

/* ── Short day name ── */
const shortDay = (dateStr, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
};

/* ──────────────────────────────────── */
const WeatherWidget = ({ weather }) => {
    const [showForecast, setShowForecast] = useState(true);
    const [hoveredDay, setHoveredDay] = useState(null);

    if (!weather) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-200 rounded" />)}
                </div>
            </div>
        );
    }

    const forecast = weather.forecast || [];

    return (
        <div className="space-y-3">
            {/* ── Current Weather Card ── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl shadow-lg overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1d6fa4 0%, #2196c4 50%, #0ea5e9 100%)' }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Current Weather</p>
                        <p className="text-sm text-white opacity-80 mt-0.5">{weather.location || 'Your Location'}</p>
                    </div>
                    <span className="text-4xl leading-none">{wmoIcon(weather.weatherCode ?? 1).emoji}</span>
                </div>

                {/* Temp */}
                <div className="px-5 pb-4 flex items-end gap-3">
                    <p className="text-6xl font-extrabold text-white leading-none">{weather.temperature ?? 25}°</p>
                    <div className="pb-1">
                        <p className="text-sm text-blue-100 font-medium">{weather.description || 'Partly Cloudy'}</p>
                        <p className="text-xs text-blue-200">Feels like {weather.feelsLike ?? weather.temperature ?? 25}°C</p>
                    </div>
                </div>

                {/* Stats row */}
                <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                    {[
                        { icon: <FiDroplet />, label: 'Humidity', value: `${weather.humidity ?? 70}%` },
                        { icon: <FiWind />, label: 'Wind', value: `${weather.windSpeed ?? 12} km/h` },
                        { icon: <FiSun />, label: 'UV Index', value: weather.uvIndex ?? 5 },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="bg-white bg-opacity-15 rounded-xl p-2.5 flex items-center gap-2">
                            <span className="text-blue-100">{icon}</span>
                            <div>
                                <p className="text-xs text-blue-200 leading-none">{label}</p>
                                <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Advisory */}
                {weather.advisory && (
                    <div className="mx-4 mb-4 px-3 py-2.5 bg-white bg-opacity-20 rounded-xl flex items-start gap-2">
                        <FiAlertTriangle className="w-4 h-4 text-yellow-200 shrink-0 mt-0.5" />
                        <p className="text-xs text-white leading-snug">{weather.advisory}</p>
                    </div>
                )}

                {/* Toggle forecast button */}
                {forecast.length > 0 && (
                    <button
                        onClick={() => setShowForecast(v => !v)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-100 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
                    >
                        {showForecast ? 'Hide' : 'Show'} 7-Day Forecast
                        {showForecast ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                    </button>
                )}
            </motion.div>

            {/* ── 7-Day Forecast ── */}
            <AnimatePresence>
                {showForecast && forecast.length > 0 && (
                    <motion.div
                        key="forecast"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700">7-Day Forecast</h4>
                                <p className="text-xs text-gray-400">{weather.location}</p>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {forecast.map((day, i) => {
                                    const icon = wmoIcon(day.weatherCode);
                                    const adv = dayAdvisory(day.weatherCode, day.maxTemp, day.rainProb);
                                    const isHovered = hoveredDay === i;

                                    return (
                                        <motion.div
                                            key={day.date}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onMouseEnter={() => setHoveredDay(i)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`px-4 py-2.5 cursor-default transition-colors ${isHovered ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Day name */}
                                                <span className={`w-20 text-sm font-semibold shrink-0 ${i === 0 ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    {shortDay(day.date, i)}
                                                </span>

                                                {/* Icon */}
                                                <span className="text-xl leading-none w-7 text-center">{icon.emoji}</span>

                                                {/* Rain prob */}
                                                <div className="flex items-center gap-1 w-12">
                                                    <FiDroplet className="w-3 h-3 text-blue-400 shrink-0" />
                                                    <span className="text-xs text-blue-500 font-medium">{day.rainProb ?? 0}%</span>
                                                </div>

                                                {/* Temp bar */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 w-8 text-right">{Math.round(day.minTemp)}°</span>
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                background: 'linear-gradient(90deg, #60a5fa, #f97316)',
                                                                width: `${Math.min(100, Math.max(10, ((day.maxTemp - 15) / 30) * 100))}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 w-8">{Math.round(day.maxTemp)}°</span>
                                                </div>
                                            </div>

                                            {/* Advisory (shows on hover) */}
                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className={`mt-2 ml-28 text-xs px-2.5 py-1.5 rounded-lg ${adv.urgent ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
                                                    >
                                                        {adv.text}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeatherWidget;

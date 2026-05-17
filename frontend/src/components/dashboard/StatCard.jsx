/**
 * Stat Card Component - Premium design with gradient icon and hover lift
 */

import { motion } from 'framer-motion'

const colorMap = {
    primary: {
        icon: 'bg-gradient-to-br from-primary-400 to-primary-600',
        ring: 'ring-primary-100',
        trend: 'text-primary-600 bg-primary-50',
    },
    success: {
        icon: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        ring: 'ring-emerald-100',
        trend: 'text-emerald-600 bg-emerald-50',
    },
    warning: {
        icon: 'bg-gradient-to-br from-amber-400 to-amber-500',
        ring: 'ring-amber-100',
        trend: 'text-amber-600 bg-amber-50',
    },
    danger: {
        icon: 'bg-gradient-to-br from-red-400 to-red-600',
        ring: 'ring-red-100',
        trend: 'text-red-600 bg-red-50',
    },
    info: {
        icon: 'bg-gradient-to-br from-blue-400 to-blue-600',
        ring: 'ring-blue-100',
        trend: 'text-blue-600 bg-blue-50',
    },
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary', subtitle }) => {
    const c = colorMap[color] || colorMap.primary

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-3">
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.trend}`}>
                                {trend === 'up' ? '↑' : '↓'} {trendValue}
                            </span>
                            <span className="text-xs text-gray-400">vs last month</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center shadow-sm ring-4 ${c.ring}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default StatCard

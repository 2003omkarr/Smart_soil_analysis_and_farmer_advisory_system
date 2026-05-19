import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getSoilReports } from '../store/slices/soilSlice'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslation } from '../hooks/useTranslation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiFileText, FiSearch, FiFilter, FiMapPin, FiCalendar,
    FiLayers, FiChevronRight, FiInbox, FiCheckCircle, FiClock, FiAlertCircle
} from 'react-icons/fi'

const getStatusConfig = (t) => ({
    completed: { label: t('completed'), icon: FiCheckCircle, cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    analyzed:  { label: t('analyzed'),  icon: FiCheckCircle, cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    pending:   { label: t('pending'),   icon: FiClock,        cls: 'bg-amber-100  text-amber-700  border border-amber-200'  },
    failed:    { label: t('failed'),    icon: FiAlertCircle,  cls: 'bg-red-100    text-red-700    border border-red-200'    },
})

const soilColors = {
    Loamy: 'bg-yellow-100 text-yellow-800',
    Sandy: 'bg-orange-100 text-orange-800',
    Clay:  'bg-red-100    text-red-800',
    Silty: 'bg-blue-100   text-blue-800',
    Peaty: 'bg-green-100  text-green-800',
    Chalky:'bg-purple-100 text-purple-800',
}

const NPKBadge = ({ label, value, color }) => (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-xs font-bold leading-none">{label}</span>
        <span className="text-sm font-semibold mt-0.5">{value ?? '—'}</span>
    </div>
)

const History = () => {
    const navigate  = useNavigate()
    const dispatch  = useDispatch()
    const { t } = useTranslation()
    const { reports, isLoading } = useSelector((s) => s.soil)
    const { user } = useSelector((s) => s.auth)
    
    const statusConfig = getStatusConfig(t)

    const [search,  setSearch]  = useState('')
    const [filter,  setFilter]  = useState('all')

    useEffect(() => { dispatch(getSoilReports()) }, [dispatch])

    const filtered = reports.filter(r => {
        const matchSearch = (r.farmName || '').toLowerCase().includes(search.toLowerCase()) ||
                            (r.location  || '').toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || r.status === filter
        return matchSearch && matchFilter
    })

    const filterBtns = [
        { key: 'all',       label: t('all') },
        { key: 'completed', label: t('completed') },
        { key: 'analyzed',  label: t('analyzed') },
        { key: 'pending',   label: t('pending') },
    ]

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reportHistory')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('totalSoilReportsSubmitted').replace('{count}', reports.length)}</p>
                    </div>
                    <button
                        onClick={() => navigate('/upload')}
                        className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                    >
                        <FiFileText className="w-4 h-4" /> {t('newReport')}
                    </button>
                </div>

                {/* ── Search + Filter Bar ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <FiFilter className="text-gray-400 w-4 h-4 shrink-0" />
                        {filterBtns.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    filter === f.key
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiInbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('noReportsFound')}</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('tryAdjustingSearch')}</p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <div className="grid gap-4">
                            {filtered.map((report, i) => {
                                const status = statusConfig[report.status] || statusConfig.pending
                                const StatusIcon = status.icon
                                const soilClr = soilColors[report.soilType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                return (
                                    <motion.div
                                        key={report._id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => navigate(`/analysis/${report._id}`)}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                                                <FiFileText className="w-6 h-6 text-primary-600" />
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                                                            {report.farmName === 'Manual Entry' && user?.name ? `${user.name}'s Farm` : (report.farmName || t('unnamedReport'))}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <FiMapPin className="w-3.5 h-3.5" />
                                                                {report.location || '—'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FiCalendar className="w-3.5 h-3.5" />
                                                                {new Date(report.createdAt).toLocaleDateString('en-IN', {
                                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                                })}
                                                            </span>
                                                            {report.area && (
                                                                <span className="flex items-center gap-1">
                                                                    <FiLayers className="w-3.5 h-3.5" />
                                                                    {report.area} {t('acres')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Status + Arrow */}
                                                    <div className="flex items-center gap-3">
                                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.cls}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {status.label}
                                                        </span>
                                                        <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                                    </div>
                                                </div>

                                                {/* Tags + NPK row */}
                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    {report.soilType && (
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${soilClr}`}>
                                                            {report.soilType} {t('soil')}
                                                        </span>
                                                    )}
                                                    {(report.N != null || report.nitrogen != null) && (
                                                        <div className="flex gap-2 ml-auto">
                                                            <NPKBadge label="N" value={report.N ?? report.nitrogen} color="bg-green-50 text-green-700" />
                                                            <NPKBadge label="P" value={report.P ?? report.phosphorus} color="bg-blue-50 text-blue-700" />
                                                            <NPKBadge label="K" value={report.K ?? report.potassium} color="bg-purple-50 text-purple-700" />
                                                            {(report.pH != null || report.ph != null) && (
                                                                <NPKBadge label="pH" value={report.ph ?? report.pH} color="bg-amber-50 text-amber-700" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </motion.div>
        </DashboardLayout>
    )
}

export default History

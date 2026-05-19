import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getSoilReportById } from '../store/slices/soilSlice'
import DashboardLayout from '../components/DashboardLayout'
import VoiceModal from '../components/VoiceModal'
import { useTranslation } from '../hooks/useTranslation'
import voiceService from '../services/voiceService'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, RadarChart,
    Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import {
    FiMapPin, FiLayers, FiThermometer, FiDroplet,
    FiCloud, FiTrendingUp, FiArrowRight, FiChevronLeft, FiVolume2
} from 'react-icons/fi'

const ParamCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value ?? '—'}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span></p>
        </div>
    </div>
)

const COLORS = ['#22c55e', '#3b82f6', '#a855f7']

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
                <p className="font-semibold text-gray-800">{payload[0].name}</p>
                <p className="text-primary-600 font-bold">{payload[0].value}</p>
            </div>
        )
    }
    return null
}

const SoilAnalysis = () => {
    const { id }    = useParams()
    const navigate  = useNavigate()
    const dispatch  = useDispatch()
    const { currentReport, isLoading } = useSelector((s) => s.soil)
    const { user } = useSelector((s) => s.auth)
    const { t } = useTranslation()
    const [voiceModalOpen, setVoiceModalOpen] = useState(false)

    useEffect(() => { dispatch(getSoilReportById(id)) }, [dispatch, id])

    if (isLoading || !currentReport) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Loading analysis…</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const r = currentReport
    const phValue = r.ph ?? r.pH
    const displayFarmName = r.farmName === 'Manual Entry' && user?.name
        ? `${user.name}'s Farm`
        : (r.farmName || 'Farm Report')

    const npkBar = [
        { name: 'Nitrogen (N)', value: r.N ?? r.nitrogen ?? 0 },
        { name: 'Phosphorus (P)', value: r.P ?? r.phosphorus ?? 0 },
        { name: 'Potassium (K)', value: r.K ?? r.potassium ?? 0 },
    ]

    const radarData = [
        { subject: 'Nitrogen',    A: r.N    ?? r.nitrogen    ?? 0, fullMark: 140 },
        { subject: 'Phosphorus',  A: r.P    ?? r.phosphorus  ?? 0, fullMark: 145 },
        { subject: 'Potassium',   A: r.K    ?? r.potassium   ?? 0, fullMark: 205 },
        { subject: 'pH',          A: ((phValue ?? 7) / 14) * 100, fullMark: 100 },
        { subject: 'Temperature', A: r.temperature ?? 25,      fullMark: 45  },
        { subject: 'Humidity',    A: r.humidity    ?? 50,      fullMark: 100 },
    ]

    const pHColor = (ph) => {
        if (!ph) return 'text-gray-600'
        if (ph < 6)  return 'text-red-600'
        if (ph > 7.5) return 'text-blue-600'
        return 'text-green-600'
    }

    const pHLabel = (ph) => {
        if (!ph) return 'Unknown'
        if (ph < 5.5) return 'Very Acidic'
        if (ph < 6.5) return 'Slightly Acidic'
        if (ph <= 7)  return 'Neutral'
        if (ph <= 7.5) return 'Slightly Alkaline'
        return 'Alkaline'
    }

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/history')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-2"
                        >
                            <FiChevronLeft className="w-4 h-4" /> {t('backToHistory')}
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('soilAnalysisReport')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{displayFarmName} • {r.location}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setVoiceModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                        >
                            <FiVolume2 className="w-4 h-4" /> {t('listen')}
                        </button>
                        <button
                            onClick={() => navigate(`/recommendations/${id}`)}
                            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                        >
                            <FiTrendingUp className="w-4 h-4" /> {t('viewRecommendations')} <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Farm Details Banner ── */}
                <div className="bg-gradient-to-r from-primary-600 to-emerald-700 rounded-2xl p-6 text-white">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Farm Name',  value: displayFarmName },
                            { label: 'Location',   value: r.location  || '—', icon: FiMapPin },
                            { label: 'Area',       value: r.area ? `${r.area} acres` : '—', icon: FiLayers },
                            { label: 'Soil Type',  value: r.soilType  || '—' },
                        ].map(item => (
                            <div key={item.label}>
                                <p className="text-primary-200 text-xs font-medium uppercase tracking-wide">{item.label}</p>
                                <p className="text-white font-semibold mt-0.5">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Soil Parameter Cards ── */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Soil Parameters</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <ParamCard icon={FiDroplet}     label="pH Level"     value={phValue}          unit=""    color="bg-amber-50 text-amber-600" />
                        <ParamCard icon={FiCloud}       label="Rainfall"     value={r.rainfall}    unit="mm"  color="bg-blue-50 text-blue-600" />
                        <ParamCard icon={FiThermometer} label="Temperature"  value={r.temperature} unit="°C"  color="bg-red-50 text-red-500" />
                        <ParamCard icon={FiDroplet}     label="Humidity"     value={r.humidity}    unit="%"   color="bg-cyan-50 text-cyan-600" />
                        <ParamCard icon={FiLayers}      label="Nitrogen"     value={r.N ?? r.nitrogen}    unit="mg/kg" color="bg-green-50 text-green-600" />
                        <ParamCard icon={FiLayers}      label="Potassium"    value={r.K ?? r.potassium}   unit="mg/kg" color="bg-purple-50 text-purple-600" />
                    </div>
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* NPK Bar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">NPK Analysis</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Nitrogen, Phosphorus & Potassium levels</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={npkBar} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {npkBar.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* pH Gauge + Radar */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Soil Profile Radar</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Overall soil characteristics</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#f0f0f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Radar name="Soil" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── pH Detail Card ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">pH Scale Interpretation</h2>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                            <p className={`text-5xl font-black ${pHColor(phValue)}`}>{phValue ?? '—'}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">{pHLabel(phValue)}</p>
                        </div>
                        <div className="flex-1 min-w-48">
                            {/* pH scale bar */}
                            <div className="relative h-4 rounded-full overflow-hidden" style={{
                                background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #3b82f6, #6366f1)'
                            }}>
                                {phValue && (
                                    <div
                                        className="absolute top-0 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow -translate-x-1/2"
                                        style={{ left: `${((phValue - 0) / 14) * 100}%` }}
                                    />
                                )}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0 — Acidic</span><span>7 — Neutral</span><span>14 — Alkaline</span>
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>

            {/* Voice Modal */}
            <VoiceModal
                isOpen={voiceModalOpen}
                onClose={() => setVoiceModalOpen(false)}
                analysisText={voiceService.formatAnalysisText(r, t)}
                analysisType="analysis"
            />
        </DashboardLayout>
    )
}

export default SoilAnalysis

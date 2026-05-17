import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getRecommendations } from '../store/slices/recommendationSlice'
import DashboardLayout from '../components/DashboardLayout'
import VoiceModal from '../components/VoiceModal'
import { useTranslation } from '../hooks/useTranslation'
import voiceService from '../services/voiceService'
import { motion } from 'framer-motion'
import html2pdf from 'html2pdf.js'
import {
    FiCheckCircle, FiDroplet, FiSun, FiAlertTriangle,
    FiThumbsUp, FiChevronLeft, FiBarChart2, FiStar,
    FiDownload, FiVolume2, FiVolumeX, FiGlobe
} from 'react-icons/fi'

const Section = ({ icon: Icon, title, iconColor, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800 text-lg">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
    </div>
)

const ScoreRing = ({ score, t }) => {
    const r       = 40
    const circ    = 2 * Math.PI * r
    const offset  = circ - (score / 100) * circ
    const color   = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
    const label   = score >= 80 ? t('excellent') : score >= 60 ? t('good') : t('needsImprovement')

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                    cx="50" cy="50" r={r} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="20" fontWeight="bold" fill={color}>{score}</text>
            </svg>
            <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
    )
}

const Recommendations = () => {
    const { id }   = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { recommendations, isLoading } = useSelector((s) => s.recommendation)
    const { t, language, translateCrop, translateTip } = useTranslation()
    const reportRef = useRef(null)
    const [voiceModalOpen, setVoiceModalOpen] = useState(false)

    useEffect(() => { dispatch(getRecommendations(id)) }, [dispatch, id])

    // Cleanup speech synthesis on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel()
    }, [])

    const handleDownloadPDF = () => {
        const element = reportRef.current
        const languageMap = {
            'en-US': 'EN',
            'hi-IN': 'HI',
            'mr-IN': 'MR',
            'es-ES': 'ES'
        }
        const langCode = languageMap[language] || 'EN'
        const opt = {
            margin:       0.5,
            filename:     `Soil_Recommendation_${langCode}_${id.slice(-6)}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
        html2pdf().set(opt).from(element).save()
    }

    if (isLoading || !recommendations) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Loading recommendations…</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

                {/* ── Action Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => navigate(`/analysis/${id}`)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-2"
                        >
                            <FiChevronLeft className="w-4 h-4" /> {t('backToAnalysis')}
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reportRecommendations')}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setVoiceModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                        >
                            <FiVolume2 className="w-4 h-4" /> {t('listen')}
                        </button>

                        <button 
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md transition-all"
                        >
                            <FiDownload className="w-4 h-4" />
                            {t('exportPDF')}
                        </button>
                    </div>
                </div>

                <div ref={reportRef} className="space-y-6 pb-8">

                {/* ── Crop + Score Hero ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Recommended Crop */}
                    <div className="bg-gradient-to-br from-primary-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                        <FiStar className="w-5 h-5 text-primary-200 mb-3" />
                        <p className="text-primary-200 text-sm font-medium">{t('recommendedCrop')}</p>
                        <h2 className="text-4xl font-black capitalize mt-1">{translateCrop(recommendations.crop) || recommendations.crop || '—'}</h2>
                        <p className="text-primary-100 text-sm mt-3 leading-relaxed">{recommendations.cropReason}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <FiCheckCircle className="w-4 h-4 text-emerald-300" />
                            <span className="text-xs text-primary-200">{t('bestMatchForSoil')}</span>
                        </div>
                    </div>

                    {/* Soil Health Score */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiBarChart2 className="text-primary-500" /> {t('soilHealthScore')}
                        </h2>
                        {recommendations.soilHealthScore != null ? (
                            <>
                                <ScoreRing score={recommendations.soilHealthScore} t={t} />
                                <p className="text-sm text-gray-400 mt-2 text-center">{recommendations.soilHealthStatus}</p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">{t('scoreNotAvailable')}</p>
                        )}
                    </div>
                </div>

                {/* ── Fertilizer Recommendations ── */}
                {recommendations.fertilizers?.length > 0 && (
                    <Section icon={FiThumbsUp} title={t('fertilizerRecommendations')} iconColor="bg-green-50 text-green-600">
                        <div className="space-y-4">
                            {recommendations.fertilizers.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{f.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{f.dosage}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <FiCheckCircle className="w-3 h-3 text-green-500" /> {f.timing}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ── Irrigation Advice ── */}
                {recommendations.irrigation && (
                    <Section icon={FiDroplet} title={t('irrigationAdvice')} iconColor="bg-blue-50 text-blue-600">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <FiDroplet className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{recommendations.irrigation}</p>
                        </div>
                    </Section>
                )}

                {/* ── Weather-Based Suggestions ── */}
                {recommendations.weatherAdvice && (
                    <Section icon={FiSun} title={t('weatherBasedSuggestions')} iconColor="bg-amber-50 text-amber-600">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                <FiSun className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{recommendations.weatherAdvice}</p>
                        </div>
                    </Section>
                )}

                {/* ── Additional Tips ── */}
                {recommendations.tips?.length > 0 && (
                    <Section icon={FiAlertTriangle} title={t('additionalTips')} iconColor="bg-purple-50 text-purple-600">
                        <ul className="space-y-3">
                            {recommendations.tips.map((tip, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{translateTip(tip)}</p>
                                </motion.li>
                            ))}
                        </ul>
                    </Section>
                )}
                </div>

            </motion.div>

            {/* Voice Modal */}
            <VoiceModal
                isOpen={voiceModalOpen}
                onClose={() => setVoiceModalOpen(false)}
                analysisText={voiceService.formatRecommendationText(recommendations, t)}
                analysisType="recommendations"
            />
        </DashboardLayout>
    )
}

export default Recommendations

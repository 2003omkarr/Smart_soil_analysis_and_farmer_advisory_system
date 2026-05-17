import { useEffect, useState } from 'react'
import { FiTrendingUp, FiChevronDown, FiRefreshCw } from 'react-icons/fi'
import { motion } from 'framer-motion'
import marketPriceService from '../../services/marketPriceService'
import { useTranslation } from '../../hooks/useTranslation'

// Map crop names to database names
const CROP_NAME_MAP = {
    'wheat': 'Wheat',
    'rice': 'Rice',
    'cotton': 'Cotton',
    'sugarcane': 'Sugarcane',
    'soybean': 'Soybean',
    'maize': 'Wheat', // Fallback
    'corn': 'Wheat',
    'jowar': 'Wheat',
    'bajra': 'Wheat',
}

const normalizeCropName = (crop) => {
    if (!crop) return null
    const normalized = crop.toLowerCase().trim()
    return CROP_NAME_MAP[normalized] || crop // Return original if no match
}

const MarketPricesWidget = ({ recommendedCrop, location = {} }) => {
    const { t } = useTranslation()
    const [prices, setPrices] = useState([])
    const [statistics, setStatistics] = useState({})
    const [loading, setLoading] = useState(false)
    const [state, setState] = useState(location?.state || 'Maharashtra')
    const [district, setDistrict] = useState(location?.district || 'Nagpur')
    const [states, setStates] = useState([])
    const [districts, setDistricts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [currentCrop, setCurrentCrop] = useState(normalizeCropName(recommendedCrop))

    // Load states on mount
    useEffect(() => {
        loadStates()
    }, [])

    // Load districts when state changes
    useEffect(() => {
        if (state) {
            loadDistricts(state)
        }
    }, [state])

    // Fetch prices when crop or location changes
    useEffect(() => {
        const normalized = normalizeCropName(recommendedCrop)
        setCurrentCrop(normalized)
        
        if (normalized && state && district) {
            fetchMarketPrices(normalized)
        }
    }, [recommendedCrop, state, district])

    const loadStates = async () => {
        try {
            const data = await marketPriceService.getStates()
            setStates(data)
        } catch (error) {
            console.error('Error loading states:', error)
        }
    }

    const loadDistricts = async (selectedState) => {
        try {
            const data = await marketPriceService.getDistricts(selectedState)
            setDistricts(data)
        } catch (error) {
            console.error('Error loading districts:', error)
        }
    }

    const fetchMarketPrices = async (crop) => {
        if (!crop) return

        setLoading(true)
        try {
            console.log(`🌾 Fetching prices for: ${crop}, ${district}, ${state}`)
            const response = await marketPriceService.getPricesForCrop(
                crop,
                state,
                district
            )
            console.log('📊 API Response:', response)
            
            if (response.success && response.data?.length > 0) {
                setPrices(response.data)
                setStatistics(response.statistics || {})
            } else {
                // Try without state/district filtering
                console.warn(`No prices for ${crop} in ${district}, ${state}`)
                setPrices([])
                setStatistics({})
            }
        } catch (error) {
            console.error('Error fetching prices:', error)
            setPrices([])
            setStatistics({})
        } finally {
            setLoading(false)
        }
    }

    if (!recommendedCrop || !currentCrop) {
        return null
    }

    const latestPrice = prices[0]

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('marketPrices')}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('realtimePrices')} {currentCrop}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Toggle location"
                >
                    <FiChevronDown className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showForm ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Location Selector - Collapsible */}
            {showForm && (
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                            {t('state')}
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-sm dark:text-white"
                        >
                            {states.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                            {t('district')}
                        </label>
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-sm dark:text-white"
                        >
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Price Display */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            ) : statistics.avgPrice ? (
                <div className="space-y-4">
                    {/* Average Price Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/10 dark:to-emerald-900/5 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">📊 {t('averageMarketPrice')}</p>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{statistics.avgPrice}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('perQuintal')}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {t('range')}: ₹{statistics.minPrice} - ₹{statistics.maxPrice}
                        </p>
                    </div>

                    {/* Market Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t('lowest')}</p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                ₹{statistics.minPrice}
                            </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t('highest')}</p>
                            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                ₹{statistics.maxPrice}
                            </p>
                        </div>
                    </div>

                    {/* Recent Markets */}
                    {prices.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                📍 {t('recentMarketPrices')}
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {prices.slice(0, 5).map((price, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                {price.market}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(price.date).toLocaleDateString('en-IN', { 
                                                    month: 'short', 
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                ₹{price.modalPrice}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ₹{price.minPrice}-₹{price.maxPrice}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Records Count */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        📈 {t('basedOnMarketRecords').replace('{count}', statistics.totalRecords)}
                    </p>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                        <FiTrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('noMarketDataAvailable')} <span className="font-medium">{currentCrop}</span> {t('inLocation')} {district}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {t('trySelectingLocation')}
                    </p>
                    {recommendedCrop !== currentCrop && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            {t('mappedFrom')} "{currentCrop}" {t('mappedFromNote')} "{recommendedCrop}")
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    )
}

export default MarketPricesWidget

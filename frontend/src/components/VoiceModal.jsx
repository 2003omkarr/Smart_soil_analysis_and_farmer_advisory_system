import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiPlay, FiVolume2, FiAlertCircle } from 'react-icons/fi'
import voiceService from '../services/voiceService'
import { useTranslation } from '../hooks/useTranslation'

const VoiceModal = ({ isOpen, onClose, analysisText, analysisType = 'analysis' }) => {
    const [selectedLang, setSelectedLang] = useState('en-US')
    const [isPlaying, setIsPlaying] = useState(false)
    const [availableVoices, setAvailableVoices] = useState([])
    const [availableLanguages, setAvailableLanguages] = useState([])
    const { t } = useTranslation()

    const allLanguages = voiceService.getLanguageOptions()

    // Load available voices and languages when component mounts or when modal opens
    useEffect(() => {
        if (!isOpen || !voiceService.isSupported()) return

        // Get initial voices
        const voices = voiceService.getAvailableVoices()
        setAvailableVoices(voices)
        
        // Get languages that have voices
        const available = voiceService.getAvailableLanguages()
        setAvailableLanguages(available)
        
        console.log(`📱 Available languages:`, available.map(l => l.name))
        console.log(`🎤 Available voices:`, voices.length)

        // Listen for voices to load (some browsers load them asynchronously)
        const handleVoicesChanged = () => {
            const updatedVoices = voiceService.getAvailableVoices()
            setAvailableVoices(updatedVoices)
            const updatedLanguages = voiceService.getAvailableLanguages()
            setAvailableLanguages(updatedLanguages)
            console.log(`🔄 Voices updated:`, updatedLanguages.map(l => l.name))
        }

        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
        }
    }, [isOpen])

    const handlePlayAudio = () => {
        if (isPlaying) {
            voiceService.stop()
            setIsPlaying(false)
            return
        }

        if (!analysisText || analysisText.trim() === '') {
            console.warn('No text to speak')
            return
        }

        setIsPlaying(true)
        const success = voiceService.speak(analysisText, selectedLang, () => {
            setIsPlaying(false)
        })

        if (!success) {
            setIsPlaying(false)
            console.warn('Failed to start speech synthesis')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                            <FiVolume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">{t('language')}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Listen to the {analysisType} in your language</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Language Selection */}
                <div className="px-6 py-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {t('selectLanguage')}
                    </p>
                    {availableVoices.length === 0 && (
                        <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <FiAlertCircle className="text-amber-600 dark:text-amber-400" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Loading voices... Please wait a moment.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {allLanguages.map((lang) => {
                            const isAvailable = availableLanguages.some(l => l.code === lang.code)
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        if (isAvailable) {
                                            setSelectedLang(lang.code)
                                        }
                                    }}
                                    disabled={!isAvailable && availableVoices.length > 0}
                                    className={`p-3 rounded-xl text-left text-sm font-medium transition-all relative ${
                                        !isAvailable && availableVoices.length > 0
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                            : selectedLang === lang.code
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <span className="text-lg mr-2">{lang.flag}</span>
                                    {lang.name}
                                    {isAvailable && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                    {!isAvailable && availableVoices.length > 0 && (
                                        <span className="absolute top-1 right-1 text-xs text-red-500" title="No voice available">
                                            ✗
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    {availableVoices.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            ✓ {availableLanguages.length} language{availableLanguages.length !== 1 ? 's' : ''} available on your system
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePlayAudio}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isPlaying
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                    >
                        {isPlaying ? (
                            <>Stop</>
                        ) : (
                            <>
                                <FiPlay className="w-4 h-4" /> Play
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default VoiceModal

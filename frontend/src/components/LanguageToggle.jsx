import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import authService from '../services/authService'
import { FiGlobe } from 'react-icons/fi'
import { motion } from 'framer-motion'

const LanguageToggle = () => {
    const { t, changeLanguage, language } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ]

    const currentLanguage = languages.find((l) => l.code === language)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLanguageChange = async (langCode) => {
        changeLanguage(langCode)
        setIsOpen(false)
        
        // Save language preference to backend
        try {
            await authService.updateLanguage(langCode)
        } catch (error) {
            console.error('Failed to update language preference:', error)
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            {/* Language Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                           flex items-center space-x-1 text-gray-600 dark:text-gray-400"
                title={t('language')}
            >
                <FiGlobe className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold uppercase">
                    {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                               border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 tracking-widest">
                        {t('selectLanguage')}
                    </p>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-2.5 flex items-center space-x-2 transition-colors
                                       ${
                                           language === lang.code
                                               ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-600'
                                               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                       }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex-1">
                                <span className="font-medium">{lang.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {lang.code.toUpperCase()}
                                </span>
                            </div>
                            {language === lang.code && (
                                <span className="text-primary-600 dark:text-primary-400">✓</span>
                            )}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    )
}

export default LanguageToggle

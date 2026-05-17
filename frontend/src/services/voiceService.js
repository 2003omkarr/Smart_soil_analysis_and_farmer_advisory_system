/**
 * Voice Service - Text-to-Speech with Multi-Language Support
 * Converts analysis text to speech in selected languages
 */

export const voiceService = {
    isSupported: () => {
        return 'speechSynthesis' in window
    },

    getAvailableVoices: () => {
        if (!voiceService.isSupported()) return []
        return window.speechSynthesis.getVoices()
    },

    selectVoiceByLanguage: (language) => {
        const voices = voiceService.getAvailableVoices()
        
        // Log for debugging
        console.log(`🎤 Looking for voice for language: ${language}`)
        console.log(`📋 Available voices (${voices.length}):`, voices.map(v => ({ lang: v.lang, name: v.name })))
        
        // Extract language code (e.g., 'hi' from 'hi-IN')
        const langCode = language.split('-')[0].toLowerCase()
        
        // Try exact match first (e.g., 'hi-IN' matches 'hi-IN')
        let voice = voices.find(v => v.lang.toLowerCase() === language.toLowerCase())
        console.log(`✓ Exact match (${language}):`, voice?.name || 'Not found')
        
        // Try language code match (e.g., 'hi' matches 'hi-IN', 'hi-IN-male', etc.)
        if (!voice) {
            voice = voices.find(v => v.lang.toLowerCase().startsWith(langCode))
            console.log(`✓ Language code match (${langCode}):`, voice?.name || 'Not found')
        }
        
        // Try partial match as last resort
        if (!voice) {
            voice = voices.find(v => v.lang.toLowerCase().includes(langCode))
            console.log(`✓ Partial match (${langCode}):`, voice?.name || 'Not found')
        }
        
        // Fallback to first available voice if nothing matched
        if (!voice && voices.length > 0) {
            voice = voices[0]
            console.log(`⚠️ Fallback to first voice:`, voice?.name)
        }
        
        console.log(`🎯 Final selected voice:`, voice?.name || 'None')
        return voice
    },

    speak: (text, language = 'en-US', callback = null) => {
        if (!voiceService.isSupported()) {
            console.warn('Speech Synthesis not supported')
            return false
        }

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        
        // Set language
        utterance.lang = language
        console.log(`🗣️ Setting language to:`, language)
        
        // Select appropriate voice for the language
        const voice = voiceService.selectVoiceByLanguage(language)
        if (voice) {
            utterance.voice = voice
            console.log(`✅ Voice set:`, voice.name, `(${voice.lang})`)
        } else {
            console.warn(`❌ No voice found for language: ${language}`)
        }
        
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1

        if (callback) {
            utterance.onend = callback
            utterance.onerror = callback
        }

        window.speechSynthesis.speak(utterance)
        console.log(`🎙️ Speaking text in ${language}:`, text.substring(0, 50) + '...')
        return true
    },

    stop: () => {
        if (voiceService.isSupported()) {
            window.speechSynthesis.cancel()
        }
    },

    getLanguageOptions: () => [
        { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
        { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
        { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
        { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' },
    ],

    getAvailableLanguages: () => {
        const allLanguages = voiceService.getLanguageOptions()
        const voices = voiceService.getAvailableVoices()
        
        return allLanguages.filter(lang => {
            const langCode = lang.code.split('-')[0].toLowerCase()
            return voices.some(v => v.lang.toLowerCase().startsWith(langCode) || v.lang.toLowerCase() === lang.code.toLowerCase())
        })
    },

    formatAnalysisText: (analysis, t, recommendations = null) => {
        if (!analysis) return ''

        let text = ''

        // If we have recommendations, speak about those instead of raw analysis
        if (recommendations) {
            return voiceService.formatRecommendationText(recommendations, t)
        }

        // Fallback - speak about actionable weather and soil insights
        if (analysis.temperature) {
            text += `Current temperature is ${analysis.temperature} degrees Celsius. `
        }
        if (analysis.humidity) {
            text += `Humidity is ${analysis.humidity} percent. `
        }
        if (analysis.rainfall) {
            text += `Expected rainfall is ${analysis.rainfall} millimeters. `
        }

        if (!text) {
            text = `Soil analysis report for ${analysis.farmName || 'your farm'}. `
        }

        return text
    },

    formatRecommendationText: (recommendations, t) => {
        if (!recommendations) return ''

        let text = ''

        // Weather-Based Suggestions - First Priority
        if (recommendations.weatherAdvice) {
            text += `Weather prediction: ${recommendations.weatherAdvice}. `
        } else {
            text += `Based on current weather conditions, here are the recommendations. `
        }

        // Crop recommendation
        if (recommendations.crop) {
            text += `We recommend growing ${recommendations.crop}. `
            if (recommendations.cropReason) {
                text += `${recommendations.cropReason}. `
            }
        }

        // Fertilizer recommendations - Main focus
        if (recommendations.fertilizers?.length > 0) {
            text += `${t('fertilizerRecommendations')}: `
            recommendations.fertilizers.forEach((f, idx) => {
                text += `Number ${idx + 1}: ${f.name}. `
                if (f.dosage) text += `Apply ${f.dosage}. `
                if (f.timing) text += `Timing: ${f.timing}. `
            })
        }

        // Irrigation advice
        if (recommendations.irrigation) {
            text += `${t('irrigationAdvice')}: ${recommendations.irrigation}. `
        }

        // Soil health score
        if (recommendations.soilHealthScore != null) {
            text += `Soil health score is ${recommendations.soilHealthScore} out of 100. ${recommendations.soilHealthStatus || 'Good condition'}. `
        }

        // Additional tips - Last section
        if (recommendations.tips?.length > 0) {
            text += `Important tips: `
            recommendations.tips.forEach((tip, idx) => {
                text += `Tip ${idx + 1}: ${tip}. `
            })
        }

        return text
    },
}

export default voiceService

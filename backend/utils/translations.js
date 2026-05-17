/**
 * Translation utility for recommendations
 * Translates recommendation content to multiple languages
 */

const TRANSLATIONS = {
    'en': {
        'irrigation': 'Based on your soil moisture levels, ensure regular irrigation during dry spells to maintain optimal humidity.',
        'weather': 'Monitor local weather forecasts. Avoid applying fertilizers right before heavy rainfall to prevent nutrient runoff.'
    },
    'hi': {
        'irrigation': 'आपकी मिट्टी की नमी के स्तर के आधार पर, सूखी अवधि में नियमित सिंचाई सुनिश्चित करें ताकि इष्टतम आर्द्रता बनी रहे।',
        'weather': 'स्थानीय मौसम पूर्वानुमान की निगरानी करें। भारी वर्षा से पहले उर्वरक लागू करने से बचें ताकि पोषक तत्वों का रिसाव रोका जा सके।'
    },
    'mr': {
        'irrigation': 'आपच्या मातीची आर्द्रता पातळी यावर आधारित, सुके काळात इष्टतम आर्द्रता राखण्यासाठी नियमित सिंचन सुनिश्चित करा।',
        'weather': 'स्थानिक हवामान पूर्वानुमान लक्ष्यात ठेवा. जड पावसापूर्वी खत लागू करणे टाळा जेणेकरून पोषक द्रव्यांचे नुकसान होऊ नये।'
    },
    'es': {
        'irrigation': 'Según los niveles de humedad del suelo, asegure riego regular durante períodos secos para mantener la humedad óptima.',
        'weather': 'Monitoree los pronósticos meteorológicos locales. Evite aplicar fertilizantes justo antes de lluvia intensa para prevenir la escorrentía de nutrientes.'
    }
}

/**
 * Get translated text for a key and language
 * @param {string} key - Translation key (irrigation, weather)
 * @param {string} language - Language code (en, hi, mr, es)
 * @returns {string} Translated text
 */
const getTranslation = (key, language = 'en') => {
    const lang = language.toLowerCase()
    
    // Ensure language exists in translations, default to English
    if (!TRANSLATIONS[lang]) {
        return TRANSLATIONS['en'][key] || ''
    }
    
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || ''
}

export { getTranslation }

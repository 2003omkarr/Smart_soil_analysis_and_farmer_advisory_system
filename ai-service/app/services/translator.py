"""
Translation service for multilingual recommendations
Handles translation of recommendation text to multiple languages
"""

# Translation dictionary for common recommendation patterns
TRANSLATIONS = {
    "en": {
        "irrigation_base": "Based on your soil moisture levels, ensure regular irrigation during dry spells to maintain optimal humidity.",
        "weather_base": "Monitor local weather forecasts. Avoid applying fertilizers right before heavy rainfall to prevent nutrient runoff.",
        "excellent": "Excellent",
        "good": "Good",
        "needs_improvement": "Needs Improvement"
    },
    "hi": {
        "irrigation_base": "आपकी मिट्टी की नमी के स्तर के आधार पर, सूखी अवधि में नियमित सिंचाई सुनिश्चित करें ताकि इष्टतम आर्द्रता बनी रहे।",
        "weather_base": "स्थानीय मौसम पूर्वानुमान की निगरानी करें। भारी वर्षा से पहले उर्वरक लागू करने से बचें ताकि पोषक तत्वों का रिसाव रोका जा सके।",
        "excellent": "उत्कृष्ट",
        "good": "अच्छा",
        "needs_improvement": "सुधार की आवश्यकता है"
    },
    "mr": {
        "irrigation_base": "आपच्या मातीची आर्द्रता पातळी यावर आधारित, सुके काळात इष्टतम आर्द्रता राखण्यासाठी नियमित सिंचन सुनिश्चित करा।",
        "weather_base": "स्थानिक हवामान पूर्वानुमान लक्ष्यात ठेवा. जड पावसापूर्वी खत लागू करणे टाळा जेणेकरून पोषक द्रव्यांचे नुकसान होऊ नये.",
        "excellent": "उत्तम",
        "good": "चांगले",
        "needs_improvement": "सुधार आवश्यक"
    },
    "es": {
        "irrigation_base": "Según los niveles de humedad del suelo, asegure riego regular durante períodos secos para mantener la humedad óptima.",
        "weather_base": "Monitoree los pronósticos meteorológicos locales. Evite aplicar fertilizantes justo antes de lluvia intensa para prevenir la escorrentía de nutrientes.",
        "excellent": "Excelente",
        "good": "Bueno",
        "needs_improvement": "Necesita mejora"
    }
}

def translate_text(text: str, language: str = "en") -> str:
    """
    Translate recommendation text to specified language
    
    Args:
        text: Text to translate
        language: Target language code (en, hi, mr, es)
    
    Returns:
        Translated text or original if translation not found
    """
    language = language.lower()
    
    # Ensure language is valid
    if language not in TRANSLATIONS:
        language = "en"
    
    # Check if text matches any known patterns
    text_lower = text.lower()
    
    for key, value in TRANSLATIONS.get(language, {}).items():
        if key == "irrigation_base" and "irrigation" in text_lower and "moisture" in text_lower:
            return TRANSLATIONS[language]["irrigation_base"]
        elif key == "weather_base" and "weather" in text_lower and "rainfall" in text_lower:
            return TRANSLATIONS[language]["weather_base"]
    
    # If no translation found, return original
    return text

def get_translation(key: str, language: str = "en") -> str:
    """
    Get translation for a specific key
    
    Args:
        key: Translation key (e.g., 'excellent', 'irrigation_base')
        language: Target language code (en, hi, mr, es)
    
    Returns:
        Translated text or original key if not found
    """
    language = language.lower()
    
    # Ensure language is valid
    if language not in TRANSLATIONS:
        language = "en"
    
    return TRANSLATIONS[language].get(key, TRANSLATIONS["en"].get(key, key))

def translate_recommendations(recommendations: dict, language: str = "en") -> dict:
    """
    Translate an entire recommendations dictionary
    
    Args:
        recommendations: Recommendations dictionary
        language: Target language code (en, hi, mr, es)
    
    Returns:
        Recommendations with translated text
    """
    language = language.lower()
    
    # Ensure language is valid
    if language not in TRANSLATIONS:
        language = "en"
    
    translated = recommendations.copy()
    
    # Translate irrigation advice
    if "irrigation" in translated and translated["irrigation"]:
        translated["irrigation"] = get_translation("irrigation_base", language)
    
    # Translate weather advice
    if "weatherAdvice" in translated and translated["weatherAdvice"]:
        translated["weatherAdvice"] = get_translation("weather_base", language)
    
    # Translate tips if they're in a known set
    if "tips" in translated and isinstance(translated["tips"], list):
        # Tips from AI are dynamic, so we keep them as-is for now
        # Frontend will need to handle or we need more sophisticated translation
        pass
    
    return translated

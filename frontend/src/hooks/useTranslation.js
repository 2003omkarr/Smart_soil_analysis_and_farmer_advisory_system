import { useSelector, useDispatch } from 'react-redux'
import { setLanguage } from '../store/slices/languageSlice'
import resources from '../locales/resources'

// Comprehensive agricultural tips translations with key phrases
const tipTranslations = {
    // Soil testing and monitoring
    'soil test': {
        en: 'Maintain regular soil testing (every 6 months).',
        hi: 'नियमित रूप से मिट्टी की जांच करें (हर 6 महीने में)।',
        mr: 'नियमितपणे मातीची चाचणी करा (प्रत्येक 6 महिन्यांत)।',
        es: 'Realizar pruebas de suelo regulares (cada 6 meses).'
    },
    'Maintain regular soil testing': {
        en: 'Maintain regular soil testing (every 6 months).',
        hi: 'नियमित रूप से मिट्टी की जांच करें (हर 6 महीने में)।',
        mr: 'नियमितपणे मातीची चाचणी करा (प्रत्येक 6 महिन्यांत)।',
        es: 'Realizar pruebas de suelo regulares (cada 6 meses).'
    },

    // Fertilization practices
    'balanced fertilization': {
        en: 'Continue balanced fertilization practices.',
        hi: 'संतुलित उर्वरीकरण प्रथाओं को जारी रखें।',
        mr: 'संतुलित खतांचे अभ्यास सुरू ठेवा।',
        es: 'Continuar con prácticas de fertilización equilibrada.'
    },
    'Continue balanced fertilization': {
        en: 'Continue balanced fertilization practices.',
        hi: 'संतुलित उर्वरीकरण प्रथाओं को जारी रखें।',
        mr: 'संतुलित खतांचे अभ्यास सुरू ठेवा।',
        es: 'Continuar con prácticas de fertilización equilibrada.'
    },

    // Pest and disease monitoring
    'Monitor crop health': {
        en: 'Monitor crop health regularly for pests and diseases.',
        hi: 'कीटों और बीमारियों के लिए नियमित रूप से फसल के स्वास्थ्य की निगरानी करें।',
        mr: 'कीटकांच्या आणि रोगांच्या संदर्भात नियमितपणे पिकाचे आरोग्य तपासा।',
        es: 'Monitoree regularmente la salud de las cultivos para plagas y enfermedades.'
    },

    // Crop rotation
    'crop rotation': {
        en: 'Implement crop rotation practices.',
        hi: 'फसल चक्र प्रणाली को लागू करें।',
        mr: 'पिक परिभ्रमण प्रणाली लागू करा।',
        es: 'Implementar prácticas de rotación de cultivos.'
    },

    // Mulching
    'organic mulch': {
        en: 'Use organic mulch to retain soil moisture.',
        hi: 'मिट्टी की नमी बनाए रखने के लिए जैविक गीली घास का उपयोग करें।',
        mr: 'मातीचा ओलावा टिकवून ठेवण्यासाठी जैविक पालापण वापरा।',
        es: 'Use mantillo orgánico para retener la humedad del suelo.'
    },
    'mulch': {
        en: 'Apply mulch during dry seasons.',
        hi: 'सूखे मौसम के दौरान गीली घास लागू करें।',
        mr: 'कोरड्या ऋतूंमध्ये पालापण लागू करा।',
        es: 'Aplicar mantillo durante las estaciones secas.'
    },

    // Drainage
    'drainage': {
        en: 'Ensure proper drainage in fields.',
        hi: 'खेतों में उचित जल निकासी सुनिश्चित करें।',
        mr: 'शेतांमध्ये योग्य ड्रेनेज सुनिश्चित करा।',
        es: 'Asegurar drenaje adecuado en los campos.'
    },

    // Irrigation
    'irrigation schedule': {
        en: 'Plan irrigation schedule based on rainfall.',
        hi: 'वर्षा के आधार पर सिंचाई समय-सारणी की योजना बनाएं।',
        mr: 'पाऊस आधारित सिंचन वेळापत्रक नियोजित करा।',
        es: 'Planificar cronograma de riego basado en precipitaciones.'
    },

    // Equipment maintenance
    'equipment': {
        en: 'Check and maintain farm equipment regularly.',
        hi: 'नियमित रूप से खेत के उपकरणों की जांच और रखरखाव करें।',
        mr: 'शेत उपकरणे नियमितपणे तपासा आणि राखभाल करा।',
        es: 'Verificar y mantener regularmente el equipo agrícola.'
    },

    // Record keeping
    'record': {
        en: 'Keep records of farming activities.',
        hi: 'कृषि गतिविधियों का रिकॉर्ड रखें।',
        mr: 'शेतकरी क्रियाकलापांचे रेकॉर्ड ठेवा।',
        es: 'Mantener registros de actividades agrícolas.'
    },

    // Nitrogen management
    'nitrogen': {
        en: 'Apply nitrogen fertilizer in split doses.',
        hi: 'नाइट्रोजन उर्वरक को विभाजित खुराक में लागू करें।',
        mr: 'नायट्रोजन खत विभक्त डोज मध्ये लागू करा।',
        es: 'Aplicar fertilizante nitrogenado en dosis divididas.'
    },

    // Phosphorus management
    'phosphorus': {
        en: 'Maintain adequate phosphorus levels.',
        hi: 'फॉस्फोरस के पर्याप्त स्तर को बनाए रखें।',
        mr: 'फॉस्फरसचे पर्याप्त स्तर टिकवून ठेवा।',
        es: 'Mantener niveles adecuados de fósforo.'
    },

    // Potassium management
    'potassium': {
        en: 'Apply potassium fertilizer based on soil needs.',
        hi: 'मिट्टी की आवश्यकता के अनुसार पोटेशियम उर्वरक लागू करें।',
        mr: 'मातीच्या गरजेनुसार पोटॅशियम खत लागू करा।',
        es: 'Aplicar fertilizante de potasio según necesidades del suelo.'
    },

    // pH management
    'ph adjustment': {
        en: 'Adjust pH level if needed through lime or sulfur application.',
        hi: 'चूने या गंधक के प्रयोग से pH स्तर को समायोजित करें।',
        mr: 'चून किंवा सल्फरचा वापर करून pH स्तर समायोजित करा।',
        es: 'Ajustar el nivel de pH si es necesario mediante cal o azufre.'
    },

    // Pest management
    'pest management': {
        en: 'Use integrated pest management practices.',
        hi: 'समन्वित कीट प्रबंधन प्रथाओं का उपयोग करें।',
        mr: 'समन्वित कीटक व्यवस्थापन प्रथा वापरा।',
        es: 'Usar prácticas de manejo integrado de plagas.'
    },

    // Organic farming
    'organic': {
        en: 'Consider adopting organic farming practices.',
        hi: 'जैविक खेती की प्रथाओं को अपनाने पर विचार करें।',
        mr: 'जैविक शेती प्रथा अवलंबित करण्याचा विचार करा।',
        es: 'Considere adoptar prácticas de agricultura orgánica.'
    },

    // Composting
    'compost': {
        en: 'Use compost to improve soil structure.',
        hi: 'मिट्टी की संरचना में सुधार के लिए खाद का उपयोग करें।',
        mr: 'मातीचे संरचना सुधारण्यासाठी कंपोस्ट वापरा।',
        es: 'Use compost para mejorar la estructura del suelo.'
    },

    // Water management
    'water management': {
        en: 'Implement efficient water management strategies.',
        hi: 'कुशल जल प्रबंधन रणनीतियों को लागू करें।',
        mr: 'कुशल जल व्यवस्थापन रणनीती लागू करा।',
        es: 'Implementar estrategias eficientes de gestión del agua.'
    },

    // Weed management
    'weed': {
        en: 'Remove weeds regularly to prevent crop competition.',
        hi: 'फसल की प्रतिस्पर्धा को रोकने के लिए नियमित रूप से खरपतवार हटाएं।',
        mr: 'पिकांच्या स्पर्धा रोखण्यासाठी नियमितपणे तण हटवा।',
        es: 'Eliminar regularmente las malezas para prevenir la competencia de cultivos.'
    }
}

// Smart matching function to find similar tips
const findMatchingTranslation = (tipText) => {
    const lowerTip = tipText.toLowerCase()
    
    // Direct match
    if (tipTranslations[tipText]) {
        return tipTranslations[tipText]
    }
    
    // Partial match - check if any key is contained in the tip
    for (const [key, translations] of Object.entries(tipTranslations)) {
        if (lowerTip.includes(key.toLowerCase())) {
            return translations
        }
    }
    
    // No match found
    return null
}

export const useTranslation = () => {
    const language = useSelector((state) => state.language.language)
    const dispatch = useDispatch()

    const t = (key) => {
        const translation = resources[language]?.translation?.[key]
        return translation || key
    }

    const translateCrop = (cropName) => {
        const cropKey = `crop_${cropName.toLowerCase().replace(/\s+/g, '_')}`
        return t(cropKey)
    }

    const translateTip = (tipText) => {
        const languageMap = {
            en: 'en',
            hi: 'hi',
            mr: 'mr',
            es: 'es'
        }
        const languageCode = languageMap[language] || 'en'
        
        // Try to find matching translation
        const matchedTranslations = findMatchingTranslation(tipText)
        
        if (matchedTranslations && matchedTranslations[languageCode]) {
            return matchedTranslations[languageCode]
        }
        
        // Fallback: return original text
        return tipText
    }

    const changeLanguage = (lang) => {
        dispatch(setLanguage(lang))
    }

    return { t, changeLanguage, language, translateCrop, translateTip }
}

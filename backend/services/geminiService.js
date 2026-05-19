import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API (will throw auth error if key is invalid, which we handle)
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export const extractDataWithGemini = async (fileBuffer, mimeType) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables. Please add it to backend/.env');
        }

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `You are an agricultural data extraction assistant. 
Carefully read the provided soil report document/image and extract the following soil parameters. 
If a value is not explicitly found, set it to null. Do not guess.
Do not include units in the values, only the numbers.
For 'moisture' or 'water content', map it to the 'humidity' key.

Return ONLY a raw JSON object, no markdown blocks, no formatting, just the raw JSON string.

Expected JSON format:
{
  "N": number | null,
  "P": number | null,
  "K": number | null,
  "ph": number | null,
  "temperature": number | null,
  "humidity": number | null,
  "rainfall": number | null
}`;
            const prompt2 = `You are an expert agricultural analyst. Extract soil parameters from this image/document.

    CRITICAL: Extract ONLY values that are CLEARLY VISIBLE in the document. Return null for ANY value you cannot find.

    Look for:
    - Nitrogen (N), N content, available nitrogen: typically 0-200 kg/ha
    - Phosphorus (P), P content, available phosphorus: typically 0-200 kg/ha  
    - Potassium (K), K content, available potassium: typically 0-300 kg/ha
    - pH level: typically 3-10
    - Temperature: typically 0-50°C
    - Humidity/Moisture/Water content: typically 0-100%
    - Rainfall: typically 0-300 mm

    Return ONLY valid JSON with no markdown, no explanation, just the raw data object:
    {"N": number or null, "P": number or null, "K": number or null, "ph": number or null, "temperature": number or null, "humidity": number or null, "rainfall": number or null}`;

        const filePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            }
        };

            console.log(`Sending file to Gemini API (${mimeType}) for soil parameter extraction...`);
            const result = await model.generateContent([prompt2, filePart]);
        const responseText = result.response.text().trim();
        
            // Parse JSON and validate structure
            let jsonStr = responseText;
        
            // Remove markdown code blocks if present
            if (jsonStr.includes('```')) {
                const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (match) {
                    jsonStr = match[1];
                }
            }

            const data = JSON.parse(jsonStr.trim());
        
            // Validate that the response has the expected keys
            const validKeys = ['N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall'];
            const hasAtLeastOneValue = validKeys.some(key => data[key] !== null && data[key] !== undefined);
        
            if (!hasAtLeastOneValue) {
                console.warn('Gemini extraction returned no values - document may not contain soil data');
            }
        
            // Log what was extracted
            const extracted = Object.entries(data)
                .filter(([_, v]) => v !== null && v !== undefined)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ');
        
            console.log(`Gemini extracted: ${extracted || 'No values found'}`);
        
        return data;

    } catch (error) {
            console.error('Gemini extraction error:', error.message);
        throw error;
    }
};

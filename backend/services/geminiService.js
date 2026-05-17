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

        const filePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            }
        };

        console.log(`Sending file to Gemini API (${mimeType})...`);
        const result = await model.generateContent([prompt, filePart]);
        const responseText = result.response.text().trim();
        
        // Clean up potential markdown formatting if the model still returns it
        let cleanJson = responseText;
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/```json\n?/, '').replace(/```\n?$/, '');
        } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/```\n?/, '').replace(/```\n?$/, '');
        }

        const data = JSON.parse(cleanJson);
        return data;

    } catch (error) {
        console.error('Gemini extraction failed:', error.message);
        throw error;
    }
};

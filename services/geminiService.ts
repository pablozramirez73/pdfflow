import { GoogleGenAI } from "@google/genai";
import { Document } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates a summary for a PDF document.
 */
export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analizza questo documento PDF. Fornisci un riassunto strutturato in italiano evidenziando i punti chiave, lo scopo del documento ed eventuali azioni richieste."
          }
        ]
      }
    });

    return response.text || "Impossibile generare un riassunto.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Errore durante l'analisi del documento.");
  }
};

/**
 * Chat with the document context.
 */
export const chatWithDocument = async (
  query: string, 
  base64Data: string, 
  mimeType: string,
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  try {
     // Note: For a true chat history with a large PDF, we usually pass the PDF only once in a cached session
     // or system instruction, but for this stateless demo, we send the context again or rely on the model's window.
     // To keep it simple and functional for a single turn or short conversation:
    
    const parts = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      },
      ...history.map(msg => ({ text: msg.text })), // Simplified history for this demo structure
      { text: `Rispondi alla seguente domanda basandoti ESCLUSIVAMENTE sul documento fornito. Rispondi in italiano.\n\nDomanda: ${query}` }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      }
    });

    return response.text || "Non ho trovato una risposta nel documento.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta.";
  }
};

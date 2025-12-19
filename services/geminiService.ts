
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

export const findLeads = async (ciudad: string, cantidad: number): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Busca conjuntos residenciales o edificios de propiedad horizontal en ${ciudad}, Colombia.
    Extrae la siguiente información para cada uno:
    1. Nombre del conjunto residencial.
    2. Nombre del administrador (si está disponible, si no poner "Por contactar").
    3. Correo electrónico de contacto (administración o consejo).
    4. Dirección física exacta.
    5. Teléfono de contacto.
    6. URL de su página web o perfil de red social.

    Enfócate en conjuntos que tengan presencia digital.
    Devuelve exactamente ${cantidad} resultados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nombreConjunto: { type: Type.STRING },
              nombreAdministrador: { type: Type.STRING },
              email: { type: Type.STRING },
              direccion: { type: Type.STRING },
              telefono: { type: Type.STRING },
              sitioWeb: { type: Type.STRING },
              ciudad: { type: Type.STRING },
              fuente: { type: Type.STRING }
            },
            required: ["nombreConjunto", "email", "direccion", "telefono"]
          }
        }
      },
    });

    const leadsJson = JSON.parse(response.text || "[]");
    return leadsJson.map((lead: any, index: number) => ({
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      ciudad: lead.ciudad || ciudad
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

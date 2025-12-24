
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

export const findLeads = async (ciudad: string, cantidad: number): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Busca una lista extensa de exactamente ${cantidad} conjuntos residenciales, edificios de apartamentos o condominios de propiedad horizontal en ${ciudad}, Colombia.
    
    INSTRUCCIONES CRÍTICAS:
    1. Debes proporcionar datos reales y verificables obtenidos a través de la búsqueda.
    2. Evita duplicados.
    3. Para cada registro, extrae:
       - nombreConjunto: Nombre oficial de la copropiedad.
       - nombreAdministrador: Nombre de la persona o empresa administradora (si no hay, poner "Administración - Por contactar").
       - email: Correo electrónico corporativo o de la administración.
       - direccion: Dirección completa incluyendo barrio si es posible.
       - telefono: Teléfono fijo o celular de contacto.
       - sitioWeb: URL del sitio, página de Facebook o Instagram oficial.
       - ciudad: ${ciudad}.
       - fuente: URL de donde se extrajo la información.

    Enfócate en conjuntos de estratos 4, 5 y 6 para asegurar que tengan administración formal.
    Si la búsqueda no arroja ${cantidad} resultados únicos de una vez, intenta buscar por diferentes zonas de la ciudad para completar el cupo.
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
    const now = new Date().toISOString();
    
    return leadsJson.map((lead: any) => ({
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      ciudad: lead.ciudad || ciudad,
      fechaCreacion: now,
      status: 'pendiente'
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

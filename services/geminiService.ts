
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

export const findLeads = async (ciudad: string, cantidad: number): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    ESTRATEGIA DE PROSPECCIÓN ÚNICA:
    Busca una lista de ${cantidad} conjuntos residenciales, edificios o condominios en ${ciudad}, Colombia.
    
    REGLAS ESTRICTAS PARA EVITAR REPETICIÓN:
    1. NO busques solo en los sectores más famosos. Explora diversos barrios de estratos 4, 5 y 6.
    2. Enfócate en copropiedades que tengan presencia digital (sitios web propios, páginas de Facebook de administración o perfiles en directorios).
    3. Asegúrate de que cada correo electrónico sea corporativo (@dominio.com) o de administración oficial (@gmail.com / @outlook.com pero con nombre del conjunto).
    
    CAMPOS REQUERIDOS EN JSON:
    - nombreConjunto: Nombre completo y oficial.
    - nombreAdministrador: Nombre del admin o la empresa delegada.
    - email: Correo de contacto directo.
    - direccion: Dirección física exacta.
    - telefono: Número de contacto.
    - sitioWeb: URL de referencia.
    - ciudad: ${ciudad}.
    - fuente: Link de donde obtuviste la info.

    Genera una lista de alta calidad técnica y jurídica.
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
      fechaCreacion: now,
      status: 'pendiente'
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

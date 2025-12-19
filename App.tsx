
import React, { useState } from 'react';
import { Lead } from './types';
import { findLeads } from './services/geminiService';
import LeadTable from './components/LeadTable';
import TemplateManager from './components/TemplateManager';
import ProposalModal from './components/ProposalModal';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_TEMPLATE = `Bogotá, {{FECHA}}

Señores:
CONSEJO DE ADMINISTRACIÓN Y REPRESENTANTE LEGAL
{{CONJUNTO}}
{{EMAIL}}
Ciudad

Asunto: Propuesta de Servicios Profesionales – Reforma al Reglamento de Propiedad Horizontal.

Cordial saludo,

Conocido el interés en la actualización del Reglamento de Propiedad Horizontal de la Copropiedad administrada por ustedes, y atendiendo lo dispuesto en el artículo 2.2.8.18.12.1.6. del decreto 768 de 2025 referente a la publicidad del régimen de propiedad horizontal, según el cual, las Asambleas de las Copropiedades deben incorporar en sus reglamentos PH el respectivo manual de convivencia, acogiendo los parámetros establecidos por la jurisprudencia constitucional en la materia, para cuando fuere necesario las autoridades de policía puedan desarrollar, sin ambigüedad, el proceso único de policía para la convivencia y seguridad ciudadana, regulado en dicho decreto, sin menoscabo de las funciones otorgadas al Comité de Convivencia por el numeral 1 del artículo 58 de la ley 675 de 2001, quienes, de acuerdo al artículo 2.2.8.18.12.1.8. ibidem, continúan conociendo de los conflictos de convivencia que se susciten en la copropiedad, pongo a su consideración la siguiente propuesta:

“Asesoría jurídica para actualización del Reglamento de Propiedad Horizontal del {{CONJUNTO}}, atendiendo las necesidades propias de la copropiedad, a fin de incluir el régimen sancionatorio con los aspectos detectados por ustedes como sensibles, en cuanto a convivencia, encaminado a la salvaguarda del debido proceso, (Capítulo II, ley 675 de 2001); así como también el régimen interno de contratación; funciones del Consejo de administración y tenencia responsable de mascotas”.

Términos:
1. Actividades:
1.1. Reunión con el Consejo de Administración y Representante Legal, previa a entrega de productos, con el fin de concertar aspectos a incluir y actualizar. (presencial o virtual).
1.2. Entrega de Reglamento PH debidamente actualizado, a los treinta (30) días hábiles contados a partir de la reunión relacionada en el numeral anterior.
1.3. Reunión con el Consejo de Administración y Representante Legal, una vez entregado el documento final para socializar su contenido. (presencial o virtual).

2. Plazo de ejecución: Noventa (90) días contados a partir de la firma del contrato.

4. Valor de los honorarios: Cinco (5) salarios mínimos legales mensuales vigentes (5 SMLMV) fuera de retenciones.

Sin otro particular, quedamos atentos a sus comentarios.

Atentamente,

Lulú Cely Rubiano
Abogada Experta en Propiedad Horizontal
C.C. 51.672.493 | T.P. 104340 C.S. de la J.

Jairo Segura A.
Director General
Segura & Asociados Abogados`;

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [ciudad, setCiudad] = useState('Bogotá');
  const [cantidad, setCantidad] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<'leads' | 'template'>('leads');

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const newLeads = await findLeads(ciudad, cantidad);
      setLeads(prev => [...newLeads, ...prev]);
    } catch (err: any) {
      setError("No se pudieron obtener los datos. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const improveTemplate = async () => {
    setIsImproving(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Eres un experto en marketing jurídico. Mejora esta propuesta de la Dra. Lulú Cely Rubiano y Jairo Segura A. para que sea más impactante, pero mantén EXACTAMENTE las referencias legales y las firmas finales. Propuesta:\n\n${template}`
      });
      if (response.text) setTemplate(response.text.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Nombre Conjunto', 'Administrador', 'Email', 'Direccion', 'Telefono', 'Sitio Web', 'Ciudad'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [`"${l.nombreConjunto}"`, `"${l.nombreAdministrador}"`, `"${l.email}"`, `"${l.direccion}"`, `"${l.telefono}"`, `"${l.sitioWeb}"`, `"${l.ciudad}"`].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_propiedad_horizontal.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">S&A</div>
            <div>
              <h1 className="text-xl font-bold">Segura & Asociados</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Prospección Propiedad Horizontal</p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('leads')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'leads' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Buscador
            </button>
            <button 
              onClick={() => setView('template')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'template' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Plantilla
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {view === 'template' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TemplateManager 
              template={template} 
              setTemplate={setTemplate} 
              onImprove={improveTemplate}
              isImproving={isImproving}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ciudad en Colombia</label>
                  <input 
                    type="text" 
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad de leads</label>
                  <select 
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={5}>5 Resultados</option>
                    <option value={10}>10 Resultados</option>
                    <option value={25}>25 Resultados</option>
                  </select>
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Buscando...' : 'Encontrar Conjuntos'}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Base de Datos de Prospección
              </h2>
              <button 
                onClick={exportToCSV}
                disabled={leads.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                Exportar CSV para Word
              </button>
            </div>

            <LeadTable 
              leads={leads} 
              onDelete={(id) => setLeads(leads.filter(l => l.id !== id))}
              onEdit={(lead) => setSelectedLead(lead)} 
            />
          </div>
        )}
      </main>

      {selectedLead && (
        <ProposalModal 
          lead={selectedLead}
          template={template}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default App;

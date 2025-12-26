
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, CampaignLog } from './types';
import { findLeads } from './services/geminiService';
import LeadTable from './components/LeadTable';
import TemplateManager from './components/TemplateManager';
import ProposalModal from './components/ProposalModal';
import LeadFormModal from './components/LeadFormModal';
import CampaignModal from './components/CampaignModal';
import CampaignLogView from './components/CampaignLogView';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY_LOGS = 'SA_CAMPAIGN_LOGS';
const STORAGE_KEY_GLOBAL_REGISTRY = 'SA_GLOBAL_LEAD_REGISTRY';

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

Sin otro particular, quedamos atentos a sus comentarios. Para mayor información sobre nuestra trayectoria, pueden visitar nuestro sitio web: https://servijuridicoslaborales.com/

Atentamente,

Lulú Cely Rubiano
Abogada Experta en Propiedad Horizontal
C.C. 51.672.493 | T.P. 104340 C.S. de la J.

Jairo Segura A.
Director General
Celular: 3118967524
Segura & Asociados Abogados
Sitio Web: https://servijuridicoslaborales.com/`;

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [globalRegistry, setGlobalRegistry] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [ciudad, setCiudad] = useState('Bogotá');
  const [cantidad, setCantidad] = useState(100);
  const [error, setError] = useState<string | null>(null);
  
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [view, setView] = useState<'leads' | 'template' | 'logs'>('leads');
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);

  // Cargar historial y registro global al inicio
  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    if (savedLogs) setCampaignLogs(JSON.parse(savedLogs));

    const savedRegistry = localStorage.getItem(STORAGE_KEY_GLOBAL_REGISTRY);
    if (savedRegistry) setGlobalRegistry(JSON.parse(savedRegistry));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pedimos a la IA que busque, pasando información sobre la ciudad
      const results = await findLeads(ciudad, cantidad);
      
      // Filtrar resultados contra el registro global para asegurar que son NUEVOS
      const newLeads = results.filter(lead => {
        const identity = `${lead.nombreConjunto.toLowerCase().trim()}_${lead.ciudad.toLowerCase().trim()}`;
        return !globalRegistry.includes(identity);
      });

      if (newLeads.length === 0 && results.length > 0) {
        setError("La IA encontró resultados pero todos ya existen en tu historial global. Intenta con otra zona o ciudad.");
      } else {
        // Actualizar registro global con las nuevas identidades
        const newIdentities = newLeads.map(l => `${l.nombreConjunto.toLowerCase().trim()}_${l.ciudad.toLowerCase().trim()}`);
        const updatedRegistry = [...globalRegistry, ...newIdentities];
        setGlobalRegistry(updatedRegistry);
        localStorage.setItem(STORAGE_KEY_GLOBAL_REGISTRY, JSON.stringify(updatedRegistry));

        // Añadir a la lista actual de la sesión
        setLeads(prev => [...newLeads, ...prev]);
      }
    } catch (err: any) {
      setError("Error en la búsqueda. Por favor reintenta.");
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
        contents: `Mejora esta propuesta legal manteniendo firmas y leyes: ${template}`
      });
      if (response.text) setTemplate(response.text.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  };

  const markAsProcesado = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'procesado' } : l));
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setEditingLead(null);
  };

  const handleCampaignComplete = (log: CampaignLog) => {
    const sentEmails = log.recipients.filter(r => r.status === 'success').map(r => r.email);
    setLeads(prev => prev.map(l => sentEmails.includes(l.email) ? { ...l, status: 'enviado' } : l));
    const updatedLogs = [log, ...campaignLogs];
    setCampaignLogs(updatedLogs);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
    setIsCampaignOpen(false);
    setView('logs');
  };

  const generateAndDownloadCSV = (data: Lead[], fileName: string) => {
    const headers = ['CONJUNTO', 'ADMINISTRADOR', 'EMAIL', 'DIRECCION', 'TELEFONO', 'CIUDAD', 'FECHA_CAPTURA'];
    const csvContent = [
      headers.join(','),
      ...data.map(l => [
        `"${l.nombreConjunto.replace(/"/g, '""')}"`, 
        `"${(l.nombreAdministrador || 'Admin').replace(/"/g, '""')}"`, 
        `"${l.email}"`, 
        `"${l.direccion.replace(/"/g, '""')}"`, 
        `"${l.telefono}"`, 
        `"${l.ciudad}"`,
        `"${l.fechaCreacion}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const exportInChunks = (chunkSize: number = 100) => {
    if (leads.length === 0) return;
    const totalChunks = Math.ceil(leads.length / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = leads.slice(i * chunkSize, (i + 1) * chunkSize);
      generateAndDownloadCSV(chunk, `Lote_Unico_${i + 1}_${ciudad}_${new Date().getTime()}.csv`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner">S&A</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Segura & Asociados</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black">Marketing Legal Automático</p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setView('leads')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'leads' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Buscador</button>
            <button onClick={() => setView('template')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'template' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Plantilla</button>
            <button onClick={() => setView('logs')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Historial</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {view === 'template' ? (
          <TemplateManager template={template} setTemplate={setTemplate} onImprove={improveTemplate} isImproving={isImproving} />
        ) : view === 'logs' ? (
          <CampaignLogView logs={campaignLogs} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Panel de Búsqueda de Leads Únicos */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  Total Únicos Registrados: {globalRegistry.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ciudad / Sector Específico</label>
                  <input type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Usaquén, Bogotá" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad (Nuevos)</label>
                  <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                    <option value={10}>10 Leads</option>
                    <option value={50}>50 Leads</option>
                    <option value={100}>100 Leads (Lote Completo)</option>
                  </select>
                </div>
                <button onClick={handleSearch} disabled={loading} className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  {loading ? 'Buscando Datos Únicos...' : '🔍 Buscar Nuevos Prospectos'}
                </button>
              </div>
              {error && <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Prospectos de esta sesión ({leads.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => exportInChunks(100)} disabled={leads.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg">
                  📥 Descargar Lote de 100
                </button>
                <button onClick={() => setIsCampaignOpen(true)} disabled={leads.filter(l => l.status === 'procesado').length === 0} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 shadow-lg">
                  ✉️ Enviar Campaña
                </button>
              </div>
            </div>

            <LeadTable leads={leads} onDelete={(id) => setLeads(leads.filter(l => l.id !== id))} onSelectForProposal={(lead) => setSelectedLead(lead)} onEditLead={(lead) => setEditingLead(lead)} />
          </div>
        )}
      </main>

      {selectedLead && <ProposalModal lead={selectedLead} template={template} onClose={() => { markAsProcesado(selectedLead.id); setSelectedLead(null); }} />}
      {editingLead && <LeadFormModal lead={editingLead} onSave={handleUpdateLead} onClose={() => setEditingLead(null)} />}
      {isCampaignOpen && <CampaignModal leads={leads} template={template} onClose={() => setIsCampaignOpen(false)} onComplete={handleCampaignComplete} />}
    </div>
  );
};

export default App;

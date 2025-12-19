
import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [ciudad, setCiudad] = useState('Bogotá');
  const [cantidad, setCantidad] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [view, setView] = useState<'leads' | 'template' | 'logs'>('leads');
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);

  // Load logs from local storage on init
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        setCampaignLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing campaign logs", e);
      }
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const newLeads = await findLeads(ciudad, cantidad);
      const leadsWithStatus = newLeads.map(l => ({ ...l, status: 'pendiente' as const }));
      setLeads(prev => [...leadsWithStatus, ...prev]);
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

  const markAsProcesado = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'procesado' } : l));
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setEditingLead(null);
  };

  const handleCampaignComplete = (log: CampaignLog) => {
    const sentIds = log.recipients.filter(r => r.status === 'success').map(r => r.email);
    // Update local lead status
    setLeads(prev => prev.map(l => sentIds.includes(l.email) ? { ...l, status: 'enviado' } : l));
    
    // Save log
    const updatedLogs = [log, ...campaignLogs];
    setCampaignLogs(updatedLogs);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
    
    setIsCampaignOpen(false);
    setView('logs');
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const validationErrors: string[] = [];
    
    leads.forEach(l => {
      const missingFields = [];
      if (!l.nombreConjunto) missingFields.push('Nombre');
      if (!l.email) missingFields.push('Email');
      if (!l.direccion) missingFields.push('Dirección');
      if (!l.telefono) missingFields.push('Teléfono');
      
      if (missingFields.length > 0) {
        validationErrors.push(`• ${l.nombreConjunto || 'Conjunto sin nombre (ID: ' + l.id + ')'}: falta ${missingFields.join(', ')}`);
      }
    });

    if (validationErrors.length > 0) {
      const detailedMessage = `No se puede exportar. Los siguientes prospectos están incompletos:\n\n${validationErrors.slice(0, 8).join('\n')}${validationErrors.length > 8 ? '\n... y otros ' + (validationErrors.length - 8) + ' más.' : ''}\n\nPor favor, usa el botón de editar (✏️) en la tabla para completar la información antes de continuar.`;
      alert(detailedMessage);
      return;
    }

    const headers = ['CONJUNTO', 'ADMINISTRADOR', 'EMAIL', 'DIRECCION', 'TELEFONO', 'CIUDAD', 'FECHA_CAPTURA'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
        `"${l.nombreConjunto.replace(/"/g, '""')}"`, 
        `"${(l.nombreAdministrador || 'Señor Administrador').replace(/"/g, '""')}"`, 
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
    link.download = `base_datos_S&A_${ciudad.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const procesadosCount = leads.filter(l => l.status === 'procesado').length;

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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TemplateManager template={template} setTemplate={setTemplate} onImprove={improveTemplate} isImproving={isImproving} />
          </div>
        ) : view === 'logs' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Historial de Campañas</h2>
            <CampaignLogView logs={campaignLogs} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Panel de Búsqueda */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ciudad / Sector</label>
                  <input type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resultados</label>
                  <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                    <option value={5}>5 Conjuntos</option>
                    <option value={10}>10 Conjuntos</option>
                    <option value={25}>25 Conjuntos</option>
                  </select>
                </div>
                <button onClick={handleSearch} disabled={loading} className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-200">
                  {loading ? 'Buscando...' : 'Iniciar Búsqueda'}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Leads Encontrados</h2>
              <div className="flex gap-2">
                <button onClick={exportToCSV} disabled={leads.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar Excel
                </button>
                <button 
                  onClick={() => setIsCampaignOpen(true)}
                  disabled={procesadosCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                >
                  🚀 Iniciar Campaña ({procesadosCount})
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

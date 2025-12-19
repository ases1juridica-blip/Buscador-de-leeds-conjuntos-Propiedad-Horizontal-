
import React, { useState, useEffect } from 'react';
import { Lead, CampaignLog, CampaignRecipientLog } from '../types';

interface CampaignModalProps {
  leads: Lead[];
  template: string;
  onClose: () => void;
  onComplete: (log: CampaignLog) => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ leads, template, onClose, onComplete }) => {
  const [subject, setSubject] = useState('Propuesta de Actualización de Reglamento PH - Segura & Asociados');
  const [body, setBody] = useState(template);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(-1);
  const [logMessages, setLogMessages] = useState<{ name: string; status: 'success' | 'error' | 'sending' }[]>([]);

  const processedLeads = leads.filter(l => l.status === 'procesado');

  const startCampaign = async () => {
    if (processedLeads.length === 0) return;
    setIsSending(true);
    const recipientLogs: CampaignRecipientLog[] = [];

    for (let i = 0; i < processedLeads.length; i++) {
      const lead = processedLeads[i];
      setCurrentLeadIndex(i);
      setLogMessages(prev => [...prev, { name: lead.nombreConjunto, status: 'sending' }]);

      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLogMessages(prev => {
        const newLog = [...prev];
        newLog[i].status = 'success';
        return newLog;
      });
      
      recipientLogs.push({
        leadName: lead.nombreConjunto,
        email: lead.email,
        status: 'success'
      });
      
      setProgress(Math.round(((i + 1) / processedLeads.length) * 100));
    }

    setIsSending(false);
    
    const campaignLog: CampaignLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      subject: subject,
      recipients: recipientLogs
    };

    setTimeout(() => {
      alert('¡Campaña finalizada con éxito!');
      onComplete(campaignLog);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">Centro de Campañas Masivas</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {processedLeads.length} Destinatarios listos para envío
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSending} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-8 overflow-y-auto space-y-6 border-r border-slate-100">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asunto del Correo</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cuerpo del Mensaje (Base Plantilla)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isSending}
                className="w-full h-80 px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-serif text-sm leading-relaxed text-slate-700"
              />
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50 p-6 overflow-y-auto flex flex-col border-l border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Progreso de la Campaña</h3>
            
            {isSending && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-black text-slate-600">
                  <span>Enviando...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {logMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400 font-medium">Los envíos aparecerán aquí una vez inicies la campaña.</p>
                </div>
              ) : (
                logMessages.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2">
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[140px]">{item.name}</span>
                    {item.status === 'sending' ? (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    ) : (
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
          <p className="text-xs text-slate-400 font-bold italic">Nota: El envío masivo simula una cola de 1s por correo para efectos de demostración.</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={startCampaign}
              disabled={isSending || processedLeads.length === 0}
              className="px-10 py-2.5 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
            >
              {isSending ? 'Procesando...' : '🚀 Lanzar Campaña'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;

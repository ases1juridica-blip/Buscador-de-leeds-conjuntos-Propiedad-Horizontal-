
import React, { useState } from 'react';
import { CampaignLog } from '../types';

interface CampaignLogViewProps {
  logs: CampaignLog[];
}

const CampaignLogView: React.FC<CampaignLogViewProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<CampaignLog | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-500 font-bold text-lg">No hay campañas registradas.</p>
        <p className="text-slate-400 text-sm mt-1">Lanza tu primera campaña masiva para ver el historial aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Campaña</span>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(log.date)}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{log.subject}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {log.recipients.length} destinatarios • {log.recipients.filter(r => r.status === 'success').length} envíos exitosos
                </p>
              </div>
              <button 
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-2"
              >
                {selectedLog?.id === log.id ? 'Ocultar Detalles' : 'Ver Destinatarios'}
                <svg className={`w-4 h-4 transition-transform ${selectedLog?.id === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {selectedLog?.id === log.id && (
              <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {log.recipients.map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate">{rec.leadName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{rec.email}</p>
                      </div>
                      <div className={`ml-2 w-2 h-2 rounded-full ${rec.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignLogView;

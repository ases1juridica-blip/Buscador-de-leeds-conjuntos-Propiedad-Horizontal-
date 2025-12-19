
import React, { useState, useMemo, useEffect } from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onSelectForProposal: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

type SortConfig = {
  key: keyof Lead;
  direction: 'asc' | 'desc';
} | null;

type StatusFilter = 'todos' | 'pendiente' | 'procesado' | 'enviado';

const LeadTable: React.FC<LeadTableProps> = ({ leads, onDelete, onSelectForProposal, onEditLead }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const isComplete = (lead: Lead) => {
    return !!(lead.nombreConjunto && lead.email && lead.direccion && lead.telefono);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredLeads = useMemo(() => {
    if (statusFilter === 'todos') return leads;
    return leads.filter(lead => lead.status === statusFilter);
  }, [leads, statusFilter]);

  const sortedLeads = useMemo(() => {
    let sortableLeads = [...filteredLeads];
    if (sortConfig !== null) {
      sortableLeads.sort((a, b) => {
        const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
        const bValue = (b[sortConfig.key] || "").toString().toLowerCase();
        return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : (aValue > bValue ? (sortConfig.direction === 'asc' ? 1 : -1) : 0);
      });
    }
    return sortableLeads;
  }, [filteredLeads, sortConfig]);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(start, start + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  const requestSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleWhatsAppClick = (telefono: string) => {
    const cleanNumber = telefono.replace(/\D/g, '');
    const message = encodeURIComponent('Hola, me gustaría solicitar más información sobre sus servicios.');
    const url = `https://wa.me/${cleanNumber.startsWith('57') ? cleanNumber : '57' + cleanNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const stats = {
    todos: leads.length,
    pendiente: leads.filter(l => l.status === 'pendiente' || !l.status).length,
    procesado: leads.filter(l => l.status === 'procesado').length,
    enviado: leads.filter(l => l.status === 'enviado').length,
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-slate-500 font-bold text-lg">Tu base de datos está vacía.</p>
        <p className="text-slate-400 text-sm mt-1">Busca conjuntos por ciudad para comenzar tu campaña.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros de Estado */}
      <div className="flex flex-wrap items-center gap-2 px-2">
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${statusFilter === 'todos' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
        >
          Todos ({stats.todos})
        </button>
        <button
          onClick={() => setStatusFilter('pendiente')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${statusFilter === 'pendiente' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
        >
          Pendientes ({stats.pendiente})
        </button>
        <button
          onClick={() => setStatusFilter('procesado')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${statusFilter === 'procesado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
        >
          Listos ({stats.procesado})
        </button>
        <button
          onClick={() => setStatusFilter('enviado')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${statusFilter === 'enviado' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
        >
          Enviados ({stats.enviado})
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
              {['fechaCreacion', 'nombreConjunto', 'nombreAdministrador', 'ciudad', 'email', 'telefono'].map((key) => (
                <th key={key} onClick={() => requestSort(key as keyof Lead)} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors">
                  {key === 'nombreConjunto' ? 'Conjunto Residencial' : key === 'fechaCreacion' ? 'Fecha' : key.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                  No se encontraron prospectos con este estado.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const complete = isComplete(lead);
                return (
                  <tr key={lead.id} className={`${complete ? 'hover:bg-blue-50/30' : 'bg-red-50/50 hover:bg-red-100/50'} transition-colors group`}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {!complete ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase ring-1 ring-red-200 animate-pulse">Incompleto</span>
                      ) : lead.status === 'enviado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase ring-1 ring-blue-200">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                          Enviado
                        </span>
                      ) : lead.status === 'procesado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          Listo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-slate-500">{formatDate(lead.fechaCreacion)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`text-sm font-black ${!lead.nombreConjunto ? 'text-red-600' : 'text-slate-900'} leading-tight`}>{lead.nombreConjunto || 'Nombre Faltante'}</div>
                      <div className={`text-[11px] ${!lead.direccion ? 'text-red-400' : 'text-slate-400'} font-medium truncate max-w-[200px] mt-0.5`}>{lead.direccion || 'Dirección Faltante'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-600 font-bold">{lead.nombreAdministrador}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic">Admin</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-bold">{lead.ciudad}</td>
                    <td className="px-6 py-5">
                      <div className={`text-sm font-black tracking-tight ${!lead.email ? 'text-red-500 italic' : 'text-blue-600'}`}>{lead.email || 'Sin Email'}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{lead.telefono || 'Sin Tel.'}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.telefono && (
                          <button 
                            onClick={() => handleWhatsAppClick(lead.telefono)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Contactar por WhatsApp"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        )}
                        <button onClick={() => onEditLead(lead)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button 
                          onClick={() => onSelectForProposal(lead)} 
                          disabled={!complete}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${complete ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white' : 'bg-slate-50 text-slate-300 border-slate-100 opacity-50 cursor-not-allowed'}`}
                        >
                          ✉️ Propuesta
                        </button>
                        <button onClick={() => onDelete(lead.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 text-xs font-bold text-slate-400">
        <div className="flex items-center gap-4">
          <span>Mostrando {paginatedLeads.length} de {filteredLeads.length} prospectos</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span>Página {currentPage} de {totalPages || 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-black text-slate-600 shadow-sm"
          >
            Anterior
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-black text-slate-600 shadow-sm"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;

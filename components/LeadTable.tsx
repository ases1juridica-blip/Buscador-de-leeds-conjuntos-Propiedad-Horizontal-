
import React, { useState, useMemo } from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onEdit: (lead: Lead) => void;
}

type SortConfig = {
  key: keyof Lead;
  direction: 'asc' | 'desc';
} | null;

const LeadTable: React.FC<LeadTableProps> = ({ leads, onDelete, onEdit }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const sortedLeads = useMemo(() => {
    let sortableLeads = [...leads];
    if (sortConfig !== null) {
      sortableLeads.sort((a, b) => {
        const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
        const bValue = (b[sortConfig.key] || "").toString().toLowerCase();
        return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : (aValue > bValue ? (sortConfig.direction === 'asc' ? 1 : -1) : 0);
      });
    }
    return sortableLeads;
  }, [leads, sortConfig]);

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
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
              {['nombreConjunto', 'nombreAdministrador', 'email', 'telefono'].map((key) => (
                <th 
                  key={key}
                  onClick={() => requestSort(key as keyof Lead)}
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {key === 'nombreConjunto' ? 'Conjunto Residencial' : key.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  {lead.status === 'procesado' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Listo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-black text-slate-900 leading-tight">{lead.nombreConjunto}</div>
                  <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{lead.direccion}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-slate-600 font-bold">{lead.nombreAdministrador}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic">Admin / Rep. Legal</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-blue-600 font-black tracking-tight">{lead.email}</div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium">{lead.telefono}</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => onEdit(lead)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-blue-100 shadow-sm"
                    >
                      ✉️ Propuesta
                    </button>
                    <button 
                      onClick={() => onDelete(lead.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar de la lista"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 text-xs font-bold text-slate-400">
        <div className="flex items-center gap-4">
          <span>Mostrando {paginatedLeads.length} de {leads.length} prospectos</span>
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

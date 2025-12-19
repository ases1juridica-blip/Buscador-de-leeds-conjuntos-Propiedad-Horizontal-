
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
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Inicia una búsqueda para encontrar clientes potenciales.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              {['nombreConjunto', 'nombreAdministrador', 'email', 'telefono'].map((key) => (
                <th 
                  key={key}
                  onClick={() => requestSort(key as keyof Lead)}
                  className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {key.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{lead.nombreConjunto}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[180px]">{lead.direccion}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{lead.nombreAdministrador}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{lead.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{lead.telefono}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(lead)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      ✉️ Propuesta
                    </button>
                    <button 
                      onClick={() => onDelete(lead.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="flex items-center justify-between px-2 text-sm text-slate-500">
        <div>Mostrando {paginatedLeads.length} de {leads.length} leads</div>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="font-bold text-slate-900">{currentPage}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;

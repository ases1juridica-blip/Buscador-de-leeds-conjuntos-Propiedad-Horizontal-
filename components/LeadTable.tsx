
import React from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onEdit: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onDelete, onEdit }) => {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
        <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-500 font-medium">No hay leads encontrados aún. Inicia una búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Conjunto</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrador</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dirección</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{lead.nombreConjunto}</div>
                <div className="text-xs text-slate-500 truncate max-w-[150px]">{lead.sitioWeb}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.nombreAdministrador}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{lead.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.telefono}</td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">{lead.direccion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onDelete(lead.id)}
                  className="text-red-600 hover:text-red-900 ml-4"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;

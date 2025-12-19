
import React, { useState, useCallback } from 'react';
import { Lead } from './types';
import { findLeads } from './services/geminiService';
import LeadTable from './components/LeadTable';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [ciudad, setCiudad] = useState('Bogotá');
  const [cantidad, setCantidad] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const newLeads = await findLeads(ciudad, cantidad);
      setLeads(prev => [...newLeads, ...prev]);
    } catch (err: any) {
      setError("No se pudieron obtener los datos. Por favor verifica tu conexión o intenta con otra ciudad.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Nombre Conjunto', 'Administrador', 'Email', 'Direccion', 'Telefono', 'Sitio Web', 'Ciudad'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
        `"${l.nombreConjunto}"`,
        `"${l.nombreAdministrador}"`,
        `"${l.email}"`,
        `"${l.direccion}"`,
        `"${l.telefono}"`,
        `"${l.sitioWeb}"`,
        `"${l.ciudad}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_propiedad_horizontal_${ciudad}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">PropLead Finder Colombia 🇨🇴</h1>
            <p className="text-slate-600 mt-1">Automatización de base de datos para asesoría en propiedad horizontal.</p>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={exportToCSV}
              disabled={leads.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar para Excel (CSV)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Search Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad en Colombia</label>
              <input 
                type="text" 
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ej: Medellín, Cali, Barranquilla..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad de leads</label>
              <select 
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value={5}>5 Leads</option>
                <option value={10}>10 Leads</option>
                <option value={20}>20 Leads</option>
              </select>
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Encontrar Clientes
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-semibold text-slate-800">Resultados Encontrados ({leads.length})</h2>
          <span className="text-sm text-slate-500 italic">Los datos se extraen de fuentes públicas mediante IA y Google Search.</span>
        </div>

        {/* Leads Table */}
        <LeadTable 
          leads={leads} 
          onDelete={handleDelete}
          onEdit={(lead) => console.log('Edit', lead)}
        />

        {/* Instructions/Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Busca Leads</h3>
            <p className="text-sm text-slate-600">Ingresa una ciudad principal de Colombia. La IA buscará sitios web, redes sociales y registros públicos.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Exporta a Excel</h3>
            <p className="text-sm text-slate-600">Descarga la tabla en formato CSV, el cual es compatible con Microsoft Excel y Google Sheets.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Campaña de Marketing</h3>
            <p className="text-sm text-slate-600">Usa la función de "Combinar Correspondencia" en Microsoft Word con tu archivo de Excel para enviar cartas masivas.</p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 py-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Herramienta de Prospección de Propiedad Horizontal - Colombia.
      </footer>
    </div>
  );
};

export default App;

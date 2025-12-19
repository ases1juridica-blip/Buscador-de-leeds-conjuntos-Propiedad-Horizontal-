
import React from 'react';

interface TemplateManagerProps {
  template: string;
  setTemplate: (val: string) => void;
  onImprove: () => void;
  isImproving: boolean;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ template, setTemplate, onImprove, isImproving }) => {
  const tags = [
    { label: 'Conjunto', value: '{{CONJUNTO}}' },
    { label: 'Administrador', value: '{{ADMINISTRADOR}}' },
    { label: 'Dirección', value: '{{DIRECCION}}' },
    { label: 'Ciudad', value: '{{CIUDAD}}' },
    { label: 'Teléfono', value: '{{TELEFONO}}' },
  ];

  const insertTag = (tag: string) => {
    setTemplate(template + " " + tag);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Plantilla Maestra de Propuesta
        </h3>
        <button 
          onClick={onImprove}
          disabled={isImproving}
          className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          {isImproving ? 'Mejorando...' : '✨ Mejorar con IA'}
        </button>
      </div>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-serif text-sm bg-slate-50/30"
            placeholder="Escribe aquí tu propuesta comercial..."
          />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Etiquetas Dinámicas</p>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {tags.map(tag => (
              <button
                key={tag.value}
                onClick={() => insertTag(tag.value)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all text-left flex justify-between items-center group"
              >
                <span>{tag.label}</span>
                <span className="text-[10px] text-slate-400 font-mono group-hover:text-blue-400">{tag.value}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-800">
            <strong>Tip:</strong> Estas etiquetas se reemplazarán automáticamente con los datos de cada cliente.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;

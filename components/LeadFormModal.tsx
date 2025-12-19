
import React, { useState } from 'react';
import { Lead } from '../types';

interface LeadFormModalProps {
  lead: Lead;
  onSave: (updatedLead: Lead) => void;
  onClose: () => void;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ lead, onSave, onClose }) => {
  const [formData, setFormData] = useState<Lead>({ ...lead });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    onSave(formData);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('es-CO');
    } catch (e) {
      return isoString;
    }
  };

  const isUrlValid = (url: string) => {
    if (!url) return true;
    try {
      const pattern = new RegExp('^(https?:\\/\\/)?'+ 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
        '(\\#[-a-z\\d_]*)?$','i');
      return !!pattern.test(url);
    } catch (e) {
      return false;
    }
  };

  const isEmailValid = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const isPhoneValid = (phone: string) => {
    // Acepta formatos comunes en Colombia: 10 dígitos (celular) o 7 dígitos (fijo local)
    // También permite espacios, guiones o paréntesis
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 12;
  };

  const urlError = formData.sitioWeb !== "" && !isUrlValid(formData.sitioWeb);
  const emailError = formData.email !== "" && !isEmailValid(formData.email);
  const phoneError = formData.telefono !== "" && !isPhoneValid(formData.telefono);
  
  const isInvalid = !formData.nombreConjunto || 
                    !formData.email || emailError || 
                    !formData.direccion || 
                    !formData.telefono || phoneError || 
                    urlError;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Editar Información</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Captura (Sistema)</label>
            <p className="text-sm font-bold text-slate-600">{formatDate(formData.fechaCreacion)}</p>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Nombre del Conjunto</label>
            <input
              type="text"
              name="nombreConjunto"
              value={formData.nombreConjunto}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!formData.nombreConjunto ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Administrador</label>
            <input
              type="text"
              name="nombreAdministrador"
              value={formData.nombreAdministrador}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${emailError || !formData.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              required
            />
            {emailError && <p className="text-[10px] text-red-500 font-bold mt-1">Formato de correo inválido</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${phoneError || !formData.telefono ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                required
              />
              {phoneError && <p className="text-[10px] text-red-500 font-bold mt-1">Número inválido (7-12 dígitos)</p>}
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!formData.direccion ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sitio Web / Red Social</label>
            <input
              type="text"
              name="sitioWeb"
              value={formData.sitioWeb}
              onChange={handleChange}
              placeholder="https://ejemplo.com"
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${urlError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
            />
            {urlError && <p className="text-[10px] text-red-500 font-bold mt-1">Formato de URL inválido (ej: https://web.com)</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isInvalid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;

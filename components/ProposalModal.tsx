
import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import * as docx from 'docx';

interface ProposalModalProps {
  lead: Lead;
  template: string;
  onClose: () => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ lead, template, onClose }) => {
  const [personalizedContent, setPersonalizedContent] = useState('');

  useEffect(() => {
    // Lógica de saludo condicional
    let saludo = "CONSEJO DE ADMINISTRACIÓN Y REPRESENTANTE LEGAL";
    if (!lead.nombreAdministrador || lead.nombreAdministrador.toLowerCase().includes("por contactar")) {
      saludo = "SEÑOR(A) ADMINISTRADOR(A) Y CONSEJO DE ADMINISTRACIÓN";
    } else {
      saludo = `ATENCIÓN: ${lead.nombreAdministrador.toUpperCase()}\nCONSEJO DE ADMINISTRACIÓN Y REPRESENTANTE LEGAL`;
    }

    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let content = template
      .replace(/{{CONJUNTO}}/g, lead.nombreConjunto.toUpperCase())
      .replace(/CONSEJO DE ADMINISTRACIÓN Y REPRESENTANTE LEGAL/g, saludo)
      .replace(/{{DIRECCION}}/g, lead.direccion)
      .replace(/{{CIUDAD}}/g, lead.ciudad)
      .replace(/{{EMAIL}}/g, lead.email)
      .replace(/{{FECHA}}/g, fechaHoy)
      .replace(/{{TELEFONO}}/g, lead.telefono);

    setPersonalizedContent(content);
  }, [lead, template]);

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Propuesta Profesional - ${lead.nombreConjunto}`);
    const body = encodeURIComponent(personalizedContent);
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const handleDownloadDocx = () => {
    const lines = personalizedContent.split('\n');
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: lines.map(line => {
          const isSignature = line.includes('Lulú Cely Rubiano') || line.includes('Jairo Segura A.');
          return new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: line,
                bold: isSignature || line.startsWith('Asunto:') || line.startsWith('Señores:'),
                size: isSignature ? 24 : 22,
                font: "Arial"
              })
            ],
            spacing: { after: 120 }
          });
        }),
      }],
    });

    docx.Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Propuesta_${lead.nombreConjunto.replace(/\s+/g, '_')}.docx`;
      a.click();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Revisión de Propuesta</h2>
            <p className="text-xs text-slate-500 font-medium">Firma Conjunta: Lulú Cely R. & Jairo Segura A.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-white">
          <textarea
            value={personalizedContent}
            onChange={(e) => setPersonalizedContent(e.target.value)}
            className="w-full h-full min-h-[500px] p-8 text-slate-800 leading-relaxed border border-slate-100 rounded-xl focus:ring-0 outline-none font-serif text-lg bg-slate-50/20"
          />
        </div>

        <div className="p-6 border-t border-slate-200 bg-white flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadDocx}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              Descargar Word (.docx)
            </button>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSendEmail}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enviar por Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;

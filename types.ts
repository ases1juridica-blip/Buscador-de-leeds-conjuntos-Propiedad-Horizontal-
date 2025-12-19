
export interface Lead {
  id: string;
  nombreConjunto: string;
  nombreAdministrador: string;
  email: string;
  direccion: string;
  telefono: string;
  sitioWeb: string;
  ciudad: string;
  fuente: string;
  fechaCreacion: string;
  status?: 'pendiente' | 'procesado' | 'enviado';
}

export interface SearchParams {
  ciudad: string;
  cantidad: number;
}

export interface CampaignRecipientLog {
  leadName: string;
  email: string;
  status: 'success' | 'error';
}

export interface CampaignLog {
  id: string;
  date: string;
  subject: string;
  recipients: CampaignRecipientLog[];
}

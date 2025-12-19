
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
  status?: 'pendiente' | 'procesado';
}

export interface SearchParams {
  ciudad: string;
  cantidad: number;
}

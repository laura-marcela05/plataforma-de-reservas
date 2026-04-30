// HU-05 — Reserva
export interface Reserva {
  id: number;
  usuarioId: number;
  espacioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  fechaCreacion: string;
  createdAt: string;
  updatedAt: string;
}

// HU-01 — Usuario
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  membresiaId: number;
  createdAt: string;
  updatedAt: string;
}

import type { Sede } from "@/interfaces/sede.interface";

export interface TipoEspacio {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

// HU-03 — Espacio
export interface Espacio {
  id: number;
  nombre: string;
  capacidad: number;
  sedeId: number;
  tipoEspacioId: number;

  sede?: Sede;
  tipoEspacio?: TipoEspacio;

  createdAt: string;
  updatedAt: string;
}
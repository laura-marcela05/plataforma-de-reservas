import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Espacio } from "@/interfaces/espacio.interface";

export type CreateEspacioDto = Omit<
  Espacio,
  "id" | "createdAt" | "updatedAt" | "sede" | "tipoEspacio"
>;
export type UpdateEspacioDto = Partial<CreateEspacioDto>;

// ✅ Respuesta de disponibilidad (apiGet devuelve json.data)
export type DisponibilidadResponse = {
  espacios: Espacio[];
  total: number;
  mensaje?: string;
};

export const espaciosService = {
  // ✅ permite filtro por sede
  findAll: (sedeId?: number) =>
    apiGet<Espacio[]>(`/espacios${sedeId ? `?sedeId=${sedeId}` : ""}`),

  findOne: (id: number) => apiGet<Espacio>(`/espacios/${id}`),

  create: (data: CreateEspacioDto) => apiPost<Espacio>("/espacios", data),

  update: (id: number, data: UpdateEspacioDto) =>
    apiPut<Espacio>(`/espacios/${id}`, data),

  remove: (id: number) => apiDelete<void>(`/espacios/${id}`),

  // ✅ HU-04: consultar disponibilidad dentro de espacios
  disponibles: (params: {
    sedeId: number;
    fecha: string;      // YYYY-MM-DD
    horaInicio: string; // HH:mm
    horaFin: string;    // HH:mm
  }) => {
    const qs = new URLSearchParams({
      sedeId: String(params.sedeId),
      fecha: params.fecha,
      horaInicio: params.horaInicio,
      horaFin: params.horaFin,
    });

    return apiGet<DisponibilidadResponse>(`/espacios/disponibles?${qs.toString()}`);
  },
};
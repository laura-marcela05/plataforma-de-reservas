import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Reserva } from "@/interfaces/reserva.interface";

// ✅ HU-05: estado lo asigna automáticamente el backend ("activa")
export type CreateReservaDto = Omit<
  Reserva,
  "id" | "estado" | "fechaCreacion" | "createdAt" | "updatedAt"
>;
export type UpdateReservaDto = Partial<CreateReservaDto>;

export const reservasService = {
  findAll: () => apiGet<Reserva[]>("/reservas"),
  findOne: (id: number) => apiGet<Reserva>(`/reservas/${id}`),
  create: (data: CreateReservaDto) => apiPost<Reserva>("/reservas", data),
  cancelar: (id: number) => apiPatch<Reserva>(`/reservas/${id}/cancelar`, {}),
  remove: (id: number) => apiDelete<void>(`/reservas/${id}`),
};

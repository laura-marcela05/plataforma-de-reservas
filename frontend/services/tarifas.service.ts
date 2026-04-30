import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Tarifa } from "@/interfaces/tarifa.interface";

export type CreateTarifaDto = Omit<Tarifa, "id" | "createdAt" | "updatedAt">;
export type UpdateTarifaDto = Partial<CreateTarifaDto>;

export const tarifasService = {
  findAll: () => apiGet<Tarifa[]>("/tarifas"),
  findOne: (id: number) => apiGet<Tarifa>(`/tarifas/${id}`),
  create: (data: CreateTarifaDto) => apiPost<Tarifa>("/tarifas", data),
  update: (id: number, data: UpdateTarifaDto) =>
    apiPut<Tarifa>(`/tarifas/${id}`, data),
  remove: (id: number) => apiDelete<void>(`/tarifas/${id}`),
};

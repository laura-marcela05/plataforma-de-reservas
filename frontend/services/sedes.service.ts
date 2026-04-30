import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Sede } from "@/interfaces/sede.interface";

export type CreateSedeDto = Omit<Sede, "id" | "createdAt" | "updatedAt">;
export type UpdateSedeDto = Partial<CreateSedeDto>;

export const sedesService = {
  findAll: () => apiGet<Sede[]>("/sedes"),
  findOne: (id: number) => apiGet<Sede>(`/sedes/${id}`),
  create: (data: CreateSedeDto) => apiPost<Sede>("/sedes", data),
  update: (id: number, data: UpdateSedeDto) =>
    apiPut<Sede>(`/sedes/${id}`, data),
  remove: (id: number) => apiDelete<void>(`/sedes/${id}`),
};

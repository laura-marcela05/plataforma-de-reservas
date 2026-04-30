import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { TipoEspacio } from "@/interfaces/tipo-espacio.interface";

export type CreateTipoEspacioDto = Omit<
  TipoEspacio,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateTipoEspacioDto = Partial<CreateTipoEspacioDto>;

export const tiposEspacioService = {
  findAll: () => apiGet<TipoEspacio[]>("/tipos-espacio"),
  findOne: (id: number) => apiGet<TipoEspacio>(`/tipos-espacio/${id}`),
  create: (data: CreateTipoEspacioDto) =>
    apiPost<TipoEspacio>("/tipos-espacio", data),
  update: (id: number, data: UpdateTipoEspacioDto) =>
    apiPut<TipoEspacio>(`/tipos-espacio/${id}`, data),
  remove: (id: number) => apiDelete<void>(`/tipos-espacio/${id}`),
};

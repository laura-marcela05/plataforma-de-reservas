import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Membresia } from "@/interfaces/membresia.interface";

export type CreateMembresiaDto = Omit<
  Membresia,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateMembresiaDto = Partial<CreateMembresiaDto>;

export const membresiasService = {
  findAll: () => apiGet<Membresia[]>("/membresias"),
  findOne: (id: number) => apiGet<Membresia>(`/membresias/${id}`),
  create: (data: CreateMembresiaDto) => apiPost<Membresia>("/membresias", data),
  update: (id: number, data: UpdateMembresiaDto) =>
    apiPut<Membresia>(`/membresias/${id}`, data),
  remove: (id: number) => apiDelete<void>(`/membresias/${id}`),
};

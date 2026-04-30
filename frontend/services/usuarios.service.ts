import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Usuario } from "@/interfaces/usuario.interface";

export type CreateUsuarioDto = Omit<Usuario, "id" | "createdAt" | "updatedAt">;
export type UpdateUsuarioDto = Partial<CreateUsuarioDto>;

export const usuariosService = {
  findAll: () => apiGet<Usuario[]>("/usuarios"),
  findOne: (id: number) => apiGet<Usuario>(`/usuarios/${id}`),
  create: (data: CreateUsuarioDto) => apiPost<Usuario>("/usuarios", data),
  update: (id: number, data: UpdateUsuarioDto) =>
    apiPut<Usuario>(`/usuarios/${id}`, data),
  remove: (id: number) => apiDelete<void>(`/usuarios/${id}`),
};

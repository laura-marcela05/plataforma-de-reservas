"use client";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/interfaces/usuario.interface";

interface Props {
  usuarios: Usuario[];
  onEdit: (u: Usuario) => void;
  onDelete: (id: number) => void;
}

export default function UsuariosTable({ usuarios, onEdit, onDelete }: Props) {
  const router = useRouter();

  if (usuarios.length === 0)
    return <p className="text-gray-500 mt-4">No hay usuarios registrados.</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Correo</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Membresía</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{u.id}</td>
              <td className="px-4 py-3">{u.nombre} {u.apellido}</td>
              <td className="px-4 py-3">{u.correo}</td>
              <td className="px-4 py-3">{u.telefono ?? "-"}</td>
              <td className="px-4 py-3">{u.membresiaId}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => router.push(`/usuarios/${u.id}`)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(u)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(u.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
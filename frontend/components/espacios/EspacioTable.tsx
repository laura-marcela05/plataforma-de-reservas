"use client";
import { useRouter } from "next/navigation";
import type { Espacio } from "@/interfaces/espacio.interface";

interface Props {
  espacios: Espacio[];
  onEdit: (e: Espacio) => void;
  onDelete: (id: number) => void;
}

export default function EspaciosTable({ espacios, onEdit, onDelete }: Props) {
  const router = useRouter();

  if (espacios.length === 0)
    return <p className="text-gray-500 mt-4">No hay espacios registrados.</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Sede</th>
            <th className="px-4 py-3 text-left">Capacidad</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {espacios.map((e) => (
            <tr
              key={e.id}
              className="border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3">{e.id}</td>
              <td className="px-4 py-3">{e.nombre}</td>
              <td className="px-4 py-3">
                {e.tipoEspacio?.nombre ?? e.tipoEspacioId}
              </td>
              <td className="px-4 py-3">{e.sede?.nombre ?? e.sedeId}</td>
              <td className="px-4 py-3">{e.capacidad}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => router.push(`/espacios/${e.id}`)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(e)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(e.id)}
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
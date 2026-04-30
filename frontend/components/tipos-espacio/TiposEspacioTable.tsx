"use client";

import type { TipoEspacio } from "@/interfaces/tipo-espacio.interface";

interface Props {
  tipos: TipoEspacio[];
  onEdit: (t: TipoEspacio) => void;
  onDelete: (id: number) => void;
}

export default function TiposEspacioTable({ tipos, onEdit, onDelete }: Props) {
  if (tipos.length === 0) {
    return <p className="text-gray-500 mt-4">No hay tipos de espacio registrados.</p>;
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{t.id}</td>
              <td className="px-4 py-3 font-medium">{t.nombre}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => onEdit(t)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(t.id)}
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
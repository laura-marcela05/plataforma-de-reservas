"use client";

import type { Membresia } from "@/interfaces/membresia.interface";

interface Props {
  membresias: Membresia[];
  onEdit: (m: Membresia) => void;
  onDelete: (id: number) => void;
}

export default function MembresiasTable({ membresias, onEdit, onDelete }: Props) {
  if (membresias.length === 0) {
    return <p className="text-gray-500 mt-4">No hay membresías registradas.</p>;
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {membresias.map((m) => (
            <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{m.id}</td>
              <td className="px-4 py-3 font-medium">{m.tipo}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => onEdit(m)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(m.id)}
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
"use client";
import { useRouter } from "next/navigation";
import type { Sede } from "@/interfaces/sede.interface";

interface Props {
  sedes: Sede[];
  onEdit: (s: Sede) => void;
  onDelete: (id: number) => void;
}

export default function SedesTable({ sedes, onEdit, onDelete }: Props) {
  const router = useRouter();

  if (sedes.length === 0)
    return <p className="text-gray-500 mt-4">No hay sedes registradas.</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Dirección</th>
            <th className="px-4 py-3 text-left">Apertura</th>
            <th className="px-4 py-3 text-left">Cierre</th>
            <th className="px-4 py-3 text-left">Capacidad</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sedes.map((s) => (
            <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">{s.id}</td>
              <td className="px-4 py-3 font-medium">{s.nombre}</td>
              <td className="px-4 py-3">{s.direccion}</td>
              <td className="px-4 py-3">{s.horarioApertura}</td>
              <td className="px-4 py-3">{s.horarioCierre}</td>
              <td className="px-4 py-3">{s.capacidadTotal}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => router.push(`/sedes/${s.id}`)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(s)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(s.id)}
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
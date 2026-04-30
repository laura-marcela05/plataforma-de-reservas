"use client";

import { useState } from "react";
import type { TipoEspacio } from "@/interfaces/tipo-espacio.interface";
import type { CreateTipoEspacioDto } from "@/services/tipos-espacio.service";

interface Props {
  inicial?: TipoEspacio | null;
  onSubmit: (data: CreateTipoEspacioDto) => void;
  onCancel: () => void;
  cargando: boolean;
}

const vacio: CreateTipoEspacioDto = {
  nombre: "",
};

export default function TipoEspacioForm({
  inicial,
  onSubmit,
  onCancel,
  cargando,
}: Props) {
  const [form, setForm] = useState<CreateTipoEspacioDto>(
    inicial ? { nombre: inicial.nombre } : vacio,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nombre = form.nombre.trim();
    if (!nombre) {
      setError("El nombre del tipo de espacio es obligatorio.");
      return;
    }

    onSubmit({ nombre });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={(e) => {
            setForm({ nombre: e.target.value });
            setError(null);
          }}
          placeholder="Ej: Sala de reuniones"
          required
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {error && (
        <div className="md:col-span-2">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="md:col-span-2 flex gap-3 justify-end mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? "Guardando..." : inicial ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
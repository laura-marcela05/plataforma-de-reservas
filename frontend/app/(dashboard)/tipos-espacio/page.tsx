"use client";

import { useEffect, useState } from "react";
import {
  tiposEspacioService,
  type CreateTipoEspacioDto,
} from "@/services/tipos-espacio.service";
import type { TipoEspacio } from "@/interfaces/tipo-espacio.interface";
import TipoEspacioForm from "@/components/tipos-espacio/TipoEspacioForm";
import TiposEspacioTable from "@/components/tipos-espacio/TiposEspacioTable";

export default function TiposEspacioPage() {
  const [tipos, setTipos] = useState<TipoEspacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<TipoEspacio | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await tiposEspacioService.findAll();
      setTipos(data);
    } catch {
      setError("Error al cargar tipos de espacio.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (data: CreateTipoEspacioDto) => {
    try {
      setGuardando(true);
      if (editando) {
        await tiposEspacioService.update(editando.id, data);
      } else {
        await tiposEspacioService.create(data);
      }
      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch {
      alert("Error al guardar el tipo de espacio.");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este tipo de espacio?")) return;
    try {
      await tiposEspacioService.remove(id);
      await cargar();
    } catch {
      alert("No se puede eliminar. Este tipo puede estar asociado a espacios.");
    }
  };

  const handleEdit = (t: TipoEspacio) => {
    setEditando(t);
    setMostrarForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tipos de Espacio</h1>
        <button
          onClick={() => {
            setEditando(null);
            setMostrarForm(!mostrarForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {mostrarForm ? "Cancelar" : "Nuevo tipo"}
        </button>
      </div>

      {mostrarForm && (
        <TipoEspacioForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => {
            setMostrarForm(false);
            setEditando(null);
          }}
          cargando={guardando}
        />
      )}

      {cargando && <p className="text-gray-500 mt-4">Cargando...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!cargando && !error && (
        <TiposEspacioTable tipos={tipos} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}

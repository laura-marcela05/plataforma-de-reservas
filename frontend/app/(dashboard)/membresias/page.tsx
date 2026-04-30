"use client";

import { useEffect, useState } from "react";
import {
  membresiasService,
  type CreateMembresiaDto,
} from "@/services/membresias.service";
import type { Membresia } from "@/interfaces/membresia.interface";
import MembresiaForm from "@/components/membresias/MembresiaForm";
import MembresiasTable from "@/components/membresias/MembresiasTable";

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Membresia | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await membresiasService.findAll();
      setMembresias(data);
    } catch {
      setError("Error al cargar membresías.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (data: CreateMembresiaDto) => {
    try {
      setGuardando(true);
      if (editando) {
        await membresiasService.update(editando.id, data);
      } else {
        await membresiasService.create(data);
      }
      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch {
      alert("Error al guardar la membresía.");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta membresía?")) return;
    try {
      await membresiasService.remove(id);
      await cargar();
    } catch {
      alert("No se puede eliminar. Esta membresía puede tener usuarios asociados.");
    }
  };

  const handleEdit = (m: Membresia) => {
    setEditando(m);
    setMostrarForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Membresías</h1>
        <button
          onClick={() => {
            setEditando(null);
            setMostrarForm(!mostrarForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {mostrarForm ? "Cancelar" : "Nueva membresía"}
        </button>
      </div>

      {mostrarForm && (
        <MembresiaForm
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
        <MembresiasTable
          membresias={membresias}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

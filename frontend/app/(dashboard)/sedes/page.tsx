"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sedesService, type CreateSedeDto } from "@/services/sedes.service";
import type { Sede } from "@/interfaces/sede.interface";
import SedesTable from "@/components/sedes/SedesTable";
import SedeForm from "@/components/sedes/SedeForm";

export default function SedesPage() {
  const router = useRouter();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Sede | null>(null);
  const [guardando, setGuardando] = useState(false);

  // ✅ Estados del buscador
  const [buscarId, setBuscarId] = useState("");
  const [buscarError, setBuscarError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await sedesService.findAll();
      setSedes(data);
    } catch {
      setError("Error al cargar sedes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (data: CreateSedeDto) => {
    try {
      setGuardando(true);
      if (editando) {
        await sedesService.update(editando.id, data);
      } else {
        await sedesService.create(data);
      }
      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch {
      alert("Error al guardar la sede.");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta sede?")) return;
    try {
      await sedesService.remove(id);
      await cargar();
    } catch {
      alert("No se puede eliminar. La sede puede tener espacios asociados.");
    }
  };

  const handleEdit = (s: Sede) => {
    setEditando(s);
    setMostrarForm(true);
  };

  // ✅ Acción del buscador (Enter o lupa)
  const ejecutarBusqueda = async () => {
    setBuscarError(null);

    const idNum = Number(buscarId);
    if (!buscarId || Number.isNaN(idNum) || idNum <= 0) {
      setBuscarError("ID inválido");
      return;
    }

    try {
      setBuscando(true);
      await sedesService.findOne(idNum); // valida existencia
      router.push(`/sedes/${idNum}`);
    } catch {
      setBuscarError("ID inexistente");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sedes</h1>

        {/* ✅ Contenedor derecho: buscador + botón nueva sede */}
        <div className="flex items-center gap-3">
          {/* Buscador por ID */}
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <input
                value={buscarId}
                onChange={(e) => {
                  // solo dígitos (si pegan texto, se limpia)
                  const soloDigitos = e.target.value.replace(/\D/g, "");
                  setBuscarId(soloDigitos);
                  setBuscarError(null);
                }}
                onKeyDown={(e) => {
                  // bloquear caracteres típicos no deseados en numérico
                  if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
                  if (e.key === "Enter") ejecutarBusqueda();
                }}
                inputMode="numeric"
                placeholder="Buscar por ID"
                className="px-3 py-2 border border-gray-300 rounded-l text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={buscando}
              />

              <button
                type="button"
                onClick={ejecutarBusqueda}
                disabled={buscando}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r bg-gray-50 hover:bg-gray-100 text-sm"
                aria-label="Buscar sede por ID"
                title="Buscar"
              >
                🔍
              </button>
            </div>

            {/* Mensaje tipo “Cargando…” */}
            {buscarError && (
              <p className="text-red-500 mt-2 text-sm">{buscarError}</p>
            )}
          </div>

          {/* Botón nueva sede (igual que ya lo tenías) */}
          <button
            onClick={() => { setEditando(null); setMostrarForm(!mostrarForm); }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {mostrarForm ? "Cancelar" : "Nueva sede"}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <SedeForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => { setMostrarForm(false); setEditando(null); }}
          cargando={guardando}
        />
      )}

      {cargando && <p className="text-gray-500 mt-4">Cargando...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!cargando && !error && (
        <SedesTable sedes={sedes} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
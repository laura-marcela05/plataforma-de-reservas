"use client";
import { useEffect, useState } from "react";
import type { Espacio } from "@/interfaces/espacio.interface";
import type { CreateEspacioDto } from "@/services/espacios.service";
import { sedesService } from "@/services/sedes.service";
import { tiposEspacioService } from "@/services/tipos-espacio.service";
import type { Sede } from "@/interfaces/sede.interface";
import type { TipoEspacio } from "@/interfaces/espacio.interface";

interface Props {
  inicial?: Espacio | null;
  onSubmit: (data: CreateEspacioDto) => void;
  onCancel: () => void;
  cargando: boolean;
}

type FormState = Omit<CreateEspacioDto, "capacidad"> & { capacidad: string };

export default function EspacioForm({ inicial, onSubmit, onCancel, cargando }: Props) {
  const [form, setForm] = useState<FormState>({
    nombre: inicial?.nombre ?? "",
    capacidad: inicial ? String(inicial.capacidad) : "",
    sedeId: inicial?.sedeId ?? 0,
    tipoEspacioId: inicial?.tipoEspacioId ?? 0,
  });

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [tipos, setTipos] = useState<TipoEspacio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const esEdicion = !!inicial;
  const sinSedes = sedes.length === 0;
  const sinTipos = tipos.length === 0;

  useEffect(() => {
    sedesService.findAll().then(setSedes);
    tiposEspacioService.findAll().then(setTipos);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "capacidad") {
      const soloDigitos = value.replace(/\D/g, "");
      setForm((p) => ({ ...p, capacidad: soloDigitos }));
      setError(null);
      return;
    }

    setForm((p) => ({
      ...p,
      [name]: name === "sedeId" || name === "tipoEspacioId" ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!esEdicion && (sinSedes || sinTipos)) {
      setError(
        "Faltan datos base. Primero crea una sede y un tipo de espacio.",
      );
      return;
    }

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!form.capacidad || Number(form.capacidad) <= 0) {
      setError("La capacidad debe ser un número mayor a 0.");
      return;
    }

    if (!form.sedeId) {
      setError("Debe seleccionar una sede.");
      return;
    }

    if (!form.tipoEspacioId) {
      setError("Debe seleccionar un tipo de espacio.");
      return;
    }

    onSubmit({
      nombre: form.nombre,
      capacidad: Number(form.capacidad),
      sedeId: form.sedeId,
      tipoEspacioId: form.tipoEspacioId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Nombre</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Capacidad</label>
        <input
          name="capacidad"
          value={form.capacidad}
          onChange={handleChange}
          inputMode="numeric"
          placeholder="Ej: 10"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Sede</label>
        <select
          name="sedeId"
          value={form.sedeId}
          onChange={handleChange}
          disabled={sinSedes}
          className="w-full border px-3 py-2 rounded"
        >
          <option value={0}>{sinSedes ? "No hay sedes disponibles" : "Seleccione sede"}</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        {sinSedes && (
          <p className="text-amber-700 text-xs mt-1">
            Prerequisito: crea al menos una sede en el modulo Sedes.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Tipo de espacio</label>
        <select
          name="tipoEspacioId"
          value={form.tipoEspacioId}
          onChange={handleChange}
          disabled={sinTipos}
          className="w-full border px-3 py-2 rounded"
        >
          <option value={0}>{sinTipos ? "No hay tipos disponibles" : "Seleccione tipo"}</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {sinTipos && (
          <p className="text-amber-700 text-xs mt-1">
            Prerequisito: crea al menos un tipo en el modulo Tipos de Espacio.
          </p>
        )}
      </div>

      {error && (
        <div className="md:col-span-2 text-red-500 text-sm">{error}</div>
      )}

      <div className="md:col-span-2 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando || (!esEdicion && (sinSedes || sinTipos))}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {cargando ? "Guardando..." : inicial ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
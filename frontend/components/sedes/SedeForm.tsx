"use client";
import { useState } from "react";
import type { Sede } from "@/interfaces/sede.interface";
import type { CreateSedeDto } from "@/services/sedes.service";

interface Props {
  inicial?: Sede | null;
  onSubmit: (data: CreateSedeDto) => void;
  onCancel: () => void;
  cargando: boolean;
}

// Estado interno: capacidadTotal como string (para poder borrar y escribir sin que se vuelva 0)
type FormState = Omit<CreateSedeDto, "capacidadTotal"> & { capacidadTotal: string };

const vacio: FormState = {
  nombre: "",
  direccion: "",
  horarioApertura: "08:00",
  horarioCierre: "20:00",
  capacidadTotal: "1",
};

export default function SedeForm({ inicial, onSubmit, onCancel, cargando }: Props) {
  const [form, setForm] = useState<FormState>(
    inicial
      ? {
          nombre: inicial.nombre,
          direccion: inicial.direccion,
          horarioApertura: inicial.horarioApertura,
          horarioCierre: inicial.horarioCierre,
          capacidadTotal: String(inicial.capacidadTotal),
        }
      : vacio
  );

  const [error, setError] = useState<string | null>(null);

  // HH:mm 24h estricta (00:00 a 23:59)
  const esHHmm = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Capacidad: solo dígitos, permite vacío temporal
    if (name === "capacidadTotal") {
      const soloDigitos = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, capacidadTotal: soloDigitos }));
      setError(null);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1) Validar formato HH:mm (aunque type="time" ayuda, esto lo vuelve explícito)
    if (!esHHmm(form.horarioApertura) || !esHHmm(form.horarioCierre)) {
      setError("Los horarios deben tener formato 24h HH:mm (ej: 08:00 / 20:00).");
      return;
    }

    // 2) Validar regla HU-02: cierre posterior a apertura
    // Con HH:mm fijo, comparar strings funciona correctamente
    if (form.horarioCierre <= form.horarioApertura) {
      setError("El horario de cierre debe ser posterior al de apertura.");
      return;
    }

    // 3) Validación capacidad: obligatoria, entero > 0
    if (!form.capacidadTotal) {
      setError("La capacidad total es obligatoria.");
      return;
    }

    const capacidadNum = Number(form.capacidadTotal);
    if (!Number.isInteger(capacidadNum) || capacidadNum <= 0) {
      setError("La capacidad total debe ser un número entero mayor a 0.");
      return;
    }

    // Payload final respetando CreateSedeDto (capacidadTotal como number)
    const payload: CreateSedeDto = {
      nombre: form.nombre,
      direccion: form.direccion,
      horarioApertura: form.horarioApertura,
      horarioCierre: form.horarioCierre,
      capacidadTotal: capacidadNum,
    };

    onSubmit(payload);
  };

  const campo = (
    label: string,
    name: keyof FormState,
    props?: Partial<React.InputHTMLAttributes<HTMLInputElement>>
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...props}
      />
      {(name === "horarioApertura" || name === "horarioCierre") && (
        <p className="text-xs text-gray-400">Formato 24h (HH:mm). Ej: 08:00</p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {campo("Nombre", "nombre", { type: "text" })}
      {campo("Dirección", "direccion", { type: "text" })}

      {/* Horarios: type="time" fuerza HH:mm en UI; step=60 evita segundos */}
      {campo("Horario apertura", "horarioApertura", { type: "time", step: 60 })}
      {campo("Horario cierre", "horarioCierre", { type: "time", step: 60 })}

      {/* Capacidad: text + inputMode numeric para evitar el bug del 0 pegado */}
      {campo("Capacidad total", "capacidadTotal", {
        type: "text",
        inputMode: "numeric",
        placeholder: "Ej: 10",
        onKeyDown: (e) => {
          // bloquear e/E/+/-/./, para mantener solo dígitos
          if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
        },
      })}

      {/* Mensaje en página */}
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
"use client";
import { useState, useEffect } from "react";
import type { Usuario } from "@/interfaces/usuario.interface";
import type { Membresia } from "@/interfaces/membresia.interface";
import type {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from "@/services/usuarios.service";
import { membresiasService } from "@/services/membresias.service";

interface Props {
  inicial?: Usuario | null;
  // En creación enviamos CreateUsuarioDto; en edición enviamos UpdateUsuarioDto (sin contraseña si no se cambia)
  onSubmit: (data: CreateUsuarioDto | UpdateUsuarioDto) => void;
  onCancel: () => void;
  cargando: boolean;
}

// Estado vacío para el formulario de creación
// membresiaId inicia en 0 y se actualiza con el primer valor que llegue del backend
const vacio: CreateUsuarioDto = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  telefono: "",
  membresiaId: 0,
};

export default function UsuarioForm({
  inicial,
  onSubmit,
  onCancel,
  cargando,
}: Props) {
  // ✅ Membresías cargadas dinámicamente desde el backend (no hardcodeadas)
  // Así si cambian los IDs en la BD, el formulario siempre usa los correctos
  const [membresias, setMembresias] = useState<Membresia[]>([]);

  const [form, setForm] = useState<CreateUsuarioDto>(
    inicial
      ? {
          // Edición: prellenar con los datos actuales del usuario
          nombre: inicial.nombre,
          apellido: inicial.apellido,
          correo: inicial.correo,
          contrasena: "", // en edición queda vacío para NO cambiarla
          telefono: inicial.telefono ?? "",
          membresiaId: inicial.membresiaId,
        }
      : vacio, // Creación: formulario vacío
  );

  const [error, setError] = useState<string | null>(null);
  const sinMembresias = membresias.length === 0;

  // ✅ Al montar el componente, carga las membresías desde el backend
  // Si es creación y el formulario tiene membresiaId=0, se asigna el ID de la primera membresía disponible
  useEffect(() => {
    membresiasService.findAll().then((data) => {
      setMembresias(data);
      if (!inicial && data.length > 0) {
        setForm((prev) => ({ ...prev, membresiaId: data[0].id }));
      }
    });
  }, [inicial]);

  // ✅ Teléfono: exactamente 10 dígitos, debe empezar por 3
  const esTelefonoValido = (tel: string) => /^3\d{9}$/.test(tel);

  // ✅ Contraseña: 8-32 caracteres, 1 mayúscula, 1 minúscula, 1 número, sin espacios
  const esContrasenaValida = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,32}$/.test(pwd);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // ✅ Teléfono: elimina cualquier carácter no numérico y limita a 10 dígitos
    if (name === "telefono") {
      const soloDigitos = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, telefono: soloDigitos }));
      setError(null);
      return;
    }

    // ✅ membresiaId se convierte a número; los demás campos quedan como string
    setForm((prev) => ({
      ...prev,
      [name]: name === "membresiaId" ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const esEdicion = !!inicial;

    if (!esEdicion && sinMembresias) {
      setError(
        "No hay membresias creadas. Primero crea una membresia en el modulo Membresias.",
      );
      return;
    }

    // ✅ Validación de teléfono (obligatorio en creación y edición)
    if (!form.telefono) {
      setError("El teléfono es obligatorio.");
      return;
    }
    if (!esTelefonoValido(form.telefono)) {
      setError(
        "El teléfono debe tener 10 dígitos, solo números y empezar por 3.",
      );
      return;
    }

    if (!esEdicion) {
      // ✅ Creación: contraseña obligatoria y debe cumplir las reglas
      if (!form.contrasena) {
        setError("La contraseña es obligatoria.");
        return;
      }
      if (!esContrasenaValida(form.contrasena)) {
        setError(
          "La contraseña debe tener 8 a 32 caracteres, incluir 1 mayúscula, 1 minúscula y 1 número (sin espacios).",
        );
        return;
      }
      onSubmit(form);
      return;
    }

    // ✅ Edición: se envía DTO parcial
    // La contraseña es opcional — solo se incluye si el usuario la escribió
    const payload: UpdateUsuarioDto = {
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
      telefono: form.telefono,
      membresiaId: form.membresiaId,
    };

    if (form.contrasena) {
      if (!esContrasenaValida(form.contrasena)) {
        setError(
          "La contraseña debe tener 8 a 32 caracteres, incluir 1 mayúscula, 1 minúscula y 1 número (sin espacios).",
        );
        return;
      }
      payload.contrasena = form.contrasena;
    }

    onSubmit(payload);
  };

  // ✅ Helper para renderizar campos de texto reutilizables
  const campo = (
    label: string,
    name: keyof CreateUsuarioDto,
    type = "text",
    required = true,
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        required={required}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...(name === "telefono"
          ? {
              inputMode: "numeric" as const,
              maxLength: 10,
              placeholder: "Ej: 3001234567",
              // ✅ Bloquea caracteres no numéricos en el teclado
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (["e", "E", "+", "-", ".", ",", " "].includes(e.key))
                  e.preventDefault();
              },
            }
          : {})}
      />
      {name === "telefono" && (
        <p className="text-xs text-gray-400">
          Obligatorio. 10 dígitos. Solo números. Debe empezar por 3.
        </p>
      )}
      {name === "contrasena" && (
        <p className="text-xs text-gray-400">
          {inicial
            ? "Opcional: déjala vacía para no cambiarla. Si la cambias: 8–32, 1 mayúscula, 1 minúscula, 1 número."
            : "Obligatoria: 8–32, 1 mayúscula, 1 minúscula, 1 número (sin espacios)."}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {campo("Nombre", "nombre")}
      {campo("Apellido", "apellido")}
      {campo("Correo", "correo", "email")}
      {/* ✅ Creación: required. Edición: opcional */}
      {campo("Contraseña", "contrasena", "password", !inicial)}
      {campo("Teléfono", "telefono", "text", true)}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Membresía</label>
        <select
          name="membresiaId"
          value={form.membresiaId}
          onChange={handleChange}
          disabled={sinMembresias}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {sinMembresias && <option value={0}>No hay membresias disponibles</option>}
          {/* ✅ Opciones generadas dinámicamente desde el backend
              El value usa el ID real de la BD, no un número hardcodeado */}
          {membresias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
            </option>
          ))}
        </select>
        {sinMembresias && (
          <p className="text-amber-700 text-xs">
            Prerequisito: crea al menos una membresia antes de registrar usuarios.
          </p>
        )}
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
          disabled={cargando || (!inicial && sinMembresias)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? "Guardando..." : inicial ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

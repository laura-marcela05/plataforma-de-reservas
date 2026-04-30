"use client";

import { useEffect, useState } from "react";
import {
  reservasService,
  type CreateReservaDto,
} from "@/services/reservas.service";
import { espaciosService } from "@/services/espacios.service";
import { usuariosService } from "@/services/usuarios.service";
import type { Reserva } from "@/interfaces/reserva.interface";
import type { Espacio } from "@/interfaces/espacio.interface";
import type { Usuario } from "@/interfaces/usuario.interface";

// ─── helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Error desconocido";
};

const ESTADO_BADGE: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
  finalizada: "bg-gray-100 text-gray-600",
};

// ✅ HU-05: extrae "HH:mm" desde el string DateTime que devuelve Prisma (@db.Time)
const formatHora = (hora: string): string => {
  // Prioriza HH:mm directamente del string ISO para evitar desfases por timezone.
  const direct = hora.match(/T(\d{2}:\d{2})/);
  if (direct) return direct[1];

  if (/^\d{2}:\d{2}/.test(hora)) return hora.slice(0, 5);

  const parsed = new Date(hora);
  if (Number.isNaN(parsed.getTime())) return hora;

  return parsed.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
};

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ReservasPage() {
  // Datos externos
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Estados de carga general
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario (HU-05)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ HU-05: estado no se manda desde el frontend, lo asigna el backend
  const [form, setForm] = useState<CreateReservaDto>({
    usuarioId: 0,
    espacioId: 0,
    fecha: "",
    horaInicio: "",
    horaFin: "",
  });
  const sinUsuarios = usuarios.length === 0;
  const sinEspacios = espacios.length === 0;
  const faltanPrerequisitos = sinUsuarios || sinEspacios;

  // ── Carga inicial ────────────────────────────────────────────────────────────

  const cargarTodo = async () => {
    try {
      setCargando(true);
      setError(null);
      const [u, e, r] = await Promise.all([
        usuariosService.findAll(),
        espaciosService.findAll(),
        reservasService.findAll(),
      ]);
      setUsuarios(u);
      setEspacios(e);
      setReservas(r);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  // ── Handlers formulario ──────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "usuarioId" || name === "espacioId" ? Number(value) : value,
    }));
    setFormError(null);
    setExito(null);
  };

  const validarForm = (): string | null => {
    if (!form.usuarioId) return "Debe seleccionar un usuario.";
    if (!form.espacioId) return "Debe seleccionar un espacio.";
    if (!form.fecha) return "Debe ingresar una fecha.";
    if (!form.horaInicio) return "Debe ingresar la hora de inicio.";
    if (!form.horaFin) return "Debe ingresar la hora de fin.";
    if (form.horaFin <= form.horaInicio)
      return "La hora de fin debe ser posterior a la hora de inicio.";

    // ✅ NUEVA VALIDACIÓN: Permite HOY y futuro, rechaza solo fechas pasadas
    const fechaSeleccionada = new Date(form.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      return "La fecha de la reserva no puede ser en el pasado. Puedes reservar desde hoy.";
    }

    return null;
  };

  const handleSubmit = async () => {
    if (faltanPrerequisitos) {
      if (sinUsuarios && sinEspacios) {
        setFormError(
          "Faltan datos base: primero crea al menos un usuario y un espacio.",
        );
      } else if (sinUsuarios) {
        setFormError("Falta crear al menos un usuario antes de reservar.");
      } else {
        setFormError("Falta crear al menos un espacio antes de reservar.");
      }
      return;
    }

    const validacion = validarForm();
    if (validacion) {
      setFormError(validacion);
      return;
    }

    try {
      setGuardando(true);
      setFormError(null);
      setExito(null);

      // ✅ HU-05: solo se mandan los campos que el DTO espera, sin estado
      await reservasService.create({
        usuarioId: form.usuarioId,
        espacioId: form.espacioId,
        fecha: form.fecha,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
      });

      setExito("Reserva creada exitosamente.");
      setMostrarForm(false);
      setForm({
        usuarioId: 0,
        espacioId: 0,
        fecha: "",
        horaInicio: "",
        horaFin: "",
      });
      await cargarTodo();
    } catch (e: unknown) {
      // ✅ HU-05: muestra el mensaje exacto del backend (ej: choque de horarios)
      setFormError(getErrorMessage(e));
    } finally {
      setGuardando(false);
    }
  };

  const cancelarForm = () => {
    setMostrarForm(false);
    setFormError(null);
    setExito(null);
    setForm({
      usuarioId: 0,
      espacioId: 0,
      fecha: "",
      horaInicio: "",
      horaFin: "",
    });
  };

  // ── HU-06: cancelar reserva ─────────────────────────────────────
  const cancelarReserva = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva?",
    );
    if (!confirmar) return;

    try {
      await reservasService.cancelar(id);
      alert("Reserva cancelada correctamente.");
      await cargarTodo(); // refresca la tabla
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── CARD: Gestión de Reservas ── */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gestión de reservas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Crea reservas seleccionando usuario, espacio, fecha y horario.
              </p>
            </div>

            <button
              onClick={() => {
                setExito(null);
                setFormError(null);
                setMostrarForm((v) => !v);
              }}
              disabled={faltanPrerequisitos}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {mostrarForm ? "Cancelar" : "Nueva reserva"}
            </button>
          </div>

          {faltanPrerequisitos && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              {sinUsuarios &&
                sinEspacios &&
                "Prerequisito: crea al menos un usuario y un espacio antes de registrar reservas."}
              {sinUsuarios &&
                !sinEspacios &&
                "Prerequisito: crea al menos un usuario antes de registrar reservas."}
              {!sinUsuarios &&
                sinEspacios &&
                "Prerequisito: crea al menos un espacio antes de registrar reservas."}
            </p>
          )}

          {/* Mensaje de éxito */}
          {exito && (
            <p className="mt-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              {exito}
            </p>
          )}

          {/* ── Formulario HU-05 ── */}
          {mostrarForm && (
            <div className="mt-5 border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Nueva reserva
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usuario — select dinámico (HU-05) */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Usuario
                  </label>
                  <select
                    name="usuarioId"
                    value={form.usuarioId || ""}
                    onChange={handleChange}
                    disabled={sinUsuarios}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">
                      {sinUsuarios
                        ? "No hay usuarios disponibles"
                        : "Seleccione usuario"}
                    </option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido} — {u.correo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Espacio — select dinámico (HU-05) */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Espacio
                  </label>
                  <select
                    name="espacioId"
                    value={form.espacioId || ""}
                    onChange={handleChange}
                    disabled={sinEspacios}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">
                      {sinEspacios
                        ? "No hay espacios disponibles"
                        : "Seleccione espacio"}
                    </option>
                    {espacios.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} — {e.sede?.nombre ?? `Sede #${e.sedeId}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Hora inicio */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    name="horaInicio"
                    step={60}
                    value={form.horaInicio}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Hora fin */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    name="horaFin"
                    step={60}
                    value={form.horaFin}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* ✅ HU-05: error del frontend o del backend (choque de horarios) */}
              {formError && (
                <p className="mt-3 text-sm text-red-500">{formError}</p>
              )}

              {/* Acciones */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelarForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={guardando || faltanPrerequisitos}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {guardando ? "Creando..." : "Crear reserva"}
                </button>
              </div>
            </div>
          )}

          {/* ── Listado de reservas (HU-05) ── */}
          <div className="mt-6">
            {cargando && (
              <p className="text-gray-500 text-sm">Cargando reservas...</p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!cargando && !error && reservas.length === 0 && (
              <p className="text-gray-400 text-sm">
                No hay reservas registradas.
              </p>
            )}

            {!cargando && !error && reservas.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">
                        ID
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Usuario
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Espacio
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Fecha
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Hora inicio
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Hora fin
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-left p-3 font-medium text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3">{r.id}</td>

                        <td className="p-3">{r.usuarioId}</td>

                        <td className="p-3">{r.espacioId}</td>

                        <td className="p-3">
                          {new Date(r.fecha).toLocaleDateString("es-CO")}
                        </td>

                        {/* Hora inicio */}
                        <td className="p-3">{formatHora(r.horaInicio)}</td>

                        {/* Hora fin */}
                        <td className="p-3">{formatHora(r.horaFin)}</td>

                        {/* ✅ Columna ESTADO */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ESTADO_BADGE[r.estado] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.estado}
                          </span>
                        </td>

                        {/* ✅ Columna ACCIONES (HU-06) */}
                        <td className="p-3">
                          {r.estado === "activa" && (
                            <button
                              onClick={() => cancelarReserva(r.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

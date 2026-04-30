"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { espaciosService, type CreateEspacioDto } from "@/services/espacios.service";
import { sedesService } from "@/services/sedes.service";

import type { Espacio } from "@/interfaces/espacio.interface";
import type { Sede } from "@/interfaces/sede.interface";

import EspaciosTable from "@/components/espacios/EspacioTable";
import EspacioForm from "@/components/espacios/EspacioForm";

export default function EspaciosPage() {
  const router = useRouter();

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  // Filtro por sede (HU-03)
  const [sedeFiltro, setSedeFiltro] = useState<string>("");

  // Estados generales (HU-03)
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD UI (HU-03)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Espacio | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);

  // Buscador por ID (HU-03)
  const [buscarId, setBuscarId] = useState("");
  const [buscarError, setBuscarError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  // ==========================
  // HU-04: Disponibilidad (ya conectado)
  // ==========================
  const [dispSedeId, setDispSedeId] = useState<string>("");
  const [dispFecha, setDispFecha] = useState<string>("");
  const [dispHoraInicio, setDispHoraInicio] = useState<string>("");
  const [dispHoraFin, setDispHoraFin] = useState<string>("");
  const [dispMsg, setDispMsg] = useState<string | null>(null);

  const [dispLoading, setDispLoading] = useState(false);
  const [dispResultados, setDispResultados] = useState<Espacio[]>([]);
  const [dispTotal, setDispTotal] = useState<number>(0);
  const sinSedesDisponibilidad = sedes.length === 0;

  // ✅ Helper seguro para sacar el mensaje del error SIN any
  const getErrorMessage = (e: unknown) => {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return null;
  };

  const cargarSedes = async () => {
    try {
      const data = await sedesService.findAll();
      setSedes(data);
    } catch {
      // No bloqueamos toda la pantalla por esto
    }
  };

  const cargarEspacios = async (sedeId?: number) => {
    try {
      setCargando(true);
      setError(null);
      const data = await espaciosService.findAll(sedeId);
      setEspacios(data);
    } catch {
      setError("Error al cargar espacios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSedes();
    cargarEspacios();
  }, []);

  useEffect(() => {
    const sedeIdNum = sedeFiltro ? Number(sedeFiltro) : undefined;
    cargarEspacios(sedeIdNum);
  }, [sedeFiltro]);

  // Buscar por ID (Enter o lupa)
  const ejecutarBusqueda = async () => {
    setBuscarError(null);

    const idNum = Number(buscarId);
    if (!buscarId || Number.isNaN(idNum) || idNum <= 0) {
      setBuscarError("ID inválido");
      return;
    }

    try {
      setBuscando(true);
      await espaciosService.findOne(idNum);
      router.push(`/espacios/${idNum}`);
    } catch (e: unknown) {
      setBuscarError(getErrorMessage(e) || "ID inexistente");
    } finally {
      setBuscando(false);
    }
  };

  // Crear / editar (HU-03)
  const handleSubmit = async (data: CreateEspacioDto) => {
    try {
      setAccionError(null);
      setGuardando(true);

      if (editando) {
        await espaciosService.update(editando.id, data);
      } else {
        await espaciosService.create(data);
      }

      setMostrarForm(false);
      setEditando(null);

      const sedeIdNum = sedeFiltro ? Number(sedeFiltro) : undefined;
      await cargarEspacios(sedeIdNum);
    } catch (e: unknown) {
      setAccionError(
        getErrorMessage(e) ||
          "No se pudo guardar el espacio. Verifica los datos o puede haber reservas activas asociadas."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEdit = (e: Espacio) => {
    setAccionError(null);
    setEditando(e);
    setMostrarForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este espacio?")) return;

    try {
      setAccionError(null);
      await espaciosService.remove(id);

      const sedeIdNum = sedeFiltro ? Number(sedeFiltro) : undefined;
      await cargarEspacios(sedeIdNum);
    } catch (e: unknown) {
      setAccionError(
        getErrorMessage(e) || "No se puede eliminar: el espacio tiene reservas activas."
      );
    }
  };

  // ==========================
  // HU-04: Consultar disponibilidad (REAL)
  // ==========================
  const consultarDisponibilidadUI = async () => {
    setDispMsg(null);

    if (sinSedesDisponibilidad) {
      setDispMsg(
        "Prerequisito: primero crea al menos una sede para consultar disponibilidad.",
      );
      return;
    }

    // Validaciones HU-04 (frontend)
    if (!dispSedeId || !dispFecha || !dispHoraInicio || !dispHoraFin) {
      setDispMsg("Debe completar sede, fecha, hora inicio y hora fin.");
      return;
    }

    if (dispHoraFin <= dispHoraInicio) {
      setDispMsg("La hora fin debe ser posterior a la hora inicio.");
      return;
    }

    try {
      setDispLoading(true);

      const data = await espaciosService.disponibles({
        sedeId: Number(dispSedeId),
        fecha: dispFecha,
        horaInicio: dispHoraInicio,
        horaFin: dispHoraFin,
      });

      setDispResultados(data.espacios);
      setDispTotal(data.total);

      if (data.total === 0) {
        setDispMsg(data.mensaje || "No hay espacios disponibles para el rango seleccionado.");
      } else {
        setDispMsg(null);
      }
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || "Error consultando disponibilidad.";
      setDispMsg(msg);
      setDispResultados([]);
      setDispTotal(0);
    } finally {
      setDispLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================
          CARD 1: DISPONIBILIDAD (HU-04)
         ========================= */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Consultar disponibilidad
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona sede, fecha y rango horario (24h) para ver espacios libres.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Sede */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Sede</label>
              <select
                value={dispSedeId}
                onChange={(e) => {
                  setDispSedeId(e.target.value);
                  setDispMsg(null);
                }}
                disabled={sinSedesDisponibilidad}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {sinSedesDisponibilidad
                    ? "No hay sedes disponibles"
                    : "Seleccione sede"}
                </option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              {sinSedesDisponibilidad && (
                <p className="mt-1 text-xs text-amber-700">
                  Prerequisito: crea una sede en el modulo Sedes.
                </p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="text-xs font-medium text-gray-600">Fecha</label>
              <input
                type="date"
                value={dispFecha}
                onChange={(e) => {
                  setDispFecha(e.target.value);
                  setDispMsg(null);
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hora inicio */}
            <div>
              <label className="text-xs font-medium text-gray-600">Hora inicio</label>
              <input
                type="time"
                step={60}
                value={dispHoraInicio}
                onChange={(e) => {
                  setDispHoraInicio(e.target.value);
                  setDispMsg(null);
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hora fin */}
            <div>
              <label className="text-xs font-medium text-gray-600">Hora fin</label>
              <input
                type="time"
                step={60}
                value={dispHoraFin}
                onChange={(e) => {
                  setDispHoraFin(e.target.value);
                  setDispMsg(null);
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={consultarDisponibilidadUI}
              disabled={dispLoading || sinSedesDisponibilidad}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {dispLoading ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {/* Mensajes */}
          {dispMsg && (
            <p className={`mt-3 text-sm ${dispMsg.includes("No hay") ? "text-gray-600" : dispMsg.includes("Error") ? "text-red-500" : "text-red-500"}`}>
              {dispMsg}
            </p>
          )}

          {/* Resultados */}
          {!dispLoading && dispResultados.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">
                Resultados: <span className="font-semibold">{dispTotal}</span>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Capacidad</th>
                    <th className="text-left p-3">Sede</th>
                  </tr>
                </thead>
                <tbody>
                  {dispResultados.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100">
                      <td className="p-3">{e.id}</td>
                      <td className="p-3">{e.nombre}</td>
                      <td className="p-3">{e.tipoEspacio?.nombre ?? e.tipoEspacioId}</td>
                      <td className="p-3">{e.capacidad}</td>
                      <td className="p-3">{e.sede?.nombre ?? e.sedeId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* =========================
          CARD 2: GESTIÓN DE ESPACIOS (HU-03)
         ========================= */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestión de espacios</h2>
              <p className="text-sm text-gray-500 mt-1">
                Crea, edita y elimina espacios. Filtra por sede o busca por ID.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filtro por sede */}
              <select
                value={sedeFiltro}
                onChange={(e) => setSedeFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filtrar por sede"
              >
                <option value="">Todas las sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              {/* Buscador por ID */}
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <input
                    value={buscarId}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, "");
                      setBuscarId(soloDigitos);
                      setBuscarError(null);
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
                      if (e.key === "Enter") ejecutarBusqueda();
                    }}
                    inputMode="numeric"
                    placeholder="Buscar por ID"
                    className="px-3 py-2 border border-gray-300 rounded-l-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={buscando}
                  />
                  <button
                    type="button"
                    onClick={ejecutarBusqueda}
                    disabled={buscando}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 text-sm"
                    aria-label="Buscar espacio por ID"
                    title="Buscar"
                  >
                    🔍
                  </button>
                </div>

                {buscarError && (
                  <p className="text-red-500 mt-2 text-sm">{buscarError}</p>
                )}
              </div>

              {/* Botón Nuevo espacio */}
              <button
                onClick={() => {
                  setAccionError(null);
                  setEditando(null);
                  setMostrarForm(!mostrarForm);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {mostrarForm ? "Cancelar" : "Nuevo espacio"}
              </button>
            </div>
          </div>

          {/* Mensaje de error de acciones */}
          {accionError && (
            <p className="text-red-500 mt-4 text-sm">{accionError}</p>
          )}

          {/* Formulario */}
          {mostrarForm && (
            <div className="mt-4">
              <EspacioForm
                inicial={editando}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setMostrarForm(false);
                  setEditando(null);
                  setAccionError(null);
                }}
                cargando={guardando}
              />
            </div>
          )}

          {/* Listado */}
          <div className="mt-4">
            {cargando && <p className="text-gray-500">Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!cargando && !error && (
              <EspaciosTable
                espacios={espacios}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
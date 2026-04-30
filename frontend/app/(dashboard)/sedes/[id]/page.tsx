"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sedesService } from "@/services/sedes.service";
import type { Sede } from "@/interfaces/sede.interface";

export default function SedeDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [sede, setSede] = useState<Sede | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await sedesService.findOne(Number(id));
        setSede(data);
      } catch {
        setError("No se encontró la sede.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!sede) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/sedes")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">Detalle de la sede</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg grid grid-cols-1 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase">ID</p>
          <p className="text-sm font-medium">{sede.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Nombre</p>
          <p className="text-sm font-medium">{sede.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Dirección</p>
          <p className="text-sm font-medium">{sede.direccion}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Horario apertura</p>
          <p className="text-sm font-medium">{sede.horarioApertura}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Horario cierre</p>
          <p className="text-sm font-medium">{sede.horarioCierre}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Capacidad total</p>
          <p className="text-sm font-medium">{sede.capacidadTotal}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Creado</p>
          <p className="text-sm font-medium">{new Date(sede.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
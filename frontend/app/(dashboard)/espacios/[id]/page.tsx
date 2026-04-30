"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { espaciosService } from "@/services/espacios.service";
import type { Espacio } from "@/interfaces/espacio.interface";

export default function EspacioDetallePage() {
  const { id } = useParams();
  const router = useRouter();

  const [espacio, setEspacio] = useState<Espacio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await espaciosService.findOne(Number(id));
        setEspacio(data);
      } catch {
        setError("No se encontró el espacio.");
      } finally {
        setCargando(false);
      }
    };

    if (id) cargar();
  }, [id]);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!espacio) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/espacios")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">Detalle del espacio</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg grid grid-cols-1 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase">ID</p>
          <p className="text-sm font-medium">{espacio.id}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Nombre</p>
          <p className="text-sm font-medium">{espacio.nombre}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Capacidad</p>
          <p className="text-sm font-medium">{espacio.capacidad}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Sede</p>
          <p className="text-sm font-medium">
            {espacio.sede?.nombre ?? espacio.sedeId}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Tipo de espacio</p>
          <p className="text-sm font-medium">
            {espacio.tipoEspacio?.nombre ?? espacio.tipoEspacioId}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Creado</p>
          <p className="text-sm font-medium">
            {new Date(espacio.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
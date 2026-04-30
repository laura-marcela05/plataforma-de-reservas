"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usuariosService } from "@/services/usuarios.service";
import type { Usuario } from "@/interfaces/usuario.interface";

export default function UsuarioDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await usuariosService.findOne(Number(id));
        setUsuario(data);
      } catch {
        setError("No se encontró el usuario.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!usuario) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/usuarios")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">Detalle del usuario</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg grid grid-cols-1 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase">ID</p>
          <p className="text-sm font-medium">{usuario.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Nombre completo</p>
          <p className="text-sm font-medium">{usuario.nombre} {usuario.apellido}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Correo</p>
          <p className="text-sm font-medium">{usuario.correo}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Teléfono</p>
          <p className="text-sm font-medium">{usuario.telefono ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Membresía ID</p>
          <p className="text-sm font-medium">{usuario.membresiaId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Creado</p>
          <p className="text-sm font-medium">{new Date(usuario.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
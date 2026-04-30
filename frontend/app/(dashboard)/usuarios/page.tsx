"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usuariosService, type CreateUsuarioDto, type UpdateUsuarioDto } from "@/services/usuarios.service";
import type { Usuario } from "@/interfaces/usuario.interface";
import UsuariosTable from "@/components/usuarios/UsuariosTable";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

export default function UsuariosPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estados del buscador
  const [buscarId, setBuscarId] = useState("");
  const [buscarError, setBuscarError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await usuariosService.findAll();
      setUsuarios(data);
    } catch {
      setError("Error al cargar usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ✅ Ahora acepta Create o Update (para no enviar contraseña vacía en edición)
  const handleSubmit = async (data: CreateUsuarioDto | UpdateUsuarioDto) => {
    try {
      setGuardando(true);
      if (editando) {
        await usuariosService.update(editando.id, data as UpdateUsuarioDto);
      } else {
        await usuariosService.create(data as CreateUsuarioDto);
      }
      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch {
      alert("Error al guardar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usuariosService.remove(id);
      await cargar();
    } catch {
      alert("No se puede eliminar. El usuario puede tener reservas asociadas.");
    }
  };

  const handleEdit = (u: Usuario) => {
    setEditando(u);
    setMostrarForm(true);
  };

  // Acción del buscador (Enter o lupa)
  const ejecutarBusqueda = async () => {
    setBuscarError(null);

    const idNum = Number(buscarId);
    if (!buscarId || Number.isNaN(idNum) || idNum <= 0) {
      setBuscarError("ID inválido");
      return;
    }

    try {
      setBuscando(true);
      await usuariosService.findOne(idNum);
      // ✅ Ruta correcta en tu app
      router.push(`/usuarios/${idNum}`);
    } catch {
      setBuscarError("ID inexistente");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>

        <div className="flex items-center gap-3">
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
                className="px-3 py-2 border border-gray-300 rounded-l text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={buscando}
              />

              <button
                type="button"
                onClick={ejecutarBusqueda}
                disabled={buscando}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r bg-gray-50 hover:bg-gray-100 text-sm"
                aria-label="Buscar usuario por ID"
                title="Buscar"
              >
                🔍
              </button>
            </div>

            {buscarError && (
              <p className="text-red-500 mt-2 text-sm">{buscarError}</p>
            )}
          </div>

          {/* Botón nuevo usuario */}
          <button
            onClick={() => { setEditando(null); setMostrarForm(!mostrarForm); }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {mostrarForm ? "Cancelar" : "Nuevo usuario"}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <UsuarioForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => { setMostrarForm(false); setEditando(null); }}
          cargando={guardando}
        />
      )}

      {cargando && <p className="text-gray-500 mt-4">Cargando...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!cargando && !error && (
        <UsuariosTable usuarios={usuarios} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { adminService } from "../services/admin.service";

export default function ModalEditarServicio({ abierto, alCerrar, servicio, setServicios }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Caballero");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (servicio) {
      setNombre(servicio.nombre);
      setDescripcion(servicio.descripcion || "");
      setTipo(servicio.tipo);
      setPrecio(servicio.precio);
      setDuracion(servicio.duracion);
      setError("");
    }
  }, [servicio]);

  if (!abierto || !servicio) return null;

  const guardarCambios = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !precio || !duracion) {
      setError("Nombre, precio y duración son obligatorios");
      return;
    }

    try {
      const datosActualizados = {
        nombre,
        descripcion,
        tipo,
        precio: parseFloat(precio),
        duracion: parseInt(duracion)
      };

      await adminService.actualizarDatosCliente(servicio.id_servicio, datosActualizados);

      if (typeof setServicios === "function") {
        setServicios((prev) =>
          prev.map((s) =>
            s.id_servicio === servicio.id_servicio ? { ...s, ...datosActualizados } : s
          )
        );
      }

      alCerrar();
    } catch (err) {
      setError("Error al guardar los cambios del servicio");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-1">Modificar Servicio</h4>
        <p className="text-xs text-gray-500 mb-4">Actualiza los datos del catálogo en tiempo real.</p>

        <form onSubmit={guardarCambios} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio (€)</label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duración (min)</label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white"
            >
              <option value="Caballero">Caballero</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
              <option value="Niño">Niño</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-xs font-semibold">⚠️ {error}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={alCerrar}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Salir sin guardar
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-gray-800 transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { adminService } from "../services/admin.service";

export default function ModalServicios({ abierto, alCerrar, setServicios }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Caballero");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  if (!abierto) return null;

  const guardarServicio = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!nombre.trim() || !precio || !duracion) {
      setError("Nombre, precio y duración son campos obligatorios");
      return;
    }

    try {
      const datosNuevo = {
        nombre,
        descripcion,
        tipo,
        precio: parseFloat(precio),
        duracion: parseInt(duracion)
      };

      const respuesta = await adminService.crearNuevoServicio(datosNuevo);

      if (typeof setServicios === "function") {
        setServicios((prev) => [...prev, respuesta.servicio || respuesta.servicio]);
      }

      setExito("¡Servicio añadido al catálogo con éxito!");
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setDuracion("");
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Añadir Nuevo Servicio</h3>
          <button onClick={alCerrar} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
        </div>

        <form onSubmit={guardarServicio} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Servicio</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Corte degradado"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Incluye lavado y asesoramiento de imagen..."
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
                placeholder="15.50"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duración (min)</label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder="30"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo / Categoría</label>
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
          {exito && <p className="text-green-600 text-xs font-semibold">✅ {exito}</p>}

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 mt-4">
            <button type="button" onClick={alCerrar} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer">Cancelar</button>
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 shadow-md cursor-pointer transition">Guardar Servicio</button>
          </div>
        </form>

      </div>
    </div>
  );
}

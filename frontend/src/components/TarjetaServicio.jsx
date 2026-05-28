import React, { useState } from "react";
import { adminService } from "../services/admin.service";

export default function TarjetaServicio({ servicio, setServicios }) {
  const [cargando, setCargando] = useState(false);

  const colorCategoria = {
    Caballero: "bg-blue-50 text-blue-700 border-blue-100",
    Mujer: "bg-purple-50 text-purple-700 border-purple-100",
    Unisex: "bg-green-50 text-green-700 border-green-100",
    Niño: "bg-amber-50 text-amber-700 border-amber-100"
  };

  const manejarDeshabilitar = async () => {
    if (!servicio.activo || cargando) return;
    setCargando(true);
    try {
      await adminService.deshabilitarServicioCatalogo(servicio.id_servicio);
      if (typeof setServicios === "function") {
        setServicios((prev) =>
          prev.map((s) =>
            s.id_servicio === servicio.id_servicio ? { ...s, activo: false } : s
          )
        );
      }
    } catch (error) {
      alert("No se pudo deshabilitar el servicio");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300 ${
      !servicio.activo ? "opacity-50 bg-gray-50/50 select-none" : "hover:shadow-md"
    }`}>
      
      <div className={servicio.activo ? "group-hover:blur-[2px] transition-all duration-300" : ""}>
        <div className="flex justify-between items-start gap-2 mb-3">
          <h4 className="font-bold text-gray-900 text-base tracking-tight leading-snug">{servicio.nombre}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${colorCategoria[servicio.tipo] || "bg-gray-50 text-gray-600"}`}>
            {servicio.tipo}
          </span>
        </div>
        {servicio.descripcion && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed font-medium">{servicio.descripcion}</p>
        )}
      </div>
      
      <div className={`flex justify-between items-center pt-3 border-t border-gray-50 mt-auto ${
        servicio.activo ? "group-hover:blur-[2px] transition-all duration-300" : ""
      }`}>
        <div className="flex items-center gap-1 text-gray-400">
          <span>定</span>
          <span className="text-xs font-mono font-bold">{servicio.duracion} min</span>
        </div>
        <div>
          <span className="text-xl font-black text-gray-900">{parseFloat(servicio.precio).toFixed(2)}€</span>
        </div>
      </div>

      {servicio.activo ? (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-10">
          <button
            onClick={manejarDeshabilitar}
            disabled={cargando}
            className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 cursor-pointer disabled:bg-gray-400"
          >
            {cargando ? "Procesando..." : "Deshabilitar servicio"}
          </button>
        </div>
      ) : (
        <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-red-200">
          Fuera de catálogo
        </div>
      )}

    </div>
  );
}

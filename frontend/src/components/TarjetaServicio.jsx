import React from "react";

export default function TarjetaServicio({ servicio }) {
  const colorCategoria = {
    Caballero: "bg-blue-50 text-blue-700 border-blue-100",
    Mujer: "bg-purple-50 text-purple-700 border-purple-100",
    Unisex: "bg-green-50 text-green-700 border-green-100",
    Niño: "bg-amber-50 text-amber-700 border-amber-100"
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div>
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
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-1 text-gray-400">
          <span className="text-xs">🕒</span>
          <span className="text-xs font-mono font-bold">{servicio.duracion} min</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-gray-900">{parseFloat(servicio.precio).toFixed(2)}€</span>
        </div>
      </div>
    </div>
  );
}

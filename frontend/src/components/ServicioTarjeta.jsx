function ServicioTarjeta({ servicio, rolUsuario, onReservar }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-gray-900">{servicio.nombre}</h3>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium shrink-0">{servicio.tipo || 'Caballero'}</span>
        </div>
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">{servicio.descripcion || 'Sin descripción disponible.'}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xl font-black text-gray-900">{servicio.precio}€</span>
        {rolUsuario === 'admin' ? (
          <button className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer">Desactivar</button>
        ) : (
          <button onClick={() => onReservar(servicio)} className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">Reservar Cita</button>
        )}
      </div>
    </div>
  );
}

export default ServicioTarjeta;

import { useState } from 'react';
import ServicioTarjeta from './ServicioTarjeta';
import ReservaModal from './ReservaModal';

function ServiciosList({ servicios, rolUsuario }) {
  const [busqueda, setBusqueda] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('Todos');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const serviciosFiltrados = servicios.filter((servicio) => {
    const coincideTexto = servicio.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const categoriaServicio = servicio.tipo || 'Caballero'; 
    const coincideGenero = generoFiltro === 'Todos' || categoriaServicio.toLowerCase() === generoFiltro.toLowerCase();
    return coincideTexto && coincideGenero;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <input type="text" placeholder="¿Qué servicio estás buscando? (ej: Corte, Barba...)" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all"/>
        </div>
        <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          {['Todos', 'Caballero', 'Mujer'].map((opcion) => (
            <button key={opcion} onClick={() => setGeneroFiltro(opcion)} className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl tracking-wide transition-all cursor-pointer ${generoFiltro === opcion ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'}`}>{opcion}</button>
          ))}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 tracking-tight pl-1">{generoFiltro === 'Todos' ? 'Catálogo Completo' : `Estilos para ${generoFiltro}`}</h3>
      {serviciosFiltrados.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs"><p className="text-gray-400 text-sm font-medium">No se encontraron servicios con esos filtros.</p></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosFiltrados.map((servicio) => (
          <ServicioTarjeta key={servicio.id_servicio} servicio={servicio} rolUsuario={rolUsuario} onReservar={(serv) => setServicioSeleccionado(serv)} />
        ))}
      </div>
      {servicioSeleccionado && <ReservaModal servicio={servicioSeleccionado} alCerrar={() => setServicioSeleccionado(null)} />}
    </div>
  );
}

export default ServiciosList;

import { useEffect, useState } from 'react';
import { citaService } from '../services/cita.service';

function MisCitasList({ idUsuario }) {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarCitas = async () => {
    try {
      const datos = await citaService.obtenerCitasUsuario(idUsuario);
      setCitas(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuario) cargarCitas();
  }, [idUsuario]);

  const manejarCancelacion = async (idCita) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    try {
      await citaService.cancelarCitaCliente(idCita);
      alert('Cita cancelada correctamente.');
      cargarCitas(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const formatearFecha = (isoString) => {
    if (!isoString) return '';
    const fechaObj = new Date(isoString);
    return fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ' - ' + 
           fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + 'h';
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-10">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Mis Citas Reservadas</h3>

      {cargando && <p className="text-sm text-gray-400 animate-pulse">Buscando tus reservas...</p>}
      {error && <p className="text-xs text-red-500">⚠️ Error: {error}</p>}
      
      {!cargando && citas.length === 0 && (
        <p className="text-sm text-gray-400 py-4 font-medium">No tienes ninguna cita agendada en este momento.</p>
      )}

      <div className="space-y-4">
        {citas.map((cita) => (
          <div key={cita.id_cita} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 gap-4 hover:border-gray-200 transition-all">
            <div>
              <p className="text-sm font-mono font-bold text-gray-900">{formatearFecha(cita.fecha_hora)}</p>
              
              <p className="text-xs text-gray-600 mt-1.5">
                Tratamiento: <span className="font-bold text-gray-900">{cita.servicio_nombre}</span> ({cita.servicio_precio}€)
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wide ${
                cita.estado === 'pendiente' || !cita.estado
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-green-50 text-green-700 border-green-100'
              }`}>
                {cita.estado || 'pendiente'}
              </span>
              
              <button 
                onClick={() => manejarCancelacion(cita.id_cita)}
                className="text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
              >
                Cancelar Cita
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisCitasList;

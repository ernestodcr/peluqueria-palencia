import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { citaService } from '../services/cita.service';

function ReservaModal({ servicio, alCerrar }) {
  const { usuario } = useAuth();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const horasDisponibles = ['09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const confirmarReserva = async (e) => {
    e.preventDefault();
    if (!fecha || !hora) return;

    setCargando(true);
    setMensaje({ texto: '', tipo: '' });
    const fechaHoraCombinada = `${fecha} ${hora}:00`;

    const payload = {
      usuario_id: usuario.id_usuario,
      servicio_id: servicio.id_servicio,
      fecha_hora: fechaHoraCombinada
    };

    try {
      await citaService.crearCita(payload);
      setMensaje({ texto: '¡Cita reservada con éxito! Te esperamos.', tipo: 'exito' });
      setTimeout(() => alCerrar(), 2000);
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={alCerrar} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">✕</button>
        <div className="mb-6">
          <span className="text-[10px] bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded-md uppercase tracking-wider">Reserva de Cita</span>
          <h3 className="text-xl font-black text-gray-900 mt-2">{servicio.nombre}</h3>
          <p className="text-sm text-gray-500 mt-1">Precio: <span className="font-semibold text-gray-800">{servicio.precio}€</span></p>
        </div>
        {mensaje.texto && (
          <div className={`p-4 rounded-xl text-sm border border-l-4 mb-4 ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}
        <form onSubmit={confirmarReserva} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">1. Selecciona el Día</label>
            <input type="date" required min={new Date().toISOString().split('T')[0]} value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">2. Selecciona la Hora</label>
            <div className="grid grid-cols-4 gap-2">
              {horasDisponibles.map((h) => (
                <button key={h} type="button" onClick={() => setHora(h)} className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${hora === h ? 'bg-black text-white border-black scale-[1.03]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>{h}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={cargando || !fecha || !hora} className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-3.5 px-4 rounded-xl transition-all disabled:bg-gray-300 mt-4 cursor-pointer">
            {cargando ? 'Procesando tu reserva...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReservaModal;

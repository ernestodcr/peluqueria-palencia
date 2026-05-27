import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicioService } from '../services/servicio.service';
import ServiciosList from '../components/ServiciosList';

function Dashboard({ alCambiarVistaAdmin }) {
  const { usuario, logout } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarServicios = async () => {
      setCargando(true);
      try {
        const datos = await servicioService.obtenerTodos();
        setServicios(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarServicios();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div>
            <span className="text-xl font-black text-gray-900 tracking-tight uppercase">Peluquería Palencia</span>
            <p className="text-xs text-gray-500 mt-0.5">Hola, {usuario.nombre || usuario.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {usuario.rol === 'admin' && (
              <button onClick={alCambiarVistaAdmin} className="text-xs font-bold text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all cursor-pointer">Volver al Panel Admin</button>
            )}
            <button onClick={logout} className="text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl border border-gray-100 cursor-pointer">Cerrar Sesión</button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-r from-gray-950 to-gray-800 rounded-3xl p-8 text-white shadow-xl mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Estilo y Cuidado Profesional</h2>
          <p className="mt-2 text-sm text-gray-300 max-w-md font-light">Reserva tus citas online de forma cómoda y rápida.</p>
        </div>
        {cargando && <div className="text-center py-20 text-sm font-medium text-gray-400 animate-pulse">Sincronizando...</div>}
        {error && <div className="p-4 bg-red-50 border text-red-700 text-sm rounded-2xl mb-6">⚠️ {error}</div>}
        {!cargando && !error && <ServiciosList servicios={servicios} rolUsuario={usuario.rol} />}
      </main>
    </div>
  );
}

export default Dashboard;

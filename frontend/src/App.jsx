import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { usuario, setUsuario } = useAuth();
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  
  // Permite al administrador alternar voluntariamente entre su panel y la vista cliente
  const [vistaAdmin, setVistaAdmin] = useState(true);

  // Comprobación automática de sesión real leyendo el disco local
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const tokenGuardado = localStorage.getItem('token');

    if (usuarioGuardado && tokenGuardado) {
      const user = JSON.parse(usuarioGuardado);
      // Seteamos el usuario real con el rol exacto que guardó el backend desde PostgreSQL
      setUsuario(user);
    }
    setComprobandoSesion(false);
  }, [setUsuario]);

  // Pantalla de carga técnica profesional para evitar parpadeos visuales
  if (comprobandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xs font-semibold text-gray-400 tracking-wider animate-pulse uppercase">
          Cargando Peluquería...
        </div>
      </div>
    );
  }

  // ÁRBITRO DE AUTENTICACIÓN: Si no hay nadie logueado, va directo a la pantalla de acceso
  if (!usuario) {
    return <Login />;
  }

  // ÁRBITRO DE ROLES PROFESIONAL: 
  // Caso 1: Si es el Administrador real de la base de datos y quiere gestionar el negocio
  if (usuario.rol === 'admin' && vistaAdmin) {
    return <AdminDashboard alCambiarVista={() => setVistaAdmin(false)} />;
  }

  // Caso 2: Si es un Cliente normal (o el admin queriendo ver la interfaz del cliente)
  return <Dashboard alCambiarVistaAdmin={() => setVistaAdmin(true)} />;
}

export default App;

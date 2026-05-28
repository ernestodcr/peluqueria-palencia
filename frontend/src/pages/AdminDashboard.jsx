import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import ModalClientes from "../components/ModalClientes"; // <-- Importación modular

function AdminDashboard({ alCambiarVista }) {
  const { logout } = useAuth();
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const cargarAgenda = async () => {
      try {
        const citas = await adminService.obtenerAgendaGlobal();
        setAgenda(Array.isArray(citas) ? citas : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarAgenda();
  }, []);

  const formatearFechaHora = (isoString) => {
    if (!isoString) return "Sin fecha";
    const fechaObj = new Date(isoString);

    const opcionesFecha = { day: "2-digit", month: "2-digit", year: "numeric" };
    const opcionesHora = { hour: "2-digit", minute: "2-digit" };

    const fechaFormateada = fechaObj.toLocaleDateString("es-ES", opcionesFecha);
    const horaFormateada = fechaObj.toLocaleTimeString("es-ES", opcionesHora);

    return `${fechaFormateada} - ${horaFormateada}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-wider uppercase font-mono bg-white text-black px-2 py-1 rounded">
              ADMIN
            </span>
            <span className="text-md font-bold">
              Peluquería Palencia - Agenda
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                setModalClientesAbierto(true);
                try {
                  const data = await adminService.obtenerTodosLosClientes();
                  setClientes(data.clientes || []);
                } catch (err) {
                  console.error("Error al cargar clientes:", err.message);
                }
              }}
              className="text-xs font-bold text-gray-300 hover:text-white bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 cursor-pointer"
            >
              Ver lista clientes
            </button>
            <button
              onClick={logout}
              className="text-xs font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 px-4 py-2 rounded-xl border border-red-900/50 cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Citas Totales
            </p>
            <h3 className="text-3xl font-black text-gray-900 mt-2">
              {agenda.length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Agenda Activa
            </p>
            <h3 className="text-3xl font-black text-gray-900 mt-2">
              {agenda.length} activos
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Base de Datos
            </p>
            <h3 className="text-lg font-bold mt-3">PostgreSQL Unificada</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Agenda Completa de Reservas
            </h2>
          </div>
          {cargando && (
            <div className="text-center py-16 text-gray-400 animate-pulse">
              Sincronizando la agenda...
            </div>
          )}
          {error && (
            <div className="p-6 text-sm text-red-600 bg-red-50">
              ⚠️ Error: {error}
            </div>
          )}

          {!cargando && agenda.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No se han registrado citas en el sistema todavía.
            </div>
          )}

          {!cargando && agenda.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                    <th className="p-4 pl-6">Fecha y Hora</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Servicio Contratado</th>
                    <th className="p-4 pr-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {agenda.map((cita) => (
                    <tr
                      key={cita.id_cita}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 pl-6 font-mono font-semibold text-gray-900">
                        {formatearFechaHora(cita.fecha_hora)}
                      </td>

                      <td className="p-4 font-bold text-gray-900">
                        {cita.cliente_nombre}
                      </td>

                      <td className="p-4 text-gray-500">
                        {cita.cliente_telefono}
                      </td>

                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md font-bold">
                          {cita.servicio_nombre} ({cita.servicio_precio}€)
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <button className="text-xs font-bold text-red-600 hover:text-red-900 hover:underline cursor-pointer">
                          Cancelar Cita
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ModalClientes 
        abierto={modalClientesAbierto} 
        alCerrar={() => setModalClientesAbierto(false)} 
        clientes={clientes} 
      />
    </div>
  );
}

export default AdminDashboard;

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicioService } from '../services/servicio.service';
import { adminService } from '../services/admin.service';
import TarjetaServicio from '../components/TarjetaServicio';
import ModalReservarCita from '../components/ModalReservarCita';

function Dashboard({ alCambiarVistaAdmin }) {
  const { usuario, logout } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busquedaServicio, setBusquedaServicio] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstadoCita, setFiltroEstadoCita] = useState('Todos');

  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  const [servicioAAnotar, setServicioAAnotar] = useState(null);

  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [errorCancelar, setErrorCancelar] = useState('');

  const sincronizarCliente = async () => {
    try {
      setCargando(true);

      const [dataServicios, dataCitas] = await Promise.all([
        servicioService.obtenerTodos(),
        servicioService.obtenerMisCitas(usuario.id_usuario)
      ]);

      setServicios(Array.isArray(dataServicios) ? dataServicios : []);
      setAgenda(Array.isArray(dataCitas) ? dataCitas : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario?.id_usuario) {
      sincronizarCliente();
    }
  }, [usuario?.id_usuario]);

  const limpiarFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha.replace('Z', ''));
  };

  const extraerHora = (fecha) => {
    const fechaObj = limpiarFecha(fecha);

    if (!fechaObj) return '00:00h';

    return (
      fechaObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }) + 'h'
    );
  };

  const extraerFecha = (fecha) => {
    const fechaObj = limpiarFecha(fecha);

    if (!fechaObj) return 'Sin fecha';

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const obtenerEstadoReal = (cita) => {
    const ahora = new Date();
    const fechaCita = limpiarFecha(cita.fecha_hora);

    const duracion = parseInt(cita.servicio_duracion) || 30;

    const fechaFin = new Date(
      fechaCita.getTime() + duracion * 60000
    );

    if (cita.estado === 'pendiente' && ahora > fechaFin) {
      return 'completada';
    }

    return cita.estado;
  };

  const activarFlujoReserva = (servicio) => {
    setServicioAAnotar(servicio);
    setModalReservaAbierto(true);
  };

  const iniciarCancelacion = (cita) => {
    setCitaSeleccionada(cita);
    setMotivoCancelacion('');
    setErrorCancelar('');
    setModalCancelarAbierto(true);
  };

  const cerrarModalCancelacion = () => {
    setModalCancelarAbierto(false);
    setCitaSeleccionada(null);
    setMotivoCancelacion('');
    setErrorCancelar('');
  };

  const ejecutarCancelacion = async (e) => {
    e.preventDefault();

    if (!motivoCancelacion.trim()) {
      setErrorCancelar('El motivo de cancelación es obligatorio');
      return;
    }

    try {
      await adminService.cancelarCitaAgenda(
        citaSeleccionada.id_cita,
        motivoCancelacion
      );

      setAgenda((prev) =>
        prev.map((cita) =>
          cita.id_cita === citaSeleccionada.id_cita
            ? { ...cita, estado: 'cancelada' }
            : cita
        )
      );

      cerrarModalCancelacion();
    } catch (err) {
      setErrorCancelar('No se pudo tramitar la cancelación');
    }
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    if (!servicio.activo) return false;

    const termino = busquedaServicio.toLowerCase().trim();

    const coincideTexto =
      servicio.nombre.toLowerCase().includes(termino) ||
      servicio.descripcion?.toLowerCase().includes(termino);

    const coincideTipo =
      filtroTipo === 'Todos' || servicio.tipo === filtroTipo;

    return coincideTexto && coincideTipo;
  });

  const citasFiltradas = agenda.filter((cita) => {
    const estado = obtenerEstadoReal(cita);

    if (filtroEstadoCita === 'Todos') {
      return true;
    }

    return estado === filtroEstadoCita;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[80px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="bg-white text-black px-3 py-1 rounded-lg text-xs sm:text-sm font-black tracking-widest">
                CLIENTE
              </span>

              <h1 className="text-sm sm:text-base lg:text-lg font-bold">
                Peluquería Palencia · Hola, {usuario.nombre}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {usuario.rol === 'admin' && (
                <button
                  onClick={alCambiarVistaAdmin}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  Panel Admin
                </button>
              )}

              <button
                onClick={logout}
                className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-gradient-to-r from-black to-gray-800 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            Estilo y cuidado profesional
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl">
            Reserva y gestiona tus citas desde cualquier dispositivo.
          </p>
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Servicios disponibles
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Explora todos los servicios disponibles.
              </p>
            </div>

            <span className="self-start bg-black text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider">
              {serviciosFiltrados.length} MOSTRADOS
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={busquedaServicio}
                onChange={(e) => setBusquedaServicio(e.target.value)}
                placeholder="Buscar servicio..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition text-sm"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full lg:w-64 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition text-sm cursor-pointer"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Caballero">Caballero</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
              <option value="Niño">Niño</option>
            </select>
          </div>

          {serviciosFiltrados.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm">
              No se encontraron servicios.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {serviciosFiltrados.map((servicio) => (
                <TarjetaServicio
                  key={servicio.id_servicio}
                  servicio={servicio}
                  rolUsuario="cliente"
                  alReservar={activarFlujoReserva}
                />
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Mis citas
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Gestiona tus reservas activas e historial.
              </p>
            </div>

            <span className="self-start bg-black text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider">
              {citasFiltradas.length} MOSTRADAS
            </span>
          </div>

          <div className="mb-6">
            <select
              value={filtroEstadoCita}
              onChange={(e) => setFiltroEstadoCita(e.target.value)}
              className="w-full sm:w-72 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition text-sm cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {cargando && (
            <div className="py-14 text-center text-gray-500 animate-pulse">
              Sincronizando citas...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!cargando && citasFiltradas.length === 0 && (
            <div className="py-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm">
              No tienes citas registradas.
            </div>
          )}

          {!cargando && citasFiltradas.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Hora
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Fecha
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Servicio
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Duración
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Precio
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Estado
                    </th>

                    <th className="px-4 py-4 text-left text-xs sm:text-sm font-bold">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {citasFiltradas.map((cita) => {
                    const estado = obtenerEstadoReal(cita);

                    return (
                      <tr
                        key={cita.id_cita}
                        className={`border-t border-gray-100 transition ${
                          estado === 'cancelada'
                            ? 'bg-red-50/40 opacity-70'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                          {extraerHora(cita.fecha_hora)}
                        </td>

                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          {extraerFecha(cita.fecha_hora)}
                        </td>

                        <td className="px-4 py-4 text-sm min-w-[220px]">
                          {cita.servicio_nombre}
                        </td>

                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          {cita.servicio_duracion || 30} min
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap">
                          {parseFloat(cita.servicio_precio).toFixed(2)}€
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                              estado === 'completada'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : estado === 'cancelada'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {estado}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {estado === 'cancelada' ? (
                            <span className="text-xs font-semibold text-red-500">
                              Cita cancelada
                            </span>
                          ) : estado === 'completada' ? (
                            <span className="text-xs font-semibold text-green-600">
                              Cita finalizada
                            </span>
                          ) : (
                            <button
                              onClick={() => iniciarCancelacion(cita)}
                              className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
                            >
                              Cancelar cita
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {modalCancelarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Cancelar cita
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Vas a cancelar tu cita para el servicio de{' '}
                <span className="font-semibold text-gray-800">
                  {citaSeleccionada?.servicio_nombre}
                </span>
              </p>
            </div>

            <form onSubmit={ejecutarCancelacion}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de cancelación
                </label>

                <textarea
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  placeholder="Indica el motivo de la cancelación..."
                  className="w-full h-28 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              {errorCancelar && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {errorCancelar}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={cerrarModalCancelacion}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition cursor-pointer"
                >
                  Confirmar cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalReservarCita
        abierto={modalReservaAbierto}
        alCerrar={() => setModalReservaAbierto(false)}
        servicio={servicioAAnotar}
        idUsuario={usuario.id_usuario}
        alReservarExitoso={sincronizarCliente}
      />
    </div>
  );
}

export default Dashboard;
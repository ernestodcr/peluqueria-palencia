import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import ModalClientes from "../components/ModalClientes";
import ModalServicios from "../components/ModalServicios";
import ModalEditarServicio from "../components/ModalEditarServicio";
import TarjetaServicio from "../components/TarjetaServicio";

function AdminDashboard({ alCambiarVista }) {
  const { logout } = useAuth();

  const [agenda, setAgenda] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [clientes, setClientes] = useState([]);

  const [modalServiciosAbierto, setModalServiciosAbierto] = useState(false);

  const [modalEditarServicioAbierto, setModalEditarServicioAbierto] =
    useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [errorCancelar, setErrorCancelar] = useState("");

  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  useEffect(() => {
    const sincronizarDashboard = async () => {
      try {
        const [dataCitas, dataServicios] = await Promise.all([
          adminService.obtenerAgendaGlobal(),
          adminService.obtenerTodosLosServicios(),
        ]);

        setAgenda(Array.isArray(dataCitas) ? dataCitas : []);
        setServicios(dataServicios.servicios || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    sincronizarDashboard();
  }, []);

  const extraerHora = (isoString) => {
    if (!isoString) return "00:00";

    const fechaObj = new Date(isoString);

    return (
      fechaObj.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }) + "h"
    );
  };

  const extraerFecha = (isoString) => {
    if (!isoString) return "Sin fecha";

    const fechaObj = new Date(isoString);

    return fechaObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const abrirModalEdicion = (servicio) => {
    setServicioSeleccionado(servicio);
    setModalEditarServicioAbierto(true);
  };

  const iniciarCancelacion = (cita) => {
    setCitaSeleccionada(cita);
    setMotivoCancelacion("");
    setErrorCancelar("");
    setModalCancelarAbierto(true);
  };

  const ejecutarCancelacion = async (e) => {
    e.preventDefault();
    if (!motivoCancelacion.trim()) {
      setErrorCancelar("El motivo de cancelación es obligatorio");
      return;
    }

    try {
      await adminService.cancelarCitaAgenda(citaSeleccionada.id_cita, motivoCancelacion);
      
      setAgenda(prev => prev.map(c => 
        c.id_cita === citaSeleccionada.id_cita ? { ...c, estado: "cancelada" } : c
      ));
      
      setModalCancelarAbierto(false);
    } catch (err) {
      setErrorCancelar("No se pudo tramitar la cancelación");
    }
  };


  const serviciosFiltrados = servicios.filter((servicio) => {
    const termino = busquedaServicio.toLowerCase().trim();

    const coincideTexto =
      servicio.nombre.toLowerCase().includes(termino) ||
      (servicio.descripcion &&
        servicio.descripcion.toLowerCase().includes(termino));

    const coincideTipo =
      filtroTipo === "Todos" || servicio.tipo === filtroTipo;

    return coincideTexto && coincideTipo;
  });

  return (
    <>
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
                    const data =
                      await adminService.obtenerTodosLosClientes();

                    setClientes(data.clientes || []);
                  } catch (err) {
                    console.error(
                      "Error al cargar clientes:",
                      err.message
                    );
                  }
                }}
                className="text-xs font-bold text-gray-300 hover:text-white bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 cursor-pointer"
              >
                Ver lista clientes
              </button>

              <button
                onClick={() => setModalServiciosAbierto(true)}
                className="text-xs font-bold text-gray-300 hover:text-white bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 cursor-pointer"
              >
                Añadir servicio
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
                {
                  agenda.filter(
                    (cita) => cita.estado !== "cancelada"
                  ).length
                }{" "}
                activos
              </h3>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Base de Datos
              </p>

              <h3 className="text-lg font-bold mt-3">
                PostgreSQL Unificada
              </h3>
            </div>
          </div>

          <div className="mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Catálogo de Servicios Ofertados
                </h2>

                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Gestiona y visualiza los tratamientos disponibles en
                  tiempo real.
                </p>
              </div>

              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md font-mono self-start sm:self-auto">
                {serviciosFiltrados.length} MOSTRADOS
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none text-sm">
                  🔍
                </span>

                <input
                  type="text"
                  value={busquedaServicio}
                  onChange={(e) =>
                    setBusquedaServicio(e.target.value)
                  }
                  placeholder="Buscar servicio por nombre o descripción..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:bg-white transition text-gray-600 font-medium cursor-pointer"
              >
                <option value="Todos">
                  Todas las categorías
                </option>

                <option value="Caballero">Caballero</option>
                <option value="Mujer">Mujer</option>
                <option value="Unisex">Unisex</option>
                <option value="Niño">Niño</option>
              </select>
            </div>

            {serviciosFiltrados.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                No se encontraron servicios que coincidan con tus
                filtros actuales.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviciosFiltrados.map((servicio) => (
                  <TarjetaServicio
                    key={servicio.id_servicio}
                    servicio={servicio}
                    setServicios={setServicios}
                    alEditar={abrirModalEdicion}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Agenda de Reservas del Salón
              </h2>

              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Listado cronológico de los turnos solicitados por los
                clientes activos.
              </p>
            </div>

            {cargando && (
              <div className="text-center py-12 text-gray-400 font-medium animate-pulse">
                Sincronizando el estado de la agenda...
              </div>
            )}

            {error && (
              <div className="p-4 text-xs font-bold text-red-700 bg-red-50 rounded-xl border border-red-100">
                ⚠️ Error de conexión: {error}
              </div>
            )}

            {!cargando && agenda.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                No hay citas programadas para las próximas fechas en el
                sistema.
              </div>
            )}

            {!cargando && agenda.length > 0 && (
              <div className="space-y-4">
                {agenda.map((cita) => (
                  <div
                    key={cita.id_cita}
                    className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-black/20 transition-all duration-200 border-l-4 ${
                      cita.estado === "cancelada"
                        ? "border-gray-200 opacity-60 bg-gray-50/50"
                        : "border-black"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white rounded-xl px-4 py-3 min-w-[90px] text-center">
                        <p className="text-lg font-black">
                          {extraerHora(cita.fecha_hora)}
                        </p>

                        <p className="text-[10px] uppercase tracking-wide text-gray-300">
                          {extraerFecha(cita.fecha_hora)}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-gray-900">
                          {cita.cliente_nombre}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          {cita.cliente_telefono}
                        </p>

                        <p className="text-xs text-gray-700 mt-2">
                          Servicio contratado:
                          <span className="font-bold ml-1">
                            {cita.servicio_nombre}
                          </span>
                        </p>

                        {cita.estado === "cancelada" &&
                          cita.motivo_cancelacion && (
                            <p className="text-xs text-red-500 mt-2 font-medium">
                              Motivo: {cita.motivo_cancelacion}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">
                          Precio del Turno
                        </p>

                        <p className="text-xl font-black text-gray-900">
                          {parseFloat(
                            cita.servicio_precio || 0
                          ).toFixed(2)}
                          €
                        </p>
                      </div>

                      {cita.estado === "cancelada" ? (
                        <span className="bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide">
                          Cancelada
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            iniciarCancelacion(cita)
                          }
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          Cancelar Cita
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {modalCancelarAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Anular Turno de Peluquería
            </h3>

            <p className="text-xs text-gray-500 mb-5">
              Vas a cancelar la cita de{" "}
              <span className="font-bold">
                {citaSeleccionada?.cliente_nombre}
              </span>{" "}
              para el servicio{" "}
              <span className="font-bold">
                {citaSeleccionada?.servicio_nombre}
              </span>
              .
            </p>

            <form
              onSubmit={ejecutarCancelacion}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Motivo del descarte
                </label>

                <textarea
                  value={motivoCancelacion}
                  onChange={(e) =>
                    setMotivoCancelacion(e.target.value)
                  }
                  placeholder="Ej. El cliente llamó avisando que no puede asistir..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-28"
                />
              </div>

              {errorCancelar && (
                <p className="text-red-600 text-xs font-bold">
                  ⚠️ {errorCancelar}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setModalCancelarAbierto(false)
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalClientes
        abierto={modalClientesAbierto}
        alCerrar={() => setModalClientesAbierto(false)}
        clientes={clientes}
        setClientes={setClientes}
      />

      <ModalServicios
        abierto={modalServiciosAbierto}
        alCerrar={() => setModalServiciosAbierto(false)}
        setServicios={setServicios}
      />

      <ModalEditarServicio
        abierto={modalEditarServicioAbierto}
        alCerrar={() =>
          setModalEditarServicioAbierto(false)
        }
        servicio={servicioSeleccionado}
        setServicios={setServicios}
      />
    </>
  );
}

export default AdminDashboard;
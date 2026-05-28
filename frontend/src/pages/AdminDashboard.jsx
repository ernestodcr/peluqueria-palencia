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

  const [modalEditarServicioAbierto, setModalEditarServicioAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [errorCancelar, setErrorCancelar] = useState("");

  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [filtroEstadoCita, setFiltroEstadoCita] = useState("Todos");

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
      await adminService.cancelarCitaAgenda(
        citaSeleccionada.id_cita,
        motivoCancelacion
      );

      setAgenda((prev) =>
        prev.map((c) =>
          c.id_cita === citaSeleccionada.id_cita
            ? { ...c, estado: "cancelada" }
            : c
        )
      );

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

    let coincideFiltro = false;
    
    if (filtroTipo === "Todos") {
      coincideFiltro = true; 
    } else if (filtroTipo === "Deshabilitados") {
      coincideFiltro = servicio.activo === false || servicio.activo === "false" || !servicio.activo;
    } else {
      coincideFiltro = servicio.tipo === filtroTipo && servicio.activo !== false && servicio.activo !== "false";
    }

    return coincideTexto && coincideFiltro;
  });



  const citasFiltradas = agenda.filter((cita) => {
    const ahora = new Date();
    const fechaCita = new Date(cita.fecha_hora);
    const duracionMinutos = parseInt(cita.servicio_duracion) || 30;
    const fechaFinCita = new Date(fechaCita.getTime() + duracionMinutos * 60000);

    let estadoReal = cita.estado;

    if (cita.estado === "pendiente" && ahora > fechaFinCita) {
      estadoReal = "completada";
    }

    if (filtroEstadoCita === "Todos") return true;

    return estadoReal === filtroEstadoCita;
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
          <div className="mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Catálogo de Servicios Ofertados
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Gestiona y visualiza los tratamientos disponibles en tiempo real.
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
                  onChange={(e) => setBusquedaServicio(e.target.value)}
                  placeholder="Buscar servicio por nombre o descripción..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:bg-white transition text-gray-600 font-medium cursor-pointer"
              >
                <option value="Todos">Todas las categorías</option>
                <option value="Caballero">Caballero</option>
                <option value="Mujer">Mujer</option>
                <option value="Unisex">Unisex</option>
                <option value="Niño">Niño</option>
                <option value="Deshabilitados">Deshabilitados</option>
              </select>
            </div>

            {serviciosFiltrados.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                No se encontraron servicios que coincidan con tus filtros actuales.
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

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Agenda de Reservas del Salón
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Visualiza y gestiona las citas programadas según su estado.
                </p>
              </div>

              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md font-mono">
                {citasFiltradas.length} MOSTRADOS
              </span>

              <select
                value={filtroEstadoCita}
                onChange={(e) => setFiltroEstadoCita(e.target.value)}
                className="px-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:bg-white transition text-gray-600 font-medium cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            {cargando && (
              <p className="text-sm text-gray-500">Sincronizando la agenda...</p>
            )}

            {error && (
              <p className="text-sm text-red-500">⚠️ Error de conexión: {error}</p>
            )}

            {!cargando && citasFiltradas.length === 0 && (
              <p className="text-sm text-gray-400">
                No se han encontrado citas con los filtros actuales.
              </p>
            )}

            {!cargando && citasFiltradas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase border-b">
                      <th className="p-2">Fecha y Hora</th>
                      <th className="p-2">Cliente</th>
                      <th className="p-2">Teléfono</th>
                      <th className="p-2">Servicio</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {citasFiltradas.map((cita) => {
                      const ahora = new Date();
                      const fechaCita = new Date(cita.fecha_hora);
                      const duracionMinutos = parseInt(cita.servicio_duracion) || 30;
                      const fechaFinCita = new Date(fechaCita.getTime() + duracionMinutos * 60000);

                      let estadoReal = cita.estado;
                      if (cita.estado === "pendiente" && ahora > fechaFinCita) {
                        estadoReal = "completada";
                      }

                      return (
                        <tr
                          key={cita.id_cita}
                          className={`border-b transition-colors ${
                            estadoReal === "cancelada"
                              ? "bg-gray-50 text-gray-400 opacity-60"
                              : estadoReal === "completada"
                              ? "bg-green-50/20"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="p-2">
                            <div>{extraerFecha(cita.fecha_hora)}</div>
                            <div className="text-xs text-gray-500">
                              {extraerHora(cita.fecha_hora)}
                            </div>
                          </td>

                          <td className="p-2">{cita.cliente_nombre}</td>
                          <td className="p-2">{cita.cliente_telefono}</td>

                          <td className="p-2">
                            <span className="font-medium">
                              {cita.servicio_nombre} ({cita.servicio_precio}€)
                            </span>
                          </td>

                          <td className="p-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                                estadoReal === "completada"
                                  ? "bg-green-100 text-green-700"
                                  : estadoReal === "cancelada"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {estadoReal}
                            </span>
                          </td>

                          <td className="p-2 text-right">
                            {estadoReal === "pendiente" ? (
                              <button
                                onClick={() => iniciarCancelacion(cita)}
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Cancelar
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
              alCerrar={() => setModalEditarServicioAbierto(false)}
              servicio={servicioSeleccionado}
              setServicios={setServicios}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";

import ModalClientes from "../components/ModalClientes";
import ModalServicios from "../components/ModalServicios";
import ModalEditarServicio from "../components/ModalEditarServicio";
import TarjetaServicio from "../components/TarjetaServicio";

function AdminDashboard() {
  const { logout } = useAuth();

  const [agenda, setAgenda] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalClientesAbierto, setModalClientesAbierto] =
    useState(false);

  const [clientes, setClientes] = useState([]);

  const [modalServiciosAbierto, setModalServiciosAbierto] =
    useState(false);

  const [
    modalEditarServicioAbierto,
    setModalEditarServicioAbierto,
  ] = useState(false);

  const [servicioSeleccionado, setServicioSeleccionado] =
    useState(null);

  const [modalCancelarAbierto, setModalCancelarAbierto] =
    useState(false);

  const [citaSeleccionada, setCitaSeleccionada] =
    useState(null);

  const [motivoCancelacion, setMotivoCancelacion] =
    useState("");

  const [errorCancelar, setErrorCancelar] = useState("");

  const [busquedaServicio, setBusquedaServicio] =
    useState("");

  const [filtroTipo, setFiltroTipo] =
    useState("Todos");

  const [filtroEstadoCita, setFiltroEstadoCita] =
    useState("Todos");

  useEffect(() => {
    const sincronizarDashboard = async () => {
      try {
        const [dataCitas, dataServicios] =
          await Promise.all([
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
      setErrorCancelar(
        "El motivo de cancelación es obligatorio"
      );

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
      setErrorCancelar(
        "No se pudo tramitar la cancelación"
      );
    }
  };

  const serviciosFiltrados = servicios.filter(
    (servicio) => {
      const termino =
        busquedaServicio.toLowerCase().trim();

      const coincideTexto =
        servicio.nombre
          .toLowerCase()
          .includes(termino) ||
        (servicio.descripcion &&
          servicio.descripcion
            .toLowerCase()
            .includes(termino));

      let coincideFiltro = false;

      if (filtroTipo === "Todos") {
        coincideFiltro = true;
      } else if (
        filtroTipo === "Deshabilitados"
      ) {
        coincideFiltro =
          servicio.activo === false ||
          servicio.activo === "false" ||
          !servicio.activo;
      } else {
        coincideFiltro =
          servicio.tipo === filtroTipo &&
          servicio.activo !== false &&
          servicio.activo !== "false";
      }

      return coincideTexto && coincideFiltro;
    }
  );

  const citasFiltradas = agenda.filter((cita) => {
    const ahora = new Date();

    const fechaCita = new Date(cita.fecha_hora);

    const duracionMinutos =
      parseInt(cita.servicio_duracion) || 30;

    const fechaFinCita = new Date(
      fechaCita.getTime() +
        duracionMinutos * 60000
    );

    let estadoReal = cita.estado;

    if (
      cita.estado === "pendiente" &&
      ahora > fechaFinCita
    ) {
      estadoReal = "completada";
    }

    if (filtroEstadoCita === "Todos") {
      return true;
    }

    return estadoReal === filtroEstadoCita;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <nav className="sticky top-0 z-50 bg-black text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded bg-white px-2 py-1 font-mono text-lg font-black uppercase tracking-wider text-black">
              ADMIN
            </span>

            <span className="text-sm font-bold sm:text-base">
              Peluquería Palencia - Agenda
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
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
              className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-300 transition hover:text-white"
            >
              Ver lista clientes
            </button>

            <button
              onClick={() =>
                setModalServiciosAbierto(true)
              }
              className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-300 transition hover:text-white"
            >
              Añadir servicio
            </button>

            <button
              onClick={logout}
              className="rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-600 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl lg:text-2xl">
                Catálogo de Servicios Ofertados
              </h2>

              <p className="mt-1 text-xs font-medium text-gray-400">
                Gestiona y visualiza los tratamientos
                disponibles en tiempo real.
              </p>
            </div>

            <span className="self-start rounded-md bg-black px-2 py-1 font-mono text-xs font-bold text-white">
              {serviciosFiltrados.length} MOSTRADOS
            </span>
          </div>

          <div className="mb-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={busquedaServicio}
                onChange={(e) =>
                  setBusquedaServicio(e.target.value)
                }
                placeholder="Buscar servicio por nombre o descripción..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-black"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value)
              }
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 outline-none transition focus:bg-white focus:ring-2 focus:ring-black lg:w-64"
            >
              <option value="Todos">
                Todas las categorías
              </option>

              <option value="Caballero">
                Caballero
              </option>

              <option value="Mujer">
                Mujer
              </option>

              <option value="Unisex">
                Unisex
              </option>

              <option value="Niño">
                Niño
              </option>

              <option value="Deshabilitados">
                Deshabilitados
              </option>
            </select>
          </div>

          {serviciosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-sm font-medium text-gray-400">
              No se encontraron servicios que
              coincidan con tus filtros actuales.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {serviciosFiltrados.map((servicio) => (
                <TarjetaServicio
                  key={servicio.id_servicio}
                  servicio={servicio}
                  setServicios={setServicios}
                  alEditar={abrirModalEdicion}
                  rolUsuario="admin"
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl lg:text-2xl">
                Agenda de Reservas del Salón
              </h2>

              <p className="mt-1 text-xs font-medium text-gray-400">
                Visualiza y gestiona las citas
                programadas según su estado.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="rounded-md bg-black px-2 py-1 font-mono text-xs font-bold text-white">
                {citasFiltradas.length} MOSTRADOS
              </span>

              <select
                value={filtroEstadoCita}
                onChange={(e) =>
                  setFiltroEstadoCita(
                    e.target.value
                  )
                }
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 outline-none transition focus:bg-white focus:ring-2 focus:ring-black"
              >
                <option value="Todos">
                  Todos los estados
                </option>

                <option value="pendiente">
                  Pendientes
                </option>

                <option value="completada">
                  Completadas
                </option>

                <option value="cancelada">
                  Canceladas
                </option>
              </select>
            </div>
          </div>

          {cargando && (
            <p className="text-sm text-gray-500">
              Sincronizando la agenda...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">
              ⚠️ Error de conexión: {error}
            </p>
          )}

          {!cargando &&
            citasFiltradas.length === 0 && (
              <p className="text-sm text-gray-400">
                No se han encontrado citas con
                los filtros actuales.
              </p>
            )}

          {!cargando &&
            citasFiltradas.length > 0 && (
              <>
                <div className="flex flex-col gap-4 lg:hidden">
                  {citasFiltradas.map((cita) => {
                    const ahora = new Date();

                    const fechaCita = new Date(
                      cita.fecha_hora
                    );

                    const duracionMinutos =
                      parseInt(
                        cita.servicio_duracion
                      ) || 30;

                    const fechaFinCita = new Date(
                      fechaCita.getTime() +
                        duracionMinutos * 60000
                    );

                    let estadoReal = cita.estado;

                    if (
                      cita.estado ===
                        "pendiente" &&
                      ahora > fechaFinCita
                    ) {
                      estadoReal =
                        "completada";
                    }

                    return (
                      <div
                        key={cita.id_cita}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              {
                                cita.cliente_nombre
                              }
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {extraerFecha(
                                cita.fecha_hora
                              )}{" "}
                              ·{" "}
                              {extraerHora(
                                cita.fecha_hora
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${
                              estadoReal ===
                              "completada"
                                ? "bg-green-100 text-green-700"
                                : estadoReal ===
                                  "cancelada"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {estadoReal}
                          </span>
                        </div>

                        <div className="mt-4 space-y-1">
                          <p className="text-sm font-medium">
                            {
                              cita.servicio_nombre
                            }{" "}
                            (
                            {
                              cita.servicio_precio
                            }
                            €)
                          </p>

                          <p className="text-xs text-gray-500">
                            📞{" "}
                            {
                              cita.cliente_telefono
                            }
                          </p>
                        </div>

                        {estadoReal ===
                          "pendiente" && (
                          <button
                            onClick={() =>
                              iniciarCancelacion(
                                cita
                              )
                            }
                            className="mt-4 w-full rounded-xl bg-red-50 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            Cancelar cita
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-gray-500">
                        <th className="p-2">
                          Fecha y Hora
                        </th>

                        <th className="p-2">
                          Cliente
                        </th>

                        <th className="p-2">
                          Teléfono
                        </th>

                        <th className="p-2">
                          Servicio
                        </th>

                        <th className="p-2">
                          Estado
                        </th>

                        <th className="p-2 text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {citasFiltradas.map(
                        (cita) => {
                          const ahora =
                            new Date();

                          const fechaCita =
                            new Date(
                              cita.fecha_hora
                            );

                          const duracionMinutos =
                            parseInt(
                              cita.servicio_duracion
                            ) || 30;

                          const fechaFinCita =
                            new Date(
                              fechaCita.getTime() +
                                duracionMinutos *
                                  60000
                            );

                          let estadoReal =
                            cita.estado;

                          if (
                            cita.estado ===
                              "pendiente" &&
                            ahora >
                              fechaFinCita
                          ) {
                            estadoReal =
                              "completada";
                          }

                          return (
                            <tr
                              key={
                                cita.id_cita
                              }
                              className={`border-b transition-colors ${
                                estadoReal ===
                                "cancelada"
                                  ? "bg-gray-50 text-gray-400 opacity-60"
                                  : estadoReal ===
                                    "completada"
                                  ? "bg-green-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="p-2">
                                <div>
                                  {extraerFecha(
                                    cita.fecha_hora
                                  )}
                                </div>

                                <div className="text-xs text-gray-500">
                                  {extraerHora(
                                    cita.fecha_hora
                                  )}
                                </div>
                              </td>

                              <td className="p-2">
                                {
                                  cita.cliente_nombre
                                }
                              </td>

                              <td className="p-2">
                                {
                                  cita.cliente_telefono
                                }
                              </td>

                              <td className="p-2">
                                <span className="font-medium">
                                  {
                                    cita.servicio_nombre
                                  }{" "}
                                  (
                                  {
                                    cita.servicio_precio
                                  }
                                  €)
                                </span>
                              </td>

                              <td className="p-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${
                                    estadoReal ===
                                    "completada"
                                      ? "bg-green-100 text-green-700"
                                      : estadoReal ===
                                        "cancelada"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {
                                    estadoReal
                                  }
                                </span>
                              </td>

                              <td className="p-2 text-right">
                                {estadoReal ===
                                "pendiente" ? (
                                  <button
                                    onClick={() =>
                                      iniciarCancelacion(
                                        cita
                                      )
                                    }
                                    className="text-xs font-bold text-red-600 hover:underline"
                                  >
                                    Cancelar
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          <ModalClientes
            abierto={modalClientesAbierto}
            alCerrar={() =>
              setModalClientesAbierto(false)
            }
            clientes={clientes}
            setClientes={setClientes}
          />

          <ModalServicios
            abierto={modalServiciosAbierto}
            alCerrar={() =>
              setModalServiciosAbierto(false)
            }
            setServicios={setServicios}
          />

          <ModalEditarServicio
            abierto={
              modalEditarServicioAbierto
            }
            alCerrar={() =>
              setModalEditarServicioAbierto(
                false
              )
            }
            servicio={servicioSeleccionado}
            setServicios={setServicios}
          />
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;

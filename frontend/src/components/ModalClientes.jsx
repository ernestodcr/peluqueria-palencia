import React, { useState } from "react";
import { adminService } from "../services/admin.service";

export default function ModalClientes({
  abierto,
  alCerrar,
  clientes,
  setClientes,
}) {
  const [modalBajaAbierto, setModalBajaAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [errorBaja, setErrorBaja] = useState("");

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [errorEditar, setErrorEditar] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [historialCitas, setHistorialCitas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [verHistorialId, setVerHistorialId] = useState(null);

  if (!abierto) return null;

  const iniciarBaja = (cliente) => {
    setClienteSeleccionado(cliente);
    setMotivoBaja("");
    setErrorBaja("");
    setModalBajaAbierto(true);
  };

  const ejecutarBaja = async (e) => {
    e.preventDefault();

    if (!motivoBaja.trim()) {
      setErrorBaja("El motivo es obligatorio");
      return;
    }

    try {
      await adminService.darBajaCliente(
        clienteSeleccionado.id_usuario,
        motivoBaja
      );

      if (typeof setClientes === "function") {
        setClientes((prev) =>
          prev.map((c) =>
            c.id_usuario === clienteSeleccionado.id_usuario
              ? { ...c, activo: false }
              : c
          )
        );
      }

      setModalBajaAbierto(false);
    } catch (err) {
      setErrorBaja(err.message || "Error al procesar la baja");
    }
  };

  const iniciarEdicion = (cliente) => {
    setClienteSeleccionado(cliente);
    setEditNombre(cliente.nombre);
    setEditEmail(cliente.email);
    setEditTelefono(cliente.telefono);
    setErrorEditar("");
    setModalEditarAbierto(true);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    if (!editNombre.trim() || !editEmail.trim() || !editTelefono.trim()) {
      setErrorEditar("Todos los campos modificables son obligatorios");
      return;
    }

    try {
      await adminService.actualizarDatosCliente(
        clienteSeleccionado.id_usuario,
        {
          nombre: editNombre,
          email: editEmail,
          telefono: editTelefono,
          motivo_baja: clienteSeleccionado.motivo_baja,
        }
      );

      if (typeof setClientes === "function") {
        setClientes((prev) =>
          prev.map((c) =>
            c.id_usuario === clienteSeleccionado.id_usuario
              ? {
                  ...c,
                  nombre: editNombre,
                  email: editEmail,
                  telefono: editTelefono,
                }
              : c
          )
        );
      }

      setModalEditarAbierto(false);
    } catch (err) {
      setErrorEditar("Error al guardar los cambios del usuario");
    }
  };

  const cargarHistorialServicios = async (cliente) => {
    if (verHistorialId === cliente.id_usuario) {
      setVerHistorialId(null);
      return;
    }

    setVerHistorialId(cliente.id_usuario);
    setClienteSeleccionado(cliente);
    setCargandoHistorial(true);

    try {
      const citas = await adminService.obtenerCitasDeUsuario(
        cliente.id_usuario
      );
      setHistorialCitas(citas || []);
    } catch (error) {
      setHistorialCitas([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const formatearFechaHora = (isoString) => {
    if (!isoString) return "Sin fecha";

    const fechaObj = new Date(isoString);

    const opcionesFecha = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    const opcionesHora = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return `${fechaObj.toLocaleDateString(
      "es-ES",
      opcionesFecha
    )} - ${fechaObj.toLocaleTimeString(
      "es-ES",
      opcionesHora
    )}h`;
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const termino = busqueda.toLowerCase().trim();

    return (
      cliente.nombre.toLowerCase().includes(termino) ||
      cliente.email.toLowerCase().includes(termino) ||
      cliente.telefono.includes(termino)
    );
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">
                Lista Global de Clientes
              </h3>

              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md font-mono">
                {clientesFiltrados.length} MOSTRADOS
              </span>
            </div>

            <button
              onClick={alCerrar}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none text-sm">
                🔍
              </span>

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente por nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black transition shadow-xs"
              />
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 overflow-x-auto rounded-xl border border-gray-100 h-fit max-h-[55vh]">
              {clientesFiltrados.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10 font-medium">
                  No se encontraron clientes que coincidan con "{busqueda}"
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                      <th className="p-3 pl-4">Nombre</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right pr-4">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {clientesFiltrados.map((cliente) => (
                      <tr
                        key={cliente.id_usuario}
                        className={`transition-colors ${
                          verHistorialId === cliente.id_usuario
                            ? "bg-black/5"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="p-3 pl-4 font-semibold text-gray-900">
                          {cliente.nombre}
                        </td>

                        <td className="p-3 text-gray-500 text-xs">
                          {cliente.email}
                        </td>

                        <td className="p-3 text-gray-500 font-mono text-xs">
                          {cliente.telefono}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              cliente.activo
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {cliente.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td className="p-3 text-right pr-4 space-x-2">
                          <button
                            onClick={() =>
                              cargarHistorialServicios(cliente)
                            }
                            className="text-xs font-bold text-gray-600 hover:text-black cursor-pointer bg-gray-100 px-2 py-1 rounded-md border border-gray-200"
                          >
                            👁️ Citas
                          </button>

                          {cliente.activo ? (
                            <>
                              <button
                                onClick={() => iniciarEdicion(cliente)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-900 cursor-pointer"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() => iniciarBaja(cliente)}
                                className="text-xs font-bold text-red-600 hover:text-red-900 cursor-pointer"
                              >
                                Dar de baja
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Baja tramitada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {verHistorialId && (
              <div className="w-full lg:w-80 bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex flex-col max-h-[55vh] overflow-hidden animate-fade-in shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Historial: {clienteSeleccionado?.nombre}
                  </h4>

                  <button
                    onClick={() => setVerHistorialId(null)}
                    className="text-xs text-gray-400 hover:text-black font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {cargandoHistorial ? (
                    <div className="text-center text-sm text-gray-400 py-10">
                      Buscando citas en el servidor...
                    </div>
                  ) : historialCitas.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-10">
                      Este usuario no ha reservado ninguna cita todavía.
                    </div>
                  ) : (
                    historialCitas.map((cita) => (
                      <div
                        key={cita.id_cita}
                        className="bg-white border border-gray-100 rounded-xl p-3"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {cita.servicio_nombre}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {formatearFechaHora(cita.fecha_hora)}
                            </p>
                          </div>

                          <span className="text-xs font-black text-black">
                            {parseFloat(cita.servicio_precio).toFixed(2)}€
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                            cita.estado === "cancelada"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : cita.estado === "completada"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={alCerrar}
              className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {modalEditarAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              Modificar Perfil de Cliente
            </h4>

            <p className="text-xs text-gray-500 mb-4">
              Edita la información visible del usuario en el sistema.
            </p>

            <form onSubmit={guardarEdicion} className="space-y-4">
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                placeholder="Nombre Completo"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Correo Electrónico"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="text"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
                placeholder="Teléfono Móvil"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {errorEditar && (
                <p className="text-red-600 text-xs font-semibold">
                  ⚠️ {errorEditar}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Salir sin guardar
                </button>

                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalBajaAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              Confirmar baja de usuario
            </h4>

            <p className="text-xs text-gray-500 mb-4">
              Vas a desactivar a {clienteSeleccionado?.nombre} del sistema.
            </p>

            <form onSubmit={ejecutarBaja} className="space-y-4">
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Indica la razón de la baja..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-24"
              />

              {errorBaja && (
                <p className="text-red-600 text-xs font-semibold">
                  ⚠️ {errorBaja}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBajaAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirmar Baja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
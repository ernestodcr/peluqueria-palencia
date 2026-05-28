import React, { useState } from "react";
import { adminService } from "../services/admin.service";

export default function ModalClientes({ abierto, alCerrar, clientes, setClientes }) {
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
      await adminService.darBajaCliente(clienteSeleccionado.id_usuario, motivoBaja);

      if (typeof setClientes === "function") {
        setClientes((prev) =>
          prev.map((c) =>
            c.id_usuario === clienteSeleccionado.id_usuario ? { ...c, activo: false } : c
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
      await adminService.actualizarDatosCliente(clienteSeleccionado.id_usuario, {
        nombre: editNombre,
        email: editEmail,
        telefono: editTelefono,
        motivo_baja: clienteSeleccionado.motivo_baja,
      });

      if (typeof setClientes === "function") {
        setClientes((prev) =>
          prev.map((c) =>
            c.id_usuario === clienteSeleccionado.id_usuario
              ? { ...c, nombre: editNombre, email: editEmail, telefono: editTelefono }
              : c
          )
        );
      }

      setModalEditarAbierto(false);
    } catch (err) {
      setErrorEditar("Error al guardar los cambios del usuario");
    }
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">Lista Global de Clientes</h3>
              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md font-mono">
                {clientesFiltrados.length} MOSTRADOS
              </span>
            </div>
            <button onClick={alCerrar} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">
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

          <div className="p-6 overflow-y-auto flex-1">
            {clientesFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10 font-medium">
                No se encontraron clientes que coincidan con "{busqueda}"
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
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
                      <tr key={cliente.id_usuario} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-gray-900">{cliente.nombre}</td>
                        <td className="p-3 text-gray-500">{cliente.email}</td>
                        <td className="p-3 text-gray-500">{cliente.telefono}</td>
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
                            <span className="text-xs text-gray-400 italic">Baja tramitada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <h4 className="text-lg font-bold text-gray-900 mb-1">Modificar Perfil de Cliente</h4>
            <p className="text-xs text-gray-500 mb-4">
              Edita la información visible del usuario en el sistema.
            </p>

            <form onSubmit={guardarEdicion} className="space-y-4">
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Nombre"
              />

              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Email"
              />

              <input
                type="text"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Teléfono"
              />

              {errorEditar && (
                <p className="text-red-600 text-xs font-semibold">⚠️ {errorEditar}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Salir sin guardar
                </button>

                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold"
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
            <h4 className="text-lg font-bold text-gray-900 mb-1">Confirmar baja de usuario</h4>
            <p className="text-xs text-gray-500 mb-4">
              Vas a desactivar a {clienteSeleccionado?.nombre} del sistema.
            </p>

            <form onSubmit={ejecutarBaja} className="space-y-4">
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Motivo de la baja"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm h-24 resize-none"
              />

              {errorBaja && (
                <p className="text-red-600 text-xs font-semibold">⚠️ {errorBaja}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBajaAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
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
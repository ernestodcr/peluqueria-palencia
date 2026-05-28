import React, { useState } from "react";
import { adminService } from "../services/admin.service";

export default function ModalClientes({ abierto, alCerrar, clientes, setClientes }) {
  const [modalBajaAbierto, setModalBajaAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [errorBaja, setErrorBaja] = useState("");

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

      if (setClientes) {
        setClientes(prev => prev.map(c =>
          c.id_usuario === clienteSeleccionado.id_usuario ? { ...c, activo: false } : c
        ));
      }

      setModalBajaAbierto(false);
    } catch (err) {
      setErrorBaja(err.message || "Error al procesar la baja");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden">

          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Lista Global de Clientes</h3>
            <button onClick={alCerrar} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
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
                  {clientes.map((cliente) => (
                    <tr key={cliente.id_usuario} className="hover:bg-gray-50/50">
                      <td className="p-3 pl-4 font-semibold text-gray-900">{cliente.nombre}</td>
                      <td className="p-3 text-gray-500">{cliente.email}</td>
                      <td className="p-3 text-gray-500">{cliente.telefono}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cliente.activo ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                          {cliente.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4 space-x-2">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-900 cursor-pointer">
                          Editar
                        </button>
                        {cliente.activo ? (
                          <button
                            onClick={() => iniciarBaja(cliente)}
                            className="text-xs font-bold text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            Dar de baja
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Baja tramitada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button onClick={alCerrar} className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {modalBajaAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Confirmar baja de usuario</h4>
            <p className="text-xs text-gray-500 mb-4">Vas a desactivar a <strong>{clienteSeleccionado?.nombre}</strong> del sistema.</p>

            <form onSubmit={ejecutarBaja}>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Motivo de la baja</label>
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Indica la razón (ej. Mal comportamiento, solicitud del cliente...)"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-24 mb-1"
              />
              {errorBaja && <p className="text-red-600 text-xs font-semibold mb-3">⚠️ {errorBaja}</p>}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalBajaAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
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

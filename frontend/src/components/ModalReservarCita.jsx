import React, { useState, useEffect } from "react";
import { adminService } from "../services/admin.service";

export default function ModalReservarCita({ abierto, alCerrar, servicio, idUsuario, alReservarExitoso }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [agendaGlobal, setAgendaGlobal] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (abierto) {
      adminService.obtenerAgendaGlobal()
        .then(data => setAgendaGlobal(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error al cargar agenda para validación:", err));
      setFecha("");
      setHora("");
      setError("");
    }
  }, [abierto]);

  useEffect(() => {
    if (!fecha) return;

    const fechaLocal = new Date(fecha + "T00:00:00");
    const diaSemana = fechaLocal.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      setError("La peluquería abre de Lunes a Viernes. Elige otro día.");
      setHorasDisponibles([]);
      return;
    }
    setError("");

    const horasBase = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
    
    const hLibres = horasBase.filter(h => {
      const fechaHoraPropuesta = new Date(`${fecha}T${h}:00`);
      
      return !agendaGlobal.some(cita => {
        if (cita.estado === "cancelada") return false;
        
        const stringLimpio = cita.fecha_hora.replace("Z", "");
        const inicioCitaExistente = new Date(stringLimpio);
        const duracionMinutos = parseInt(cita.servicio_duracion) || 30;
        const finCitaExistente = new Date(inicioCitaExistente.getTime() + duracionMinutos * 60000);
        
        return fechaHoraPropuesta >= inicioCitaExistente && fechaHoraPropuesta < finCitaExistente;
      });
    });

    setHorasDisponibles(hLibres);
  }, [fecha, agendaGlobal]);

  if (!abierto || !servicio) return null;

  const registrarTurno = async (e) => {
    e.preventDefault();
    if (!fecha || !hora) {
      setError("Debes seleccionar una fecha y un horario");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: idUsuario,
          servicio_id: servicio.id_servicio,
          fecha_hora: `${fecha}T${hora}:00`
        })
      });

      const datos = await response.json();

      if (!response.ok) throw new Error(datos.error || "No se pudo agendar la cita");

      alReservarExitoso();
      alCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const obtenerManana = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-1">Agendar Turno Online</h4>
        <p className="text-xs text-gray-500 mb-4">Servicio seleccionado: <strong className="text-black">{servicio.nombre}</strong> ({parseFloat(servicio.precio).toFixed(2)}€)</p>

        <form onSubmit={registrarTurno} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Seleccionar Fecha</label>
            <input
              type="date"
              min={obtenerManana()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white cursor-pointer"
            />
          </div>

          {fecha && !error && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Horarios Disponibles</label>
              {horasDisponibles.length === 0 ? (
                <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">No quedan huecos libres para este día. Elige otra fecha.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                  {horasDisponibles.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHora(h)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                        hora === h 
                          ? "bg-black text-white border-black" 
                          : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-600 text-xs font-semibold bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {error}</p>}

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={alCerrar}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || !fecha || !hora}
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-gray-800 disabled:bg-gray-200 transition"
            >
              {cargando ? "Agendando..." : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

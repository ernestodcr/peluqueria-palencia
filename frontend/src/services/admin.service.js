const API_URL_CITAS = `${import.meta.env.VITE_API_URL}/api/citas`;
const API_URL_AUTH = `${import.meta.env.VITE_API_URL}/api/auth`;
const API_URL_SERVICIOS = `${import.meta.env.VITE_API_URL}/api/servicios`;

export const adminService = {
  obtenerAgendaGlobal: async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(API_URL_CITAS, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al cargar la agenda global.');
      return datos.citas || datos; 
    } catch (error) {
      console.error("Error en adminService.obtenerAgendaGlobal:", error);
      throw error;
    }
  },

  obtenerTodosLosClientes: async () => {
    try {
      const respuesta = await fetch(`${API_URL_AUTH}/usuarios/clientes`, {
        method: 'GET'
      });
      return await respuesta.json(); 
    } catch (error) {
      return { clientes: [] };
    }
  },

  darBajaCliente: async (id_usuario, motivo_baja) => {
    try {
      const respuesta = await fetch(`${API_URL_AUTH}/usuarios/baja/${id_usuario}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo_baja }) 
      });
      return await respuesta.json();
    } catch (error) {
      return { error: "No se pudo conectar con el servidor" };
    }
  },

  actualizarDatosCliente: async (id_usuario, datosActualizados) => {
    try {
      const respuesta = await fetch(`${API_URL_AUTH}/usuarios/baja/${id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });
      return await respuesta.json();
    } catch (error) {
      console.error("Error en adminService.actualizarDatosCliente:", error);
      throw error;
    }
  },

  obtenerTodosLosServicios: async () => {
    try {
      const respuesta = await fetch(API_URL_SERVICIOS, {
        method: 'GET'
      });
      return await respuesta.json();
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      return { servicios: [] };
    }
  },

  crearNuevoServicio: async (datosServicio) => {
    try {
      const respuesta = await fetch(API_URL_SERVICIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosServicio)
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al crear el servicio');
      return datos;
    } catch (error) {
      console.error("Error al crear servicio:", error);
      throw error;
    }
  },

  deshabilitarServicioCatalogo: async (id_servicio) => {
    try {
      const respuesta = await fetch(`${API_URL_SERVICIOS}/deshabilitar/${id_servicio}`, {
        method: 'PUT'
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al deshabilitar el servicio');
      return datos;
    } catch (error) {
      console.error("Error en deshabilitarServicioCatalogo:", error);
      throw error;
    }
  },

  cancelarCitaAgenda: async (id_cita, motivo_cancelacion) => {
    try {
      const respuesta = await fetch(`${API_URL_CITAS}/${id_cita}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo_cancelacion })
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al cancelar la cita.');
      return datos;
    } catch (error) {
      console.error("Error en adminService.cancelarCitaAgenda:", error);
      throw error;
    }
  },

  obtenerCitasDeUsuario: async (id_usuario) => {
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/usuario/${id_usuario}`, {
        method: 'GET'
      });
      const datos = await respuesta.json();
      return datos.citas || [];
    } catch (error) {
      console.error("Error al obtener las citas del usuario:", error);
      return [];
    }
  }

};

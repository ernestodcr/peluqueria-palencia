const API_URL_CITAS = `${import.meta.env.VITE_API_URL}/api/citas`;
const API_URL_AUTH = `${import.meta.env.VITE_API_URL}/api/auth`;

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
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL_AUTH}/usuarios/clientes`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al cargar los clientes.');
      return datos; 
    } catch (error) {
      console.error("Error en adminService.obtenerTodosLosClientes:", error);
      throw error;
    }
  },

  darBajaCliente: async (id_usuario, motivo_baja) => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${API_URL_AUTH}/usuarios/baja/${id_usuario}`, {
        method: 'PUT', // Método de modificación
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ motivo_baja })
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al tramitar la baja.');
      return datos;
    } catch (error) {
      console.error("Error en adminService.darBajaCliente:", error);
      throw error;
    }
  }
};

export const servicioService = {
  obtenerTodos: async () => {
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/servicios`, {
        method: 'GET'
      });
      const datos = await respuesta.json();
      return datos.servicios || datos;
    } catch (error) {
      console.error("Error en servicioService.obtenerTodos:", error);
      throw error;
    }
  },
  obtenerMisCitas: async (id_usuario) => {
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/usuario/${id_usuario}`, {
        method: 'GET'
      });
      const datos = await respuesta.json();
      return datos.citas || [];
    } catch (error) {
      console.error("Error en servicioService.obtenerMisCitas:", error);
      throw error;
    }
  }
};

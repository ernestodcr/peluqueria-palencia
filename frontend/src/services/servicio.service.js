const API_URL = `${import.meta.env.VITE_API_URL}/api/servicios`;

export const servicioService = {
  obtenerTodos: async () => {
    try {
      const respuesta = await fetch(API_URL);
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al traer los servicios');
      return datos.servicios; 
    } catch (error) {
      console.error("Error en servicioService.obtenerTodos:", error);
      throw error;
    }
  }
};

const API_URL_CITAS = `${import.meta.env.VITE_API_URL}/api/citas`;

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
  }
};

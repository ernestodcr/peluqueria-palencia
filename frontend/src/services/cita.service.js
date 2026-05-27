const API_URL = `${import.meta.env.VITE_API_URL}/api/citas`;

export const citaService = {
  crearCita: async (datosCita) => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(datosCita)
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo agendar la cita.');
      return datos;
    } catch (error) {
      console.error("Error en citaService.crearCita:", error);
      throw error;
    }
  }
};

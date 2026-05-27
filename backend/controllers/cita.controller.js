const pool = require("../db");

const crearCita = async (req, res) => {
    const { usuario_id, servicio_id, fecha_hora } = req.body

    if (!usuario_id || !servicio_id || !fecha_hora){
        return res.status(404).json({error: "FALTAN CAMPOS"});
    }

    try{
        const insertarCita = await pool.query(
            `INSERT INTO citas (usuario_id, servicio_id, fecha_hora)
            VALUES ($1, $2, $3)
            RETURNING id_cita, usuario_id, servicio_id, fecha_hora, estado`,
            [usuario_id, servicio_id, fecha_hora]
        );

        return res.status(201).json({
            mensaje: "Cita reservada con éxito",
            cita: insertarCita.rows[0]
        });

    }catch(error){
        console.error("Error en citas.controller.js en funcion crearCita", error);
        return res.status(500).json({error: "ERROR INTERNO DEL SERVIDOR"});
    }
}

const obtenerTodasCitas = async (req, res) => {
    try {
        // 🚀 SQL AVANZADO: Cruzamos las tablas de usuarios y servicios para extraer los nombres reales
        const resultado = await pool.query(
            `SELECT 
                c.id_cita, 
                c.fecha_hora, 
                c.estado,
                u.nombre AS cliente_nombre, 
                u.telefono AS cliente_telefono,
                s.nombre AS servicio_nombre,
                s.precio AS servicio_precio
             FROM citas c
             INNER JOIN usuarios u ON c.usuario_id = u.id_usuario
             INNER JOIN servicios s ON c.servicio_id = s.id_servicio`
        );

        return res.status(200).json({
            citas: resultado.rows
        });
    } catch (error) {
        console.error("Error en obtenerTodasCitas", error);
        return res.status(500).json({ error: "ERROR INTERNO DEL SERVIDOR" });
    }
};



module.exports = { crearCita, obtenerTodasCitas }
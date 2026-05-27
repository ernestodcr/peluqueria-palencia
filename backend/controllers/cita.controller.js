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

// OBTENER CITAS DE UN USUARIO ESPECÍFICO
const obtenerCitasPorUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT c.id_cita, c.fecha_hora, c.estado, s.nombre AS servicio_nombre, s.precio AS servicio_precio
             FROM citas c
             INNER JOIN servicios s ON c.servicio_id = s.id_servicio
             WHERE c.usuario_id = $1`,
            [id]
        );
        return res.status(200).json({ citas: resultado.rows });
    } catch (error) {
        console.error("Error en obtenerCitasPorUsuario", error);
        return res.status(500).json({ error: "ERROR INTERNO DEL SERVIDOR" });
    }
};

// CANCELAR / BORRAR UNA CITA
const cancelarCita = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM citas WHERE id_cita = $1', [id]);
        return res.status(200).json({ mensaje: "Cita eliminada correctamente" });
    } catch (error) {
        console.error("Error en cancelarCita", error);
        return res.status(500).json({ error: "ERROR INTERNO DEL SERVIDOR" });
    }
};

module.exports = { crearCita, obtenerTodasCitas, obtenerCitasPorUsuario, cancelarCita };

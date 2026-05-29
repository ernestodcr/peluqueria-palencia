const pool = require("../db");

const crearCita = async (req, res) => {
    const { usuario_id, servicio_id, fecha_hora } = req.body;
    if (!usuario_id || !servicio_id || !fecha_hora){
        return res.status(404).json({error: "FALTAN CAMPOS"});
    }
    try{
        const horarioOcupado = await pool.query(
            'SELECT * FROM citas WHERE fecha_hora = $1 AND estado != $2',
            [fecha_hora, 'cancelada']
        );
        if (horarioOcupado.rows.length > 0) {
            return res.status(400).json({ error: "Ese día y hora ya están reservados por otro cliente. Por favor, elige otro hueco." });
        }
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
};

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
                s.precio AS servicio_precio,
                s.duracion AS servicio_duracion
             FROM citas c
             INNER JOIN usuarios u ON c.usuario_id = u.id_usuario
             INNER JOIN servicios s ON c.servicio_id = s.id_servicio
             WHERE u.activo = TRUE`
        );
        return res.status(200).json({
            citas: resultado.rows
        });
    } catch (error) {
        console.error("Error en obtenerTodasCitas", error);
        return res.status(500).json({ error: "ERROR INTERNO DEL SERVIDOR" });
    }
};

const obtenerCitasPorUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT 
                c.id_cita, 
                c.fecha_hora, 
                c.estado, 
                s.nombre AS servicio_nombre, 
                s.precio AS servicio_precio,
                s.duracion AS servicio_duracion
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


const cancelarCita = async (req, res) => {
    const { id } = req.params;
    const { motivo_cancelacion } = req.body;
    if (!motivo_cancelacion) {
        return res.status(400).json({ error: "Es obligatorio indicar el motivo de la cancelación" });
    }
    try {
        const resultado = await pool.query(
            `UPDATE citas 
             SET estado = 'cancelada', motivo_cancelacion = $1 
             WHERE id_cita = $2 
             RETURNING id_cita, estado, motivo_cancelacion`, 
            [motivo_cancelacion, id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }
        return res.status(200).json({ mensaje: "Cita cancelada correctamente" });
    } catch (error) {
        console.error("Error en cancelarCita", error);
        return res.status(500).json({ error: "ERROR INTERNO DEL SERVIDOR" });
    }
};

module.exports = { crearCita, obtenerTodasCitas, obtenerCitasPorUsuario, cancelarCita };

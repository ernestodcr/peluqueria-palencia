const pool = require("../db");

const crearServicio = async (req,res) => {
    const { nombre, descripcion, tipo, precio, duracion } = req.body;

    // Validar que los campos obligatorios no estén vacíos
    if (!nombre || !tipo || !precio || !duracion) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try{
        const nuevoServicio = await pool.query(
            `INSERT INTO servicios (nombre, descripcion, tipo, precio, duracion) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_servicio, nombre, precio, duracion`,
            [nombre, descripcion, tipo, precio, duracion]
        );

        return res.status(200).json({
            mensaje:"Servicio creado con exito",
            servicio: nuevoServicio.rows[0]
        });


    }catch(error) {
        console.error("Error en servicio.controller.js " , error);
        return res.status(500).json({ error: "ERROR" });
    }
};

const obtenerServicios = async (req, res) => {
    try{
        const resultado = await pool.query('SELECT * FROM servicios WHERE activo = TRUE');

        return res.status(200).json({
            servicios: resultado.rows
        });

    }catch(error) {
        console.error("Error en servicio.controller.js en la funcion obtenerServicios" , error);
        return res.status(500).json({ error: "ERROR" }); 
    }
}

module.exports = {crearServicio, obtenerServicios};


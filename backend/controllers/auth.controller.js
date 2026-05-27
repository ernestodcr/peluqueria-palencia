const pool = require("../db");
const bcript = require("bcryptjs"); //ENCRIPTAR CONSTRASEÑA
const jwt = require("jsonwebtoken");

const registrarUsuario = async (req, res) => {
    //OBTENER DATOS TABLA USUARIOS
    const { nombre, email, telefono, genero, password } = req.body;
    //VALIDAR
    if (!nombre || !email || !telefono || !password) {
        return res.status(404).json({error: "Faltan campos obligatorios"})
    }

    try{
        const existeUsuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
        if (existeUsuario.rows.length > 0) {
            return res.status(404).json({error: "El email ya esta registrado"})
        }

        //ENCRIPTAR CONTRASEÑA
        const salt = await bcript.genSalt(10);
        const passwordEncriptada = await bcript.hash(password,salt);

        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, email, telefono, genero, password) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, email`,
            [nombre, email, telefono, genero, passwordEncriptada]
        );

        return res.status(200).json({
            mensaje:"Usuario registrado con éxito",
            usuarios: nuevoUsuario.rows[0]
        });
    } catch (error) {
        console.error("Error en el regustro: " , error);
        return res.status(500).json({error: "Error interno del servidor"})
    }
};

const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({error: "Faltan campos obligatorios"})
    }

    try{
        //SI EXISTE EMAIL
        const usuarioExiste = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({error: "Credenciales incorrectas"})
        }

        const usuario = usuarioExiste.rows[0];
        //COMPARAR CONTRASEÑA CON LA ENCRIPTADA
        const passwordCorrecta = await bcript.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: "Credenciales incorrectas"});
        }

        // Crear el Token de seguridad (JWT) para el Frontend
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, rol:usuario.rol },
            process.env.DATABASE_URL,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    
    }catch(error) {
        console.error("ERROR REAL EN EL LOGIN: ", error);
        return res.status(500).json({error: "Error interno del servidor"});
    }
}

//EXPORTAR PARA RUTA PUEDA USARLO
module.exports = { registrarUsuario, loginUsuario };

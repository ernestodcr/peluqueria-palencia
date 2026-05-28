const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
        return res.status(403).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        const partes = bearerHeader.split(" ");
        const tokenLimpio = partes[1]; 
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        req.usuario = verificado;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};


const esAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== "admin") {
        return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de Administrador." });
    }
    next();
};

module.exports = { verificarToken, esAdmin };

const express = require("express");
const router = express.Router();

//TRAEMOS LA ACCION DE controllers/auth.controller.js
const { registrarUsuario, loginUsuario, darBajaUsuario, obtenerClientes } = require("../controllers/auth.controller");

//TRAEMOS LA ACCION DE middlewares/auth.middleware.js
const { verificarToken, esAdmin } = require("../middlewares/auth.middleware");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

router.get("/usuarios/clientes", verificarToken, esAdmin, obtenerClientes);
router.put("/usuarios/baja/:id", verificarToken, esAdmin, darBajaUsuario);

module.exports = router;
const express = require("express");
const router = express.Router();

//TRAEMOS LA ACCION DE auth.controller.js
const { registrarUsuario, loginUsuario, darBajaUsuario, obtenerClientes } = require("../controllers/auth.controller");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.put("/usuarios/baja/:id", darBajaUsuario);
router.get("/usuarios/clientes", obtenerClientes);

module.exports = router;
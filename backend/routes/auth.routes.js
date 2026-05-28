const express = require("express");
const router = express.Router();

const { registrarUsuario, loginUsuario, darBajaUsuario, obtenerClientes } = require("../controllers/auth.controller");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

router.get("/usuarios/clientes", obtenerClientes);
router.put("/usuarios/baja/:id", darBajaUsuario);

module.exports = router;

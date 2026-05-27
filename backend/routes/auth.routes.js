const express = require("express");
const router = express.Router();

//TRAEMOS LA ACCION DE auth.controller.js
const { registrarUsuario, loginUsuario } = require("../controllers/auth.controller");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

module.exports = router;
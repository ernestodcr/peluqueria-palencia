const express = require("express");
const router = express.Router();

// 1. Importamos también la nueva función del controlador
const { crearCita, obtenerTodasCitas } = require("../controllers/cita.controller");

router.post("/", crearCita);

// 2. 🚀 Añadimos la ruta GET para que el administrador pueda listar la agenda
router.get("/", obtenerTodasCitas);

module.exports = router;

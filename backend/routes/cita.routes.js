const express = require("express");
const router = express.Router();

const { 
  crearCita, 
  obtenerTodasCitas, 
  obtenerCitasPorUsuario, 
  cancelarCita 
} = require("../controllers/cita.controller");

router.post("/", crearCita);
router.get("/", obtenerTodasCitas);
router.get("/usuario/:id", obtenerCitasPorUsuario);
router.put("/:id", cancelarCita);

module.exports = router;

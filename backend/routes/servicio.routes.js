const express = require("express");
const router = express.Router();
const { crearServicio, obtenerServicios, deshabilitarServicio } = require("../controllers/servicio.controller");

router.post("/", crearServicio);
router.get("/", obtenerServicios);
router.put("/deshabilitar/:id", deshabilitarServicio);

module.exports = router;

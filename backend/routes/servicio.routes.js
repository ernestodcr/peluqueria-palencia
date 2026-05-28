const express = require("express");
const router = express.Router();

const { crearServicio, obtenerServicios, deshabilitarServicio } = require("../controllers/servicio.controller");

//POST: MANDAR
router.post("/", crearServicio);

//GET: RECIBIR
router.get("/", obtenerServicios);

//PUT: MODIICAR
router.put("/deshabilitar/:id", deshabilitarServicio);

module.exports = router;
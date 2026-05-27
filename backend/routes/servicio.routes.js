const express = require("express");
const router = express.Router();

const { crearServicio, obtenerServicios } = require("../controllers/servicio.controller");

//POST: MANDAR 
router.post("/", crearServicio);

//GET: RECIBIR
router.get("/", obtenerServicios);

module.exports = router;
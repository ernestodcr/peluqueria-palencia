const express = require("express");
const router = express.Router();

const { crearCita } = require("../controllers/cita.controller");

router.post("/", crearCita);

module.exports = router;
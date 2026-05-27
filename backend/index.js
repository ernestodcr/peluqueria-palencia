const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/auth.routes");
const servicioRoutes  = require("./routes/servicio.routes");
const citaRoutes = require("./routes/cita.routes");

// Midldlewares
app.use(cors());
app.use(express.json())

app.use("/api/auth", authRoutes);

app.use("/api/servicios", servicioRoutes);

app.use("/api/citas", citaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor encendido en el puerto ${PORT}`)
})

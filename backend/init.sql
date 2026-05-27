CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'cliente',
    password VARCHAR(250) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    motivo_baja VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(250),
    tipo VARCHAR(20) NOT NULL,
    precio DECIMAL(5,2) NOT NULL,
    duracion INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS citas (
    id_cita SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id_usuario),
    servicio_id INT REFERENCES servicios(id_servicio),
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    motivo_cancelacion VARCHAR(250),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
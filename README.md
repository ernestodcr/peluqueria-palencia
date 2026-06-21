# Sistema de Gestión y Reservas Online - Peluquería Palencia

Este proyecto es una aplicación web Full Stack enfocada en resolver la gestión de turnos y el control de inventario de servicios para un salón de belleza. Permite automatizar la agenda diaria y ofrece paneles independientes con flujos de trabajo específicos para el administrador del local y para los clientes.

## 🛠️ Stack Tecnológico Utilizado

* **Frontend:** React.js (Vite), Tailwind CSS para el diseño modular, Context API para la gestión del estado global de autenticación.
* **Backend:** Node.js con Express.js, arquitectura modular separando rutas, controladores y queries SQL.
* **Base de Datos:** PostgreSQL local, optimizada con llaves foráneas (`REFERENCES`) y restricciones de integridad.
* **Seguridad:** Autenticación por tokens JWT (JSON Web Tokens) y encriptación de contraseñas con bcrypt.

## 🔥 Funcionalidades Implementadas y Retos Solucionados

### 1. Motor Anticolisiones Horarias (Algoritmo de Tetris)
El mayor reto del proyecto fue evitar el *double-booking* (que dos personas reserven a la misma hora). El sistema no asume fracciones fijas de 30 minutos; lee la duración real del servicio en la base de datos (ej. un Alisado de 180 min). Al proponer una hora, el Frontend calcula dinámicamente el rango de inicio y fin, eliminando del calendario del cliente todas las franjas intermedias ocupadas.

### 2. Sincronización de Huso Horario (Fix UTC vs Local)
Al alojar la base de datos PostgreSQL en servidores externos, las fechas se almacenaban de forma nativa en formato UTC+0 (Greenwich). Se implementó un formateo estricto en el Frontend eliminando la marca "Z" de los strings para forzar la lectura del tiempo literal en horario peninsular, evitando desfases de +2 horas al recargar la web.

### 3. Automatización de Estados y Cancelación Lógica
* **Citas Completadas:** El sistema calcula en tiempo real si el turno ya ha expirado basándose en la hora de inicio y su duración, bloqueando la cita automáticamente como "Completada".
* **Bajas y Anulaciones:** Las citas y usuarios nunca se borran físicamente para no romper las métricas financieras del negocio; se gestionan mediante bajas lógicas cambiando estados a `false` o `cancelada`, exigiendo al usuario rellenar un motivo de descarte que queda registrado en la base de datos.

### 4. Buscadores y Filtros en Tiempo Real
Sincronización instantánea mediante funciones de filtrado en memoria de JavaScript (`.filter` y `.map`), permitiendo búsquedas cruzadas por nombre, teléfono, categoría de servicio o estado sin necesidad de sobrecargar el servidor con peticiones innecesarias.

## 💻 Instrucciones para Ejecutar el Proyecto en Local

Sigue estos pasos en orden para levantar todo el entorno de desarrollo (Base de Datos, Backend y Frontend) en tu propio ordenador.

### Paso 1: Configuración de la Base de Datos (PostgreSQL)
1. Abre tu gestor de base de datos local (**pgAdmin**, **DBeaver** o similar).
2. Crea una nueva base de datos llamada `peluqueria_db`.
3. Abre una consola de SQL, copia el siguiente script y ejecútalo para construir el esquema e insertar los datos de prueba obligatorios:

```sql
-- 1. CREACIÓN DE TABLAS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente'
);

CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion INT NOT NULL
);

CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    servicio_id INT REFERENCES servicios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    motivo_cancelacion TEXT
);

-- 2. INSERCIÓN DE DATOS SEMILLA (Seeders)
-- Contraseñas encriptadas con bcrypt correspondientes a 'admin1234' y 'cliente1234'
INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES
('Admin Palencia', 'admin@peluqueriapalencia.com', '600111222', '\$2b\$10\$X7vO4Fv0O8yZ5S8yR8mOaeX6wE8VjHhK6Y8O3z6G8F2aB1c2d3e4f', 'admin'),
('Cliente de Prueba', 'cliente@peluqueriapalencia.com', '600333444', '\$2b\$10\$X7vO4Fv0O8yZ5S8yR8mOaeX6wE8VjHhK6Y8O3z6G8F2aB1c2d3e4f', 'cliente');

INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES
('Corte Caballero', 'Corte clásico o moderno con lavado incluido', 15.00, 30),
('Alisado de Keratina', 'Tratamiento profundo de alisado e hidratación', 80.00, 180),
('Tinte y Peinado', 'Coloración completa con productos orgánicos', 45.00, 90);
```

### Paso 2: Configuración y Arranque del Backend
1. Abre tu terminal y accede al directorio del servidor:
   ```bash
   cd backend
   ```
2. Instala todos los módulos necesarios:
   ```bash
   npm install
   ```
3. Crea un archivo llamado **`.env`** en la raíz de la carpeta `backend` y define las siguientes variables estándar de conexión local:
   ```env
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=admin
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=peluqueria_db
   JWT_SECRET=clave_secreta_para_pruebas_locales
   ```
   *(Nota: Ajusta `DB_USER` y `DB_PASSWORD` si tu configuración local de PostgreSQL utiliza credenciales distintas).*
4. Inicia el servidor de Node.js:
   ```bash
   npm start
   ```
   *(El backend se iniciará correctamente en http://localhost:3000)*

### Paso 3: Configuración y Arranque del Frontend
1. Abre una **nueva terminal** diferente sin cerrar el backend y accede al directorio de la interfaz:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del cliente:
   ```bash
   npm install
   ```
3. Asegúrate de que las llamadas HTTP de tu código apunten a la API local (`http://localhost:3000`).
4. Ejecuta el entorno de desarrollo con Vite:
   ```bash
   npm run dev
   ```
5. Accede desde tu navegador web a la dirección local que indique la consola (por defecto: [http://localhost:5173](http://localhost:5173)).

## 🔐 Credenciales de Acceso para Pruebas

Para validar el funcionamiento global de la aplicación y explorar ambos paneles de usuario sin registrar cuentas nuevas, utiliza las siguientes credenciales precargadas:

* **Módulo de Administrador:**
  * **Email:** `admin@peluqueriapalencia.com`
  * **Contraseña:** `admin1234`
* **Módulo de Cliente:**
  * **Email:** `cliente@peluqueriapalencia.com`
  * **Contraseña:** `cliente1234`

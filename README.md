# Sistema de Gestión y Reservas Online - Peluquería Palencia

Este proyecto es una aplicación web Full Stack enfocada en resolver la gestión de turnos y el control de inventario de servicios para un salón de belleza. Permite automatizar la agenda diaria y ofrece paneles independientes con flujos de trabajo específicos para el administrador del local y para los clientes.

## 🛠️ Stack Tecnológico Utilizado

* **Frontend:** React.js (Vite), Tailwind CSS para el diseño modular, Context API para la gestión del estado global de autenticación.
* **Backend:** Node.js con Express.js, arquitectura modular separando rutas, controladores y queries SQL.
* **Base de Datos:** PostgreSQL en la nube, optimizada con llaves foráneas (`REFERENCES`) y restricciones de integridad.
* **Seguridad:** Autenticación por tokens JWT (JSON Web Tokens).

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

Dado que el **Backend y la Base de Datos ya están desplegados y funcionando en la nube (Render)**, solo necesitas encender el entorno visual en tu máquina.

1. Descarga o clona este repositorio en tu ordenador.
2. Abre la terminal dentro de la raíz del proyecto.
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```
5. Abre en tu navegador el enlace local que te devuelva la terminal (habitualmente `http://localhost:5173`).

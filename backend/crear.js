require("dotenv").config();
const pool = require('./db');
const fs = require('fs');

const planoSql = fs.readFileSync('./init.sql', 'utf-8');

pool.query(planoSql, (err, res) => {
    if (err) {
        console.log('Error al crear las tablas:', err);
    } else {
        console.log('¡Tablas creadas con éxito en Render!');
    }
    pool.end();
});

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const autenticacionRutas = require('./rutas/autenticacion.rutas');
const usuariosRutas = require('./rutas/usuarios.rutas');

const app = express();

/**
 * Configuración de middleware base y seguridad
 */
app.use(helmet()); // Protege la aplicación configurando varias cabeceras HTTP
app.use(cors());   // Habilita el intercambio de recursos de origen cruzado
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/recursos', express.static(path.join(__dirname, 'recursos')));


/**
 * Definición de los puntos de entrada (endpoints) de la API
 */
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/usuarios', usuariosRutas);

/**
 * Manejo de errores
 */

// Capturar error 404 y enviarlo al manejador de errores global
app.use((req, res, next) => {
  next(createError(404, 'El recurso solicitado no existe en el servidor.'));
});

// Manejador de errores estandarizado para respuestas en formato JSON
app.use((err, req, res, next) => {
  const estado = err.status || 500;
  const mensaje = err.message || 'Ocurrió un error inesperado en el servidor.';
  
  // En desarrollo mostramos el stacktrace completo para depuración
  const esDesarrollo = req.app.get('env') === 'development';
  
  if (estado === 500) {
    console.error(`[Error 500]: ${err.stack}`);
  }

  res.status(estado).json({
    exito: false,
    mensaje,
    error: esDesarrollo ? err : {}
  });
});

module.exports = app;

const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

/**
 * Rutas para la gestión de usuarios
 */

// Ejemplo de ruta protegida por token y rol de administrador
router.get('/', autenticacion, autorizacion(['Administrador']), (req, res) => {
  res.json({ 
    exito: true, 
    mensaje: 'Listado de usuarios (solo accesible por Administradores)' 
  });
});

module.exports = router;

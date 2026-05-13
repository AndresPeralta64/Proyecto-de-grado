const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

const { obtenerPerfil, actualizarPerfil } = require('../controladores/controlador_usuario');
const subida = require('../intermediarios/subida_archivo');

/**
 * Rutas para la gestión de usuarios
 */

// Obtener perfil del usuario autenticado
router.get('/perfil', autenticacion, obtenerPerfil);

// Actualizar perfil del usuario autenticado (con soporte para imagen)
router.put('/perfil', [autenticacion, subida.single('foto')], actualizarPerfil);

// Ejemplo de ruta protegida por token y rol de administrador
router.get('/', autenticacion, autorizacion(['Administrador']), (req, res) => {
  res.json({ 
    exito: true, 
    mensaje: 'Listado de usuarios (solo accesible por Administradores)' 
  });
});

module.exports = router;

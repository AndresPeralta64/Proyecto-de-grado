const express = require('express');
const router = express.Router();
const {
  iniciarSesion,
  verificarCorreo,
  solicitarRestablecimiento,
  confirmarRestablecimiento
} = require('../controladores/controlador_autenticacion');

/**
 * Rutas destinadas a la gestión de autenticación y sesiones
 */

// Endpoint para el inicio de sesión
router.post('/login', iniciarSesion);

// Endpoint para verificar existencia de correo (Experiencia de usuario HU-001)
router.post('/verificar-correo', verificarCorreo);

/**
 * Rutas para el restablecimiento de contraseña
 */
router.post('/solicitar-restablecimiento', solicitarRestablecimiento);
router.post('/confirmar-restablecimiento', confirmarRestablecimiento);

module.exports = router;

const express = require('express');
const router = express.Router();
const { verificarInsigniaPublica } = require('../controladores/controlador_verificacion');

// Endpoint de verificación pública (sin autenticación requerida)
router.get('/:uuid', verificarInsigniaPublica);

module.exports = router;

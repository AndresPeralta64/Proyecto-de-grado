const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

const {
  emitirInsignia,
  listarHistorialEmisiones,
  revocarInsignia
} = require('../controladores/controlador_insignia');

// Proteger todas las rutas de este módulo
router.use(autenticacion);
router.use(autorizacion(['Administrador', 'Emisor']));

// Emitir insignias a receptores
router.post('/emitir', emitirInsignia);

// Consultar historial de insignias emitidas
router.get('/historial', listarHistorialEmisiones);

// Revocar una insignia emitida
router.post('/revocar', revocarInsignia);

module.exports = router;

const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

const {
  listarMicrocredenciales,
  aprobarMicrocredencial,
  cambiarEstado,
  eliminarMicrocredencial
} = require('../controladores/controlador_microcredencial');

// Todas las rutas requieren autenticación
router.use(autenticacion);

// Obtener listado completo de microcredenciales (Administrador y Emisor)
router.get('/', autorizacion(['Administrador', 'Emisor']), listarMicrocredenciales);

// Aprobar una microcredencial pendiente (Solo Administrador)
router.patch('/:id/aprobar', autorizacion(['Administrador']), aprobarMicrocredencial);

// Cambiar el estado de una microcredencial (Administrador y Emisor)
router.put('/:id/estado', autorizacion(['Administrador', 'Emisor']), cambiarEstado);

// Eliminar una microcredencial (Administrador y Emisor)
router.delete('/:id', autorizacion(['Administrador', 'Emisor']), eliminarMicrocredencial);

module.exports = router;

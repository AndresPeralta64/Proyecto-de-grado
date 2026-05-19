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

// Todas las rutas requieren autenticación y rol de Administrador
router.use(autenticacion);
router.use(autorizacion(['Administrador']));

// Obtener listado completo de microcredenciales
router.get('/', listarMicrocredenciales);

// Aprobar una microcredencial pendiente
router.patch('/:id/aprobar', aprobarMicrocredencial);

// Cambiar el estado de una microcredencial
router.put('/:id/estado', cambiarEstado);

// Eliminar una microcredencial (eliminado lógico)
router.delete('/:id', eliminarMicrocredencial);

module.exports = router;

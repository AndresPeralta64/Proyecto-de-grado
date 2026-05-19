const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

const {
  listarMicrocredenciales,
  aprobarMicrocredencial,
  cambiarEstado,
  eliminarMicrocredencial,
  crearMicrocredencial,
  obtenerCatalogos
} = require('../controladores/controlador_microcredencial');
const subidaInsignia = require('../intermediarios/subida_insignia');

// Todas las rutas requieren autenticación y rol de Administrador o Emisor
router.use(autenticacion);
router.use(autorizacion(['Administrador', 'Emisor']));

// Obtener listado completo de microcredenciales
router.get('/', listarMicrocredenciales);

// Obtener catálogos para el formulario de creación (niveles y áreas de conocimiento)
router.get('/catalogos', obtenerCatalogos);

// Registrar una nueva microcredencial
router.post('/', subidaInsignia.single('imagen'), crearMicrocredencial);

// Aprobar una microcredencial pendiente
router.patch('/:id/aprobar', aprobarMicrocredencial);

// Cambiar el estado de una microcredencial
router.put('/:id/estado', cambiarEstado);

// Eliminar una microcredencial (eliminado lógico)
router.delete('/:id', eliminarMicrocredencial);

module.exports = router;

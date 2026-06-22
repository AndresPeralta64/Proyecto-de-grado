const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');
const {
  obtenerEstadisticasAdministrador,
  obtenerEstadisticasEmisor,
  obtenerEstadisticasReceptor
} = require('../controladores/controlador_estadisticas');

// Todas las rutas requieren autenticación
router.use(autenticacion);

// Estadísticas para Administrador
router.get('/administrador', autorizacion(['Administrador']), obtenerEstadisticasAdministrador);

// Estadísticas para Emisor
router.get('/emisor', autorizacion(['Emisor']), obtenerEstadisticasEmisor);

// Estadísticas para Receptor
router.get('/receptor', autorizacion(['Receptor']), obtenerEstadisticasReceptor);

module.exports = router;

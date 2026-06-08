const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');
const controladorInsignias = require('../controladores/controlador_insignias');

// Todas las rutas requieren autenticación
router.use(autenticacion);

// Emisión de insignias
router.post('/emitir', autorizacion(['Emisor']), controladorInsignias.emitirInsignias);

// Historial (ya existía una referencia en el frontend)
router.get('/historial', autorizacion(['Emisor', 'Administrador']), controladorInsignias.obtenerHistorial);

// Historial general para Administrador
router.get('/historial-general', autorizacion(['Administrador']), controladorInsignias.obtenerHistorialGeneral);

// Revocación
router.post('/revocar/:idInsignia', autorizacion(['Emisor']), controladorInsignias.revocarInsignia);

// Receptores que ya tienen la insignia
router.get('/receptores-con-insignia/:idMicrocredencial', autorizacion(['Emisor', 'Administrador']), controladorInsignias.obtenerReceptoresConInsignia);

// Historial para Receptor
router.get('/historial-receptor', autorizacion(['Receptor']), controladorInsignias.obtenerHistorialReceptor);

module.exports = router;

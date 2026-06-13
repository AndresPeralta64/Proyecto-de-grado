const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');
const controladorPerfil = require('../controladores/controlador_perfil');

// Todas las rutas requieren autenticación
router.use(autenticacion);

router.get('/mi-perfil', autorizacion(['Receptor']), controladorPerfil.obtenerMiPerfil);
router.post('/guardar', autorizacion(['Receptor']), controladorPerfil.guardarConfiguracionPerfil);

module.exports = router;

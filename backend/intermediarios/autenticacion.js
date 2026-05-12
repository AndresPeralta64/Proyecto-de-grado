const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Intermediario para validar el token JWT en las peticiones
 */
const validarToken = (req, res, next) => {
  // Obtener el token del encabezado Authorization (formato: Bearer TOKEN)
  const cabeceraAutorizacion = req.headers['authorization'];
  const token = cabeceraAutorizacion && cabeceraAutorizacion.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      exito: false,
      mensaje: 'Acceso denegado. Inicie sesión para continuar.' 
    });
  }

  try {
    // Verificar la autenticidad del token usando la clave secreta
    const datosToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adjuntar los datos del usuario a la petición para uso posterior
    req.usuario = datosToken;
    next();
  } catch (error) {
    return res.status(403).json({ 
      exito: false,
      mensaje: 'Token inválido o sesión expirada.' 
    });
  }
};

module.exports = validarToken;

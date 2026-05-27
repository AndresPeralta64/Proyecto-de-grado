/**
 * Intermediario para restringir el acceso según el rol del usuario
 * @param {Array<string>} rolesAutorizados - Arreglo de nombres de roles con permiso
 */
const verificarRoles = (rolesAutorizados) => {
  return (req, res, next) => {
    // Se asume que el objeto req.usuario ya fue inyectado por el intermediario de autenticación
    if (!req.usuario) {
      return res.status(500).json({ 
        exito: false,
        mensaje: 'Error interno: No se pudo verificar el perfil del usuario.' 
      });
    }

    const userRoles = req.usuario.roles || [req.usuario.nombre_rol];
    const tienePermiso = userRoles.some(rol => rolesAutorizados.includes(rol));

    if (tienePermiso) {
      next();
    } else {
      return res.status(403).json({ 
        exito: false,
        mensaje: 'Acceso denegado: Su perfil no cuenta con los permisos necesarios.' 
      });
    }
  };
};

module.exports = verificarRoles;

const express = require('express');
const router = express.Router();
const autenticacion = require('../intermediarios/autenticacion');
const autorizacion = require('../intermediarios/autorizacion');

const { obtenerPerfil, actualizarPerfil, cambiarContrasenia, registrarUsuario, eliminarFotoPerfil, actualizarUsuario } = require('../controladores/controlador_usuario');
const subida = require('../intermediarios/subida_archivo');
const { consultar } = require('../servicios/base_datos');

/**
 * Rutas para la gestión de usuarios
 */

// Obtener perfil del usuario autenticado
router.get('/perfil', autenticacion, obtenerPerfil);

// Actualizar perfil del usuario autenticado (con soporte para imagen)
router.put('/perfil', [autenticacion, subida.single('foto')], actualizarPerfil);

// Cambiar contraseña del usuario autenticado
router.put('/cambiar-contrasenia', autenticacion, cambiarContrasenia);

// Eliminar foto de perfil del usuario autenticado
router.delete('/perfil/foto', autenticacion, eliminarFotoPerfil);

// Obtener lista de carreras para el dropdown
router.get('/carreras', autenticacion, async (req, res) => {
  try {
    const resultado = await consultar('SELECT id_carrera, nombre FROM carrera ORDER BY nombre ASC', []);
    return res.status(200).json({ exito: true, datos: resultado.rows });
  } catch (error) {
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las carreras.' });
  }
});

// Registrar nuevo usuario (solo Administradores)
router.post('/', [autenticacion, autorizacion(['Administrador']), subida.single('foto')], registrarUsuario);

// Actualizar usuario (solo Administradores)
router.put('/:id', [autenticacion, autorizacion(['Administrador']), subida.single('foto')], actualizarUsuario);



// Listado de usuarios (solo Administradores)
router.get('/', autenticacion, autorizacion(['Administrador']), async (req, res) => {
  try {
    const consulta = `
      SELECT u.id_usuario, u.cedula, u.nombres, u.apellidos, u.correo, u.telefono, u.activo,
             u.carrera AS id_carrera, c.nombre AS carrera_nombre, u.foto_url,

             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT('id_rol', r.id_rol, 'nombre', r.nombre)
               ) FILTER (WHERE r.id_rol IS NOT NULL),
               '[]'
             ) AS roles
      FROM usuario u
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      LEFT JOIN rol r ON ur.rol = r.id_rol
      GROUP BY u.id_usuario, c.id_carrera, c.nombre
      ORDER BY u.id_usuario ASC
    `;
    const resultado = await consultar(consulta, []);
    return res.status(200).json({
      exito: true,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener listado de usuarios:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener el listado de usuarios.' });
  }
});


// Inactivar/Eliminar usuario (solo Administradores)
router.delete('/:id', autenticacion, autorizacion(['Administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = 'UPDATE usuario SET activo = false WHERE id_usuario = $1';
    await consultar(consulta, [id]);
    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario eliminado correctamente.'
    });
  } catch (error) {
    console.error('Error al inactivar usuario:', error.message);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al inactivar el usuario.'
    });
  }
});

// Activar usuario (solo Administradores)
router.patch('/:id/activar', autenticacion, autorizacion(['Administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = 'UPDATE usuario SET activo = true WHERE id_usuario = $1';
    await consultar(consulta, [id]);
    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario activado correctamente.'
    });
  } catch (error) {
    console.error('Error al activar usuario:', error.message);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al activar el usuario.'
    });
  }
});

// Eliminar definitivamente (solo Administradores)
router.delete('/:id/permanente', autenticacion, autorizacion(['Administrador']), async (req, res) => {
  const { id } = req.params;
  try {
    await consultar('BEGIN');
    // 1. Eliminar asociación de roles
    await consultar('DELETE FROM usuario_rol WHERE usuario = $1', [id]);
    // 2. Eliminar tokens de verificación si existen
    await consultar('DELETE FROM token_verificacion WHERE usuario = $1', [id]);
    // 3. Eliminar usuario físicamente
    await consultar('DELETE FROM usuario WHERE id_usuario = $1', [id]);
    await consultar('COMMIT');
    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario eliminado definitivamente.'
    });
  } catch (error) {
    await consultar('ROLLBACK');
    console.error('Error al eliminar definitivamente usuario:', error.message);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar definitivamente al usuario.'
    });
  }
});

module.exports = router;

const { consultar } = require('../servicios/base_datos');
const bcrypt = require('bcryptjs');

/**
 * Obtiene el perfil completo del usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;

    const consulta = `
      SELECT u.id_usuario, u.cedula, u.nombres, u.apellidos, u.correo, u.carrera, u.telefono, u.foto_url, r.nombre as nombre_rol
      FROM usuario u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      LEFT JOIN rol r ON ur.rol = r.id_rol
      WHERE u.id_usuario = $1
    `;

    const resultado = await consultar(consulta, [idUsuario]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    const usuario = resultado.rows[0];
    // Limpiar espacios en blanco del char(10) de la BD
    if (usuario.telefono) usuario.telefono = usuario.telefono.trim();

    return res.status(200).json({
      exito: true,
      datos: usuario
    });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener los datos del perfil.' });
  }
};

const path = require('path');
const fs = require('fs');

/**
 * Actualiza los datos del perfil del usuario (incluyendo la foto)
 */
const actualizarPerfil = async (req, res) => {
  const { telefono } = req.body; // Nombres y apellidos ahora están bloqueados
  const idUsuario = req.usuario.id;
  let fotoUrl = null;

  try {
    // Si se subió una nueva foto
    if (req.file) {
      // Obtener el usuario actual para borrar la foto anterior si existe
      const consultaActual = 'SELECT foto_url FROM usuario WHERE id_usuario = $1';
      const resultadoActual = await consultar(consultaActual, [idUsuario]);
      
      if (resultadoActual.rows.length > 0 && resultadoActual.rows[0].foto_url) {
        const rutaAntigua = path.join(__dirname, '../', resultadoActual.rows[0].foto_url.replace(process.env.URL_BACKEND || 'http://localhost:3000', ''));
        if (fs.existsSync(rutaAntigua)) {
          fs.unlinkSync(rutaAntigua); // Borrar foto anterior
        }
      }

      // La URL de la foto será accesible públicamente
      const puerto = process.env.PORT || 3000;
      const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;
      fotoUrl = `${host}/recursos/perfiles/${req.file.filename}`;
    }

    // Construir la consulta dinámicamente
    let consulta;
    let valores;

    if (fotoUrl) {
      consulta = `
        UPDATE usuario 
        SET telefono = $1, foto_url = $2
        WHERE id_usuario = $3
        RETURNING id_usuario, nombres, apellidos, telefono, foto_url
      `;
      valores = [telefono, fotoUrl, idUsuario];
    } else {
      consulta = `
        UPDATE usuario 
        SET telefono = $1
        WHERE id_usuario = $2
        RETURNING id_usuario, nombres, apellidos, telefono, foto_url
      `;
      valores = [telefono, idUsuario];
    }

    const resultado = await consultar(consulta, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'No se pudo actualizar el perfil.' });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Perfil actualizado exitosamente.',
      datos: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error en actualizarPerfil:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar el perfil.' });
  }
};

const cambiarContrasenia = async (req, res) => {
  const { nuevaContrasenia } = req.body;
  const idUsuario = req.usuario.id;

  try {
    if (!nuevaContrasenia) {
      return res.status(400).json({ exito: false, mensaje: 'La nueva contraseña es obligatoria.' });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(nuevaContrasenia, salt);

    const consulta = 'UPDATE usuario SET contrasenia = $1 WHERE id_usuario = $2';
    await consultar(consulta, [contrasenaHash, idUsuario]);

    return res.status(200).json({
      exito: true,
      mensaje: 'Contraseña actualizada exitosamente.'
    });
  } catch (error) {
    console.error('Error en cambiarContrasenia:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar la contraseña.' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasenia
};

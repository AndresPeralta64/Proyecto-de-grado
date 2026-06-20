const { consultar } = require('../servicios/base_datos');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

/**
 * Obtiene el perfil completo del usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;

    const consulta = `
      SELECT u.id_usuario, u.cedula, u.nombres, u.apellidos, u.correo, c.nombre as carrera, c.id_carrera, u.telefono, u.foto_url, r.nombre as nombre_rol
      FROM usuario u
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
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

/**
 * Actualiza los datos del perfil del usuario (incluyendo la foto)
 */
const actualizarPerfil = async (req, res) => {
  const { telefono, id_carrera } = req.body;
  const idUsuario = req.usuario.id;
  let fotoUrl = null;

  try {
    if (req.file) {
      const consultaActual = 'SELECT foto_url FROM usuario WHERE id_usuario = $1';
      const resultadoActual = await consultar(consultaActual, [idUsuario]);
      
      if (resultadoActual.rows.length > 0 && resultadoActual.rows[0].foto_url) {
        const fotoUrlActual = resultadoActual.rows[0].foto_url;
        const baseUrl = process.env.URL_BACKEND || 'http://localhost:3000';
        const rutaRelativa = fotoUrlActual.replace(baseUrl, '').replace(/^\/+/, '');
        const rutaArchivo = path.join(__dirname, '..', rutaRelativa);
        if (fs.existsSync(rutaArchivo)) {
          fs.unlinkSync(rutaArchivo);
        }
      }

      const puerto = process.env.PORT || 3000;
      const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;
      fotoUrl = `${host}/recursos/perfiles/${req.file.filename}`;
    }

    let consulta;
    let valores;

    if (fotoUrl) {
      consulta = `
        UPDATE usuario 
        SET telefono = $1, carrera = $2, foto_url = $3, ultima_actualizacion = NOW()
        WHERE id_usuario = $4
        RETURNING id_usuario, nombres, apellidos, telefono, carrera, foto_url
      `;
      valores = [telefono || null, id_carrera || null, fotoUrl, idUsuario];
    } else {
      consulta = `
        UPDATE usuario 
        SET telefono = $1, carrera = $2, ultima_actualizacion = NOW()
        WHERE id_usuario = $3
        RETURNING id_usuario, nombres, apellidos, telefono, carrera, foto_url
      `;
      valores = [telefono || null, id_carrera || null, idUsuario];
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

    const consulta = 'UPDATE usuario SET contrasenia = $1, ultima_actualizacion = NOW() WHERE id_usuario = $2';
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

/**
 * Registra un nuevo usuario en el sistema
 */
const registrarUsuario = async (req, res) => {
  let { nombres, apellidos, cedula, correo, contrasenia, carrera, roles, telefono } = req.body;
  const idAdministrador = req.usuario.id;

  try {
    let rolesIds = roles;
    if (typeof roles === 'string') {
      try {
        rolesIds = JSON.parse(roles);
      } catch (e) {
        rolesIds = roles.split(',').map(Number);
      }
    }

    if (!nombres || !apellidos || !cedula || !correo || !contrasenia || !rolesIds || rolesIds.length === 0) {
      return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser completados.' });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasenia, salt);

    // Verificar si la cédula ya existe
    const existeCedula = await consultar('SELECT id_usuario FROM usuario WHERE cedula = $1', [cedula]);
    if (existeCedula.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'La cédula ya se encuentra registrada.' });
    }

    // Verificar si el correo ya existe
    const existeCorreo = await consultar('SELECT id_usuario FROM usuario WHERE correo = $1', [correo.toLowerCase().trim()]);
    if (existeCorreo.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'El correo ya se encuentra registrado.' });
    }

    // Verificar si el teléfono ya existe (si se proporcionó)
    if (telefono && telefono.trim()) {
      const existeTelefono = await consultar('SELECT id_usuario FROM usuario WHERE telefono = $1', [telefono.trim()]);
      if (existeTelefono.rows.length > 0) {
        return res.status(409).json({ exito: false, mensaje: 'El teléfono ya se encuentra registrado.' });
      }
    }

    const insertUsuario = `
      INSERT INTO usuario (cedula, nombres, apellidos, correo, contrasenia, carrera, telefono)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_usuario
    `;
    const resultado = await consultar(insertUsuario, [
      cedula, 
      nombres, 
      apellidos, 
      correo.toLowerCase().trim(), 
      contrasenaHash, 
      carrera || null, 
      telefono || null
    ]);
    const idNuevoUsuario = resultado.rows[0].id_usuario;

    // Renombrar archivo de foto si se subió y actualizar URL en BD
    if (req.file) {
      const nombreViejo = req.file.filename; // ej. foto-perfil-nuevo-idEditor-fecha-timestamp.ext
      const nombreNuevo = nombreViejo.replace('nuevo', idNuevoUsuario);
      
      const rutaVieja = path.join(__dirname, '..', 'recursos', 'perfiles', nombreViejo);
      const rutaNueva = path.join(__dirname, '..', 'recursos', 'perfiles', nombreNuevo);
      
      if (fs.existsSync(rutaVieja)) {
        fs.renameSync(rutaVieja, rutaNueva);
        
        const puerto = process.env.PORT || 3000;
        const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;
        const fotoUrl = `${host}/recursos/perfiles/${nombreNuevo}`;
        
        await consultar('UPDATE usuario SET foto_url = $1 WHERE id_usuario = $2', [fotoUrl, idNuevoUsuario]);
      }
    }

    for (const idRol of rolesIds) {
      await consultar(
        'INSERT INTO usuario_rol (usuario, rol, asignado_por) VALUES ($1, $2, $3)',
        [idNuevoUsuario, idRol, idAdministrador]
      );
    }

    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado con éxito.',
      datos: { id_usuario: idNuevoUsuario }
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error.message);
    if (error.code === '23505') {
      return res.status(409).json({ exito: false, mensaje: 'Uno de los datos ingresados ya se encuentra registrado (cédula, correo o teléfono).' });
    }
    return res.status(500).json({ exito: false, mensaje: 'Error al registrar el usuario.' });
  }
};

/**
 * Elimina la foto de perfil del usuario autenticado
 */
const eliminarFotoPerfil = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    const consultaActual = 'SELECT foto_url FROM usuario WHERE id_usuario = $1';
    const resultadoActual = await consultar(consultaActual, [idUsuario]);

    if (resultadoActual.rows.length > 0 && resultadoActual.rows[0].foto_url) {
      try {
        const fotoUrl = resultadoActual.rows[0].foto_url;
        const baseUrl = process.env.URL_BACKEND || 'http://localhost:3000';
        // Quitar la URL base y el slash inicial para construir la ruta relativa
        const rutaRelativa = fotoUrl.replace(baseUrl, '').replace(/^\/+/, '');
        const rutaArchivo = path.join(__dirname, '..', rutaRelativa);
        if (fs.existsSync(rutaArchivo)) {
          fs.unlinkSync(rutaArchivo);
        }
      } catch (errArchivo) {
        // Si el archivo no se puede eliminar, continuamos para al menos limpiar la BD
        console.warn('No se pudo eliminar el archivo físico:', errArchivo.message);
      }
    }

    await consultar('UPDATE usuario SET foto_url = NULL, ultima_actualizacion = NOW() WHERE id_usuario = $1', [idUsuario]);

    return res.status(200).json({ exito: true, mensaje: 'Foto de perfil eliminada exitosamente.' });
  } catch (error) {
    console.error('Error en eliminarFotoPerfil:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al eliminar la foto de perfil.' });
  }
};

/**
 * Actualiza un usuario (solo Administradores)
 */
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  let { nombres, apellidos, cedula, correo, contrasenia, carrera, roles, telefono, fotoEliminada } = req.body;
  const idAdministrador = req.usuario.id;

  try {
    let rolesIds = roles;
    if (typeof roles === 'string') {
      try {
        rolesIds = JSON.parse(roles);
      } catch (e) {
        rolesIds = roles.split(',').map(Number);
      }
    }

    if (!nombres || !apellidos || !cedula || !correo || !rolesIds || rolesIds.length === 0) {
      return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser completados.' });
    }

    // Verificar si la cédula ya existe en otro usuario
    const existeCedula = await consultar('SELECT id_usuario FROM usuario WHERE cedula = $1 AND id_usuario != $2', [cedula, id]);
    if (existeCedula.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'La cédula ya se encuentra registrada.' });
    }

    // Verificar si el correo ya existe en otro usuario
    const existeCorreo = await consultar('SELECT id_usuario FROM usuario WHERE correo = $1 AND id_usuario != $2', [correo.toLowerCase().trim(), id]);
    if (existeCorreo.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'El correo ya se encuentra registrado.' });
    }

    // Verificar si el teléfono ya existe en otro usuario (si se proporcionó)
    if (telefono && telefono.trim()) {
      const existeTelefono = await consultar('SELECT id_usuario FROM usuario WHERE telefono = $1 AND id_usuario != $2', [telefono.trim(), id]);
      if (existeTelefono.rows.length > 0) {
        return res.status(409).json({ exito: false, mensaje: 'El teléfono ya se encuentra registrado.' });
      }
    }

    // Manejo de foto
    let fotoUrl = undefined; // undefined significa que no cambiamos la columna foto_url
    if (req.file || fotoEliminada === 'true' || fotoEliminada === true) {
      // 1. Obtener la foto actual para eliminarla del disco si existe
      const consultaActual = 'SELECT foto_url FROM usuario WHERE id_usuario = $1';
      const resultadoActual = await consultar(consultaActual, [id]);
      
      if (resultadoActual.rows.length > 0 && resultadoActual.rows[0].foto_url) {
        const fotoUrlActual = resultadoActual.rows[0].foto_url;
        const baseUrl = process.env.URL_BACKEND || 'http://localhost:3000';
        const rutaRelativa = fotoUrlActual.replace(baseUrl, '').replace(/^\/+/, '');
        const rutaArchivo = path.join(__dirname, '..', rutaRelativa);
        try {
          if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
          }
        } catch (err) {
          console.warn('No se pudo eliminar el archivo de foto anterior:', err.message);
        }
      }

      if (req.file) {
        const puerto = process.env.PORT || 3000;
        const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;
        fotoUrl = `${host}/recursos/perfiles/${req.file.filename}`;
      } else {
        fotoUrl = null; // Se eliminó y no se subió una nueva
      }
    }

    await consultar('BEGIN');

    let campos = ['cedula = $1', 'nombres = $2', 'apellidos = $3', 'correo = $4', 'carrera = $5', 'telefono = $6', 'ultima_actualizacion = NOW()'];
    let valores = [cedula, nombres, apellidos, correo.toLowerCase().trim(), carrera || null, telefono || null];
    let contador = 7;

    if (contrasenia && contrasenia.trim()) {
      const salt = await bcrypt.genSalt(10);
      const contrasenaHash = await bcrypt.hash(contrasenia, salt);
      campos.push(`contrasenia = $${contador}`);
      valores.push(contrasenaHash);
      contador++;
    }

    if (fotoUrl !== undefined) {
      campos.push(`foto_url = $${contador}`);
      valores.push(fotoUrl);
      contador++;
    }

    valores.push(id);
    const updateUsuario = `
      UPDATE usuario 
      SET ${campos.join(', ')}
      WHERE id_usuario = $${contador}
    `;

    await consultar(updateUsuario, valores);

    // Actualizar roles
    await consultar('DELETE FROM usuario_rol WHERE usuario = $1', [id]);

    for (const idRol of rolesIds) {
      await consultar(
        'INSERT INTO usuario_rol (usuario, rol, asignado_por) VALUES ($1, $2, $3)',
        [id, idRol, idAdministrador]
      );
    }

    await consultar('COMMIT');

    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario actualizado con éxito.'
    });
  } catch (error) {
    await consultar('ROLLBACK');
    console.error('Error en actualizarUsuario:', error.message);
    if (error.code === '23505') {
      return res.status(409).json({ exito: false, mensaje: 'Uno de los datos ingresados ya se encuentra registrado (cédula, correo o teléfono).' });
    }
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar el usuario.' });
  }
};

/**
 * Actualiza la información pública del perfil del receptor (perfil_usuario, insignias_perfil)
 */
const actualizarPerfilPublico = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { descripcion, agrupar_insignias, insignias_seleccionadas } = req.body;

  try {
    await consultar('BEGIN');

    // 1. Upsert en perfil_usuario
    const consultaPerfil = `
      INSERT INTO perfil_usuario (receptor, descripcion, agrupar_insignias, ultima_actualizacion)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (receptor) 
      DO UPDATE SET descripcion = $2, agrupar_insignias = $3, ultima_actualizacion = NOW()
    `;
    await consultar(consultaPerfil, [idUsuario, descripcion || '', agrupar_insignias || false]);

    // 2. Eliminar insignias anteriores
    await consultar('DELETE FROM insignias_perfil WHERE receptor = $1', [idUsuario]);

    // 3. Insertar las nuevas insignias seleccionadas
    if (insignias_seleccionadas && Array.isArray(insignias_seleccionadas) && insignias_seleccionadas.length > 0) {
      for (let i = 0; i < insignias_seleccionadas.length; i++) {
        const idInsignia = insignias_seleccionadas[i];
        await consultar(
          'INSERT INTO insignias_perfil (receptor, insignia, orden) VALUES ($1, $2, $3)',
          [idUsuario, idInsignia, i + 1]
        );
      }
    }

    await consultar('COMMIT');

    return res.status(200).json({
      exito: true,
      mensaje: 'Perfil académico guardado correctamente'
    });
  } catch (error) {
    await consultar('ROLLBACK');
    console.error('Error en actualizarPerfilPublico:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al guardar el perfil' });
  }
};

/**
 * Obtiene la información pública del perfil del receptor
 */
const obtenerPerfilPublico = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    const consultaPerfil = `SELECT descripcion, agrupar_insignias FROM perfil_usuario WHERE receptor = $1`;
    const resultadoPerfil = await consultar(consultaPerfil, [idUsuario]);
    
    let descripcion = '';
    let agrupar_insignias = false;
    
    if (resultadoPerfil.rows.length > 0) {
      descripcion = resultadoPerfil.rows[0].descripcion;
      agrupar_insignias = resultadoPerfil.rows[0].agrupar_insignias;
    }

    const consultaInsignias = `SELECT insignia FROM insignias_perfil WHERE receptor = $1 ORDER BY orden ASC`;
    const resultadoInsignias = await consultar(consultaInsignias, [idUsuario]);
    const insignias_seleccionadas = resultadoInsignias.rows.map(row => row.insignia);

    return res.status(200).json({
      exito: true,
      datos: {
        descripcion,
        agrupar_insignias,
        insignias_seleccionadas
      }
    });
  } catch (error) {
    console.error('Error en obtenerPerfilPublico:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al obtener el perfil público' });
  }
};

const obtenerPerfilesAcademicosPublicos = async (req, res) => {
  try {
    const consulta = `
      SELECT u.id_usuario as id, u.nombres, u.apellidos, u.correo, c.nombre as carrera, u.cedula, u.telefono, u.foto_url,
             pu.descripcion, pu.ultima_actualizacion as ultima_actualizacion_perfil,
             (SELECT COUNT(*)::int FROM insignias_perfil ip JOIN insignia_emitida ie ON ip.insignia = ie.id_insignia WHERE ip.receptor = u.id_usuario AND ie.estado = 1) AS n_insignias,
             u.creado_en
      FROM usuario u
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
      JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      JOIN rol r ON ur.rol = r.id_rol AND r.nombre = 'Receptor'
      LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.receptor
      WHERE u.activo = true
      ORDER BY u.creado_en DESC
    `;
    const resultado = await consultar(consulta, []);
    return res.status(200).json({
      exito: true,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener perfiles académicos:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener los perfiles académicos.' });
  }
};

const obtenerPerfilAcademicoPublicoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const consultaUsuario = `
      SELECT u.id_usuario as id, u.nombres, u.apellidos, u.correo, c.nombre as carrera, u.cedula, u.telefono, u.foto_url,
             pu.descripcion, pu.agrupar_insignias, pu.ultima_actualizacion as ultima_actualizacion_perfil
      FROM usuario u
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
      LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.receptor
      WHERE u.id_usuario = $1 AND u.activo = true
    `;
    const resultadoUsuario = await consultar(consultaUsuario, [id]);
    
    if (resultadoUsuario.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultadoUsuario.rows[0];

    const consultaInsignias = `
      SELECT ie.id_insignia as id_insignia, ie.id_global, m.nombre as microcredencial, a.nombre as area, ie.png_baked_url
      FROM insignias_perfil ip
      JOIN insignia_emitida ie ON ip.insignia = ie.id_insignia
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      WHERE ip.receptor = $1 AND ie.estado = 1
      ORDER BY ip.orden ASC
    `;
    const resultadoInsignias = await consultar(consultaInsignias, [id]);
    
    return res.status(200).json({
      exito: true,
      datos: {
        ...usuario,
        insignias: resultadoInsignias.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil académico público por id:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener el perfil académico detallado.' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasenia,
  registrarUsuario,
  eliminarFotoPerfil,
  actualizarUsuario,
  actualizarPerfilPublico,
  obtenerPerfilPublico,
  obtenerPerfilesAcademicosPublicos,
  obtenerPerfilAcademicoPublicoPorId
};

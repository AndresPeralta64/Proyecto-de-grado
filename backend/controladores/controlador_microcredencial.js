const { consultar } = require('../servicios/base_datos');
const fs = require('fs');
const path = require('path');

/**
 * Registra una nueva microcredencial
 */
const registrarMicrocredencial = async (req, res) => {
  const { nombre, descripcion, nivel, area_conocimiento, duracion_horas, criterios_evaluacion, competencias } = req.body;
  const idEmisor = req.usuario.id;

  try {
    if (!nombre || !descripcion || !nivel || !area_conocimiento || !duracion_horas || !criterios_evaluacion || !competencias) {
      return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser completados.' });
    }

    if (!req.file) {
      return res.status(400).json({ exito: false, mensaje: 'La imagen de la insignia es obligatoria.' });
    }

    // Verificar si el nombre ya existe
    const existeNombre = await consultar('SELECT id_microcredencial FROM microcredencial WHERE LOWER(nombre) = LOWER($1) AND eliminado = false', [nombre.trim()]);
    if (existeNombre.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'El nombre de la microcredencial ya está en uso.' });
    }

    const puerto = process.env.PORT || 3000;
    const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;
    const fotoUrl = `${host}/recursos/insignias/${req.file.filename}`;

    const insertMicrocredencial = `
      INSERT INTO microcredencial (
        nombre, descripcion, criterios_evaluacion, duracion_horas, 
        competencias, imagen_url, emisor, nivel, area_conocimiento, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
      RETURNING id_microcredencial
    `;

    const resultado = await consultar(insertMicrocredencial, [
      nombre.trim(),
      descripcion.trim(),
      criterios_evaluacion.trim(),
      parseInt(duracion_horas, 10),
      JSON.parse(competencias), // Parsear el array stringificado para que pg lo envíe como array a PostgreSQL
      fotoUrl, // Inicialmente se inserta la url temporal
      idEmisor,
      parseInt(nivel, 10),
      parseInt(area_conocimiento, 10)
    ]);

    const idMicrocredencial = resultado.rows[0].id_microcredencial;

    // Renombrar la foto para incluir el id de la microcredencial
    const nombreViejo = req.file.filename;
    // El nombre temporal es: insignia-digital-[idEditor]-temp-[fecha]-[timestamp].ext
    // Lo cambiaremos a: insignia-digital-[idEditor]-[idMicrocredencial]-[fecha]-[timestamp].ext
    const nombreNuevo = nombreViejo.replace('-temp-', `-${idMicrocredencial}-`);
    
    const rutaVieja = path.join(__dirname, '..', 'recursos', 'insignias', nombreViejo);
    const rutaNueva = path.join(__dirname, '..', 'recursos', 'insignias', nombreNuevo);
    
    let fotoUrlFinal = fotoUrl;
    if (fs.existsSync(rutaVieja)) {
      fs.renameSync(rutaVieja, rutaNueva);
      fotoUrlFinal = `${host}/recursos/insignias/${nombreNuevo}`;
    }

    const metadataOB3 = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
      ],
      "id": `${host}/api/microcredenciales/${idMicrocredencial}`,
      "type": ["Achievement"],
      "name": nombre.trim(),
      "description": descripcion.trim(),
      "criteria": {
        "narrative": criterios_evaluacion.trim()
      },
      "image": {
        "id": fotoUrlFinal,
        "type": "Image"
      }
    };

    // Actualizar la URL y el metadata OB3 en la base de datos
    await consultar('UPDATE microcredencial SET imagen_url = $1, metadata_ob3 = $2 WHERE id_microcredencial = $3', [fotoUrlFinal, metadataOB3, idMicrocredencial]);

    return res.status(201).json({
      exito: true,
      mensaje: 'Insignia registrada correctamente. Un administrador la revisará en breve',
      datos: { id_microcredencial: idMicrocredencial }
    });
  } catch (error) {
    console.error('Error en registrarMicrocredencial:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al registrar la microcredencial.' });
  }
};

/**
 * Actualiza una microcredencial existente (para emisores, típicamente al subsanar un rechazo)
 */
const actualizarMicrocredencial = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, nivel, area_conocimiento, duracion_horas, criterios_evaluacion, competencias } = req.body;
  const idEmisor = req.usuario.id;

  try {
    if (!nombre || !descripcion || !nivel || !area_conocimiento || !duracion_horas || !criterios_evaluacion || !competencias) {
      return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser completados.' });
    }

    // Verificar si la microcredencial existe y pertenece al emisor
    const consultaMicro = await consultar('SELECT * FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false', [id]);
    if (consultaMicro.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe.' });
    }

    const micro = consultaMicro.rows[0];
    if (micro.emisor !== idEmisor && req.usuario.nombre_rol === 'Emisor') {
      return res.status(403).json({ exito: false, mensaje: 'No tiene permisos para modificar esta microcredencial.' });
    }

    // Verificar si el nombre ya está en uso por otra microcredencial
    const existeNombre = await consultar('SELECT id_microcredencial FROM microcredencial WHERE LOWER(nombre) = LOWER($1) AND id_microcredencial != $2 AND eliminado = false', [nombre.trim(), id]);
    if (existeNombre.rows.length > 0) {
      return res.status(409).json({ exito: false, mensaje: 'El nombre de la microcredencial ya está en uso.' });
    }

    const puerto = process.env.PORT || 3000;
    const host = process.env.URL_BACKEND || `http://localhost:${puerto}`;

    let fotoUrlFinal = micro.imagen_url;
    if (req.file) {
      const nombreViejo = req.file.filename;
      const nombreNuevo = nombreViejo.replace('-temp-', `-${id}-`);
      
      const rutaVieja = path.join(__dirname, '..', 'recursos', 'insignias', nombreViejo);
      const rutaNueva = path.join(__dirname, '..', 'recursos', 'insignias', nombreNuevo);
      
      if (fs.existsSync(rutaVieja)) {
        fs.renameSync(rutaVieja, rutaNueva);
        fotoUrlFinal = `${host}/recursos/insignias/${nombreNuevo}`;
      }
    }

    const metadataOB3 = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
      ],
      "id": `${host}/api/microcredenciales/${id}`,
      "type": ["Achievement"],
      "name": nombre.trim(),
      "description": descripcion.trim(),
      "criteria": {
        "narrative": criterios_evaluacion.trim()
      },
      "image": {
        "id": fotoUrlFinal,
        "type": "Image"
      }
    };

    // Actualizar la microcredencial: volver el estado a Pendiente (1), limpiar evaluado_por y justificacion_rechazo, y actualizar metadata
    const updateMicrocredencial = `
      UPDATE microcredencial 
      SET nombre = $1, descripcion = $2, criterios_evaluacion = $3, duracion_horas = $4,
          competencias = $5, imagen_url = $6, nivel = $7, area_conocimiento = $8,
          estado = 1, evaluado_por = NULL, justificacion_rechazo = NULL, aprobado_en = NULL, ultima_actualizacion = NOW(),
          metadata_ob3 = $10
      WHERE id_microcredencial = $9
    `;

    await consultar(updateMicrocredencial, [
      nombre.trim(),
      descripcion.trim(),
      criterios_evaluacion.trim(),
      parseInt(duracion_horas, 10),
      JSON.parse(competencias),
      fotoUrlFinal,
      parseInt(nivel, 10),
      parseInt(area_conocimiento, 10),
      id,
      metadataOB3
    ]);

    return res.status(200).json({
      exito: true,
      mensaje: 'Microcredencial actualizada correctamente. Un administrador la revisará en breve para su aprobación.',
      datos: { id_microcredencial: id }
    });
  } catch (error) {
    console.error('Error en actualizarMicrocredencial:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar la microcredencial.' });
  }
};

/**
 * Obtiene la lista completa de microcredenciales (para administradores)
 */
const listarMicrocredenciales = async (req, res) => {
  try {
    const consulta = `
      SELECT 
        m.id_microcredencial,
        m.nombre,
        m.descripcion,
        m.criterios_evaluacion,
        m.duracion_horas,
        m.competencias,
        m.imagen_url,
        m.justificacion_rechazo,
        m.aprobado_en,
        m.creado_en,
        m.ultima_actualizacion,
        m.emisor AS id_emisor,
        CONCAT(u_emisor.nombres, ' ', u_emisor.apellidos) AS emisor,
        u_emisor.correo AS emisor_correo,
        CONCAT(u_aprobador.nombres, ' ', u_aprobador.apellidos) AS evaluado_por,
        CONCAT(u_inactivador.nombres, ' ', u_inactivador.apellidos) AS inactivado_por,
        n.nombre AS nivel,
        a.nombre AS area_conocimiento,
        e.nombre AS estado,
        (SELECT COUNT(*)::int FROM insignia_emitida ie WHERE ie.microcredencial = m.id_microcredencial) AS num_emisiones
      FROM microcredencial m
      JOIN usuario u_emisor ON m.emisor = u_emisor.id_usuario
      LEFT JOIN usuario u_aprobador ON m.evaluado_por = u_aprobador.id_usuario
      LEFT JOIN usuario u_inactivador ON m.inactivado_por = u_inactivador.id_usuario
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      JOIN estado_microcredencial e ON m.estado = e.id_estado
      WHERE m.eliminado = false
      ORDER BY m.id_microcredencial ASC
    `;
    const resultado = await consultar(consulta, []);
    return res.status(200).json({
      exito: true,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al listar microcredenciales:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las microcredenciales.' });
  }
};

/**
 * Aprueba una microcredencial (cambia estado a Aprobada)
 */
const aprobarMicrocredencial = async (req, res) => {
  const { id } = req.params;
  const idAprobador = req.usuario.id;
  try {
    const consulta = `
      UPDATE microcredencial 
      SET estado = 2, evaluado_por = COALESCE(evaluado_por, $1), inactivado_por = NULL, aprobado_en = COALESCE(aprobado_en, NOW()), justificacion_rechazo = NULL, ultima_actualizacion = NOW()
      WHERE id_microcredencial = $2 AND eliminado = false
    `;
    await consultar(consulta, [idAprobador, id]);
    return res.status(200).json({ exito: true, mensaje: 'Microcredencial aprobada con éxito.' });
  } catch (error) {
    console.error('Error al aprobar microcredencial:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al aprobar la microcredencial.' });
  }
};

/**
 * Cambia el estado de una microcredencial
 */
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { id_estado, justificacion_rechazo } = req.body;
  const idUsuario = req.usuario.id;
  try {
    // Si el usuario es un Emisor, restringir las transiciones de estado
    if (req.usuario.nombre_rol === 'Emisor') {
      const queryEstado = `SELECT estado, emisor FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
      const resEstado = await consultar(queryEstado, [id]);
      if (resEstado.rows.length === 0) {
        return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe o ya fue eliminada.' });
      }
      
      const creadorId = resEstado.rows[0].emisor;
      const estadoActual = Number(resEstado.rows[0].estado);

      // El emisor solo puede modificar sus propias microcredenciales
      if (creadorId !== idUsuario) {
        return res.status(403).json({ exito: false, mensaje: 'No tiene permisos para modificar esta microcredencial.' });
      }

      // El emisor solo puede cambiar de APROBADA (2) a INACTIVA (4)
      if (estadoActual !== 2 || Number(id_estado) !== 4) {
        return res.status(400).json({ exito: false, mensaje: 'Acción no permitida: un emisor solo puede inactivar una microcredencial aprobada y no puede reactivarla.' });
      }
    }
    let consulta;
    let valores;
    if (Number(id_estado) === 2) { // Aprobada
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, evaluado_por = COALESCE(evaluado_por, $2), inactivado_por = NULL, aprobado_en = COALESCE(aprobado_en, NOW()), justificacion_rechazo = NULL, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $3 AND eliminado = false
      `;
      valores = [id_estado, idUsuario, id];
    } else if (Number(id_estado) === 3) { // Rechazada
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, evaluado_por = $4, inactivado_por = NULL, aprobado_en = NULL, justificacion_rechazo = $2, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $3 AND eliminado = false
      `;
      valores = [id_estado, justificacion_rechazo || null, id, idUsuario];
    } else if (Number(id_estado) === 4) { // Inactiva
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, inactivado_por = $2, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $3 AND eliminado = false
      `;
      valores = [id_estado, idUsuario, id];
    } else { // Pendiente
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, evaluado_por = NULL, inactivado_por = NULL, aprobado_en = NULL, justificacion_rechazo = NULL, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $2 AND eliminado = false
      `;
      valores = [id_estado, id];
    }
    await consultar(consulta, valores);
    return res.status(200).json({ exito: true, mensaje: 'Estado de la microcredencial actualizado con éxito.' });
  } catch (error) {
    console.error('Error al cambiar estado de microcredencial:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al cambiar el estado de la microcredencial.' });
  }
};

/**
 * Elimina de manera lógica una microcredencial (eliminado = true) y revoca sus insignias si estaba Aprobada o Inactiva.
 */
const eliminarMicrocredencial = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.usuario.id;
  try {
    // 1. Obtener el estado actual de la microcredencial antes de eliminarla
    const queryEstado = `SELECT estado, emisor FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
    const resEstado = await consultar(queryEstado, [id]);
    
    if (resEstado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe o ya fue eliminada.' });
    }
    
    const creadorId = resEstado.rows[0].emisor;
    const estadoActual = Number(resEstado.rows[0].estado);

    // Si el usuario es un Emisor, solo puede eliminar sus propias microcredenciales
    if (req.usuario.nombre_rol === 'Emisor' && creadorId !== idUsuario) {
      return res.status(403).json({ exito: false, mensaje: 'No tiene permisos para eliminar esta microcredencial.' });
    }
    

    // 3. Eliminar lógicamente la microcredencial
    const queryEliminar = `
      UPDATE microcredencial 
      SET eliminado = true, ultima_actualizacion = NOW()
      WHERE id_microcredencial = $1
    `;
    await consultar(queryEliminar, [id]);
    
    return res.status(200).json({ exito: true, mensaje: 'Microcredencial eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar microcredencial:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al eliminar la microcredencial.' });
  }
};

/**
 * Obtiene la lista de niveles de microcredenciales
 */
const obtenerNiveles = async (req, res) => {
  try {
    const query = 'SELECT id_nivel, nombre FROM nivel_microcredencial ORDER BY id_nivel ASC';
    const resultado = await consultar(query, []);
    return res.status(200).json({ exito: true, datos: resultado.rows });
  } catch (error) {
    console.error('Error al obtener niveles:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener los niveles.' });
  }
};

/**
 * Obtiene la lista de áreas de conocimiento
 */
const obtenerAreasConocimiento = async (req, res) => {
  try {
    const query = 'SELECT id_area, nombre FROM area_conocimiento ORDER BY nombre ASC';
    const resultado = await consultar(query, []);
    return res.status(200).json({ exito: true, datos: resultado.rows });
  } catch (error) {
    console.error('Error al obtener áreas de conocimiento:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las áreas de conocimiento.' });
  }
};

/**
 * Obtiene la lista de microcredenciales aprobadas para la vista pública
 */
const obtenerMicrocredencialesPublicas = async (req, res) => {
  try {
    const consulta = `
      SELECT 
        m.id_microcredencial,
        m.nombre,
        m.descripcion,
        m.criterios_evaluacion,
        m.duracion_horas,
        m.competencias,
        m.imagen_url,
        m.aprobado_en,
        m.creado_en,
        m.ultima_actualizacion,
        CONCAT(u_emisor.nombres, ' ', u_emisor.apellidos) AS emisor,
        u_emisor.correo AS emisor_correo,
        n.nombre AS nivel,
        a.nombre AS area_conocimiento,
        e.nombre AS estado,
        (SELECT COUNT(*)::int FROM insignia_emitida ie WHERE ie.microcredencial = m.id_microcredencial AND ie.estado = 1) AS num_emisiones
      FROM microcredencial m
      JOIN usuario u_emisor ON m.emisor = u_emisor.id_usuario
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      JOIN estado_microcredencial e ON m.estado = e.id_estado
      WHERE m.eliminado = false AND m.estado = 2
      ORDER BY m.creado_en DESC
    `;
    const resultado = await consultar(consulta, []);
    return res.status(200).json({
      exito: true,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener microcredenciales públicas:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las microcredenciales registradas.' });
  }
};

const obtenerMicrocredencialPublicaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = `
      SELECT 
        m.id_microcredencial,
        m.nombre,
        m.descripcion,
        m.criterios_evaluacion,
        m.duracion_horas,
        m.competencias,
        m.imagen_url,
        m.aprobado_en,
        m.creado_en,
        m.ultima_actualizacion,
        CONCAT(u_emisor.nombres, ' ', u_emisor.apellidos) AS emisor,
        u_emisor.correo AS emisor_correo,
        n.nombre AS nivel,
        a.nombre AS area_conocimiento,
        e.nombre AS estado,
        (SELECT COUNT(*)::int FROM insignia_emitida ie WHERE ie.microcredencial = m.id_microcredencial AND ie.estado = 1) AS num_emisiones
      FROM microcredencial m
      JOIN usuario u_emisor ON m.emisor = u_emisor.id_usuario
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      JOIN estado_microcredencial e ON m.estado = e.id_estado
      WHERE m.eliminado = false AND m.estado = 2 AND m.id_microcredencial = $1
    `;
    const resultado = await consultar(consulta, [id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Microcredencial no encontrada o no disponible públicamente.' });
    }

    return res.status(200).json({
      exito: true,
      datos: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener la microcredencial pública por ID:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener el detalle de la microcredencial.' });
  }
};

module.exports = {
  registrarMicrocredencial,
  actualizarMicrocredencial,
  listarMicrocredenciales,
  aprobarMicrocredencial,
  cambiarEstado,
  eliminarMicrocredencial,
  obtenerNiveles,
  obtenerAreasConocimiento,
  obtenerMicrocredencialesPublicas,
  obtenerMicrocredencialPublicaPorId
};

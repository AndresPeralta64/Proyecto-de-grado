const { consultar } = require('../servicios/base_datos');

/**
 * Obtiene la lista de microcredenciales (filtrada por emisor si no es administrador)
 */
const listarMicrocredenciales = async (req, res) => {
  try {
    let consulta = `
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
        CONCAT(u_emisor.nombres, ' ', u_emisor.apellidos) AS emisor,
        CONCAT(u_aprobador.nombres, ' ', u_aprobador.apellidos) AS aprobado_por,
        n.nombre AS nivel,
        a.nombre AS area_conocimiento,
        e.nombre AS estado
      FROM microcredencial m
      JOIN usuario u_emisor ON m.emisor = u_emisor.id_usuario
      LEFT JOIN usuario u_aprobador ON m.aprobado_por = u_aprobador.id_usuario
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      JOIN estado_microcredencial e ON m.estado = e.id_estado
      WHERE m.eliminado = false
    `;
    let valores = [];
    const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';
    const soloPropias = req.query.soloPropias === 'true';
    if (!esAdmin || soloPropias) {
      consulta += ` AND m.emisor = $1`;
      valores.push(req.usuario.id);
    }
    consulta += ` ORDER BY m.id_microcredencial ASC`;

    const resultado = await consultar(consulta, valores);
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
 * Aprueba una microcredencial (cambia estado a Aprobada) - Solo Administrador
 */
const aprobarMicrocredencial = async (req, res) => {
  const { id } = req.params;
  const idAprobador = req.usuario.id;
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';

  if (!esAdmin) {
    return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: El emisor no puede aprobar microcredenciales.' });
  }

  try {
    const consulta = `
      UPDATE microcredencial 
      SET estado = 2, aprobado_por = $1, aprobado_en = NOW(), justificacion_rechazo = NULL, ultima_actualizacion = NOW()
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
 * Cambia el estado de una microcredencial (con restricciones para el Emisor)
 */
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { id_estado, justificacion_rechazo } = req.body;
  const idUsuario = req.usuario.id;
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';

  try {
    if (!esAdmin) {
      // Validar que la microcredencial le pertenezca y esté en estado APROBADA
      const queryVerificar = `SELECT estado, emisor FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
      const resVerificar = await consultar(queryVerificar, [id]);
      
      if (resVerificar.rows.length === 0) {
        return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe.' });
      }
      
      const micro = resVerificar.rows[0];
      if (micro.emisor !== idUsuario) {
        return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: No tiene permisos para modificar esta microcredencial.' });
      }
      
      // El emisor solo puede inactivar (estado 4)
      if (Number(id_estado) !== 4) {
        return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: El emisor solo puede inactivar la microcredencial.' });
      }
      
      // Solo se puede inactivar si actualmente está aprobada (estado 2)
      if (Number(micro.estado) !== 2) {
        return res.status(400).json({ exito: false, mensaje: 'Solo se puede inactivar una microcredencial aprobada.' });
      }
    }

    let consulta;
    let valores;
    if (Number(id_estado) === 2) { // Aprobada
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, aprobado_por = $2, aprobado_en = NOW(), justificacion_rechazo = NULL, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $3 AND eliminado = false
      `;
      valores = [id_estado, idUsuario, id];
    } else if (Number(id_estado) === 3) { // Rechazada
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, aprobado_por = NULL, aprobado_en = NULL, justificacion_rechazo = $2, ultima_actualizacion = NOW()
        WHERE id_microcredencial = $3 AND eliminado = false
      `;
      valores = [id_estado, justificacion_rechazo || null, id];
    } else { // Pendiente / Inactiva
      consulta = `
        UPDATE microcredencial 
        SET estado = $1, aprobado_por = NULL, aprobado_en = NULL, justificacion_rechazo = NULL, ultima_actualizacion = NOW()
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
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';

  try {
    // 1. Obtener el estado actual de la microcredencial antes de eliminarla
    const queryEstado = `SELECT estado, emisor FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
    const resEstado = await consultar(queryEstado, [id]);
    
    if (resEstado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe o ya fue eliminada.' });
    }
    
    const micro = resEstado.rows[0];
    const estadoActual = Number(micro.estado);
    
    // Verificar propiedad si es emisor
    if (!esAdmin && micro.emisor !== idUsuario) {
      return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: No tiene permisos para eliminar esta microcredencial.' });
    }
    
    // 2. Si es Aprobada (2) o Inactiva (4), revocar insignias emitidas
    if (estadoActual === 2 || estadoActual === 4) {
      // Obtener todas las insignias emitidas activas de esta microcredencial
      const queryInsignias = `SELECT id_insignia FROM insignia_emitida WHERE microcredencial = $1 AND estado = 1`;
      const resInsignias = await consultar(queryInsignias, [id]);
      
      const insignias = resInsignias.rows;
      if (insignias.length > 0) {
        // Actualizar el estado de todas estas insignias a 2 (Revocada)
        const updateInsignias = `UPDATE insignia_emitida SET estado = 2 WHERE microcredencial = $1 AND estado = 1`;
        await consultar(updateInsignias, [id]);
        
        // Insertar en la tabla de revocacion_insignia
        for (const ins of insignias) {
          const insertRevocacion = `
            INSERT INTO revocacion_insignia (insignia, revocado_por, justificacion, revocado_en)
            VALUES ($1, $2, 'Revocada debido a la eliminación de la microcredencial asociada.', NOW())
          `;
          await consultar(insertRevocacion, [ins.id_insignia, idUsuario]);
        }
      }
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
 * Obtiene los niveles y áreas de conocimiento para los catálogos
 */
const obtenerCatalogos = async (req, res) => {
  try {
    const resNiveles = await consultar('SELECT id_nivel AS id, nombre FROM nivel_microcredencial ORDER BY id_nivel ASC', []);
    const resAreas = await consultar('SELECT id_area AS id, nombre FROM area_conocimiento ORDER BY id_area ASC', []);
    
    return res.status(200).json({
      exito: true,
      datos: {
        niveles: resNiveles.rows,
        areas: resAreas.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener catálogos:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener los catálogos.' });
  }
};

/**
 * Crea/registra una nueva microcredencial
 */
const crearMicrocredencial = async (req, res) => {
  const emisorId = req.usuario.id;
  const { nombre, descripcion, criterios_evaluacion, nivel, duracion_horas, area_conocimiento, competencias } = req.body;
  const archivo = req.file;

  try {
    // 1. Validar campos requeridos
    if (!nombre || !nombre.trim() || !descripcion || !descripcion.trim() || !criterios_evaluacion || !criterios_evaluacion.trim() || !nivel || !duracion_horas || !area_conocimiento || !competencias) {
      if (archivo) {
        const fs = require('fs');
        fs.unlinkSync(archivo.path);
      }
      return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser completados.' });
    }

    if (!archivo) {
      return res.status(400).json({ exito: false, mensaje: 'Debe cargar o diseñar una insignia digital asociada.' });
    }

    // 2. Validar si ya existe una microcredencial con el mismo nombre (frente a eliminados)
    const queryExiste = `SELECT id_microcredencial FROM microcredencial WHERE LOWER(nombre) = LOWER($1) AND eliminado = false`;
    const resExiste = await consultar(queryExiste, [nombre.trim()]);
    
    if (resExiste.rows.length > 0) {
      const fs = require('fs');
      fs.unlinkSync(archivo.path);
      return res.status(400).json({ exito: false, mensaje: 'Microcredencial ya existe' });
    }

    // 3. Procesar las competencias
    let compsArray = [];
    if (Array.isArray(competencias)) {
      compsArray = competencias;
    } else {
      try {
        compsArray = JSON.parse(competencias);
      } catch (e) {
        compsArray = competencias.split(',').map(c => c.trim()).filter(c => c.length > 0);
      }
    }

    // 4. Crear la URL pública para la imagen de la insignia
    const imagen_url = `/recursos/insignias/${archivo.filename}`;

    // 5. Estructurar metadatos Open Badges 3.0
    const metadata_ob3 = {
      type: ["Achievement"],
      name: nombre.trim(),
      description: descripcion.trim(),
      criteria: {
        narrative: criterios_evaluacion.trim()
      },
      image: {
        id: imagen_url,
        type: "Image"
      }
    };

    // 6. Insertar en la base de datos (estado 1: Pendiente)
    const queryInsertar = `
      INSERT INTO microcredencial (
        emisor, nombre, descripcion, criterios_evaluacion, nivel, 
        duracion_horas, area_conocimiento, competencias, imagen_url, metadata_ob3, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
      RETURNING id_microcredencial
    `;
    
    const valores = [
      emisorId,
      nombre.trim(),
      descripcion.trim(),
      criterios_evaluacion.trim(),
      Number(nivel),
      Number(duracion_horas),
      Number(area_conocimiento),
      compsArray,
      imagen_url,
      JSON.stringify(metadata_ob3)
    ];

    await consultar(queryInsertar, valores);

    return res.status(201).json({
      exito: true,
      mensaje: 'Microcredencial registrada con éxito. Pendiente de aprobación.'
    });

  } catch (error) {
    console.error('Error al registrar microcredencial:', error.message);
    if (archivo) {
      try {
        const fs = require('fs');
        fs.unlinkSync(archivo.path);
      } catch (err) {}
    }
    return res.status(500).json({ exito: false, mensaje: 'Error al registrar la microcredencial.' });
  }
};

module.exports = {
  listarMicrocredenciales,
  aprobarMicrocredencial,
  cambiarEstado,
  eliminarMicrocredencial,
  obtenerCatalogos,
  crearMicrocredencial
};

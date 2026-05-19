const { consultar } = require('../servicios/base_datos');

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
 * Cambia el estado de una microcredencial
 */
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { id_estado, justificacion_rechazo } = req.body;
  const idUsuario = req.usuario.id;
  try {
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
  try {
    // 1. Obtener el estado actual de la microcredencial antes de eliminarla
    const queryEstado = `SELECT estado FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
    const resEstado = await consultar(queryEstado, [id]);
    
    if (resEstado.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'La microcredencial no existe o ya fue eliminada.' });
    }
    
    const estadoActual = Number(resEstado.rows[0].estado);
    
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

module.exports = {
  listarMicrocredenciales,
  aprobarMicrocredencial,
  cambiarEstado,
  eliminarMicrocredencial
};

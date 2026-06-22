const { consultar } = require('../servicios/base_datos');

const obtenerEstadisticasAdministrador = async (req, res) => {
  try {
    // Total de usuarios registrados
    const usuariosRes = await consultar('SELECT COUNT(*)::int FROM usuario');
    const totalUsuariosRegistrados = usuariosRes.rows[0].count;

    // Total de usuarios por estado
    const usuariosEstadoRes = await consultar(`
      SELECT activo, COUNT(*)::int
      FROM usuario
      GROUP BY activo
    `);
    const usuariosPorEstado = usuariosEstadoRes.rows.map(r => ({
      estado: r.activo ? 'Activo' : 'Inactivo',
      count: r.count
    }));

    // Total de microcredenciales por estado
    const microcredencialesRes = await consultar(`
      SELECT e.nombre as estado, COUNT(m.id_microcredencial)::int
      FROM estado_microcredencial e
      LEFT JOIN microcredencial m ON e.id_estado = m.estado AND m.eliminado = false
      GROUP BY e.nombre
    `);
    const microcredencialesPorEstado = microcredencialesRes.rows;

    const totalMicrocredenciales = microcredencialesPorEstado.reduce((acc, curr) => acc + curr.count, 0);

    // Total de insignias emitidas en todo el sistema
    const insigniasRes = await consultar('SELECT COUNT(*)::int FROM insignia_emitida');
    const totalInsigniasEmitidas = insigniasRes.rows[0].count;

    // Microcredenciales recientes pendientes
    const recientesPendientesRes = await consultar(`
      SELECT m.id_microcredencial, m.nombre, u.nombres || ' ' || u.apellidos AS emisor, m.creado_en
      FROM microcredencial m
      JOIN usuario u ON m.emisor = u.id_usuario
      JOIN estado_microcredencial e ON m.estado = e.id_estado
      WHERE e.nombre = 'Pendiente' AND m.eliminado = false
      ORDER BY m.creado_en DESC
      LIMIT 5
    `);
    const recientesPendientes = recientesPendientesRes.rows;

    return res.status(200).json({
      exito: true,
      datos: {
        totalUsuariosRegistrados,
        usuariosPorEstado,
        totalMicrocredenciales,
        microcredencialesPorEstado,
        totalInsigniasEmitidas,
        recientesPendientes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de administrador:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las estadísticas del administrador.' });
  }
};

const obtenerEstadisticasEmisor = async (req, res) => {
  const idEmisor = req.usuario.id;
  try {
    // Total de microcredenciales creadas por el emisor (no eliminadas)
    const microcredencialesRes = await consultar(
      'SELECT COUNT(*)::int FROM microcredencial WHERE emisor = $1 AND eliminado = false',
      [idEmisor]
    );
    const totalMicrocredenciales = microcredencialesRes.rows[0].count;

    // Total de insignias emitidas por este emisor
    const insigniasRes = await consultar(
      'SELECT COUNT(*)::int FROM insignia_emitida WHERE emisor = $1',
      [idEmisor]
    );
    const totalInsigniasEmitidas = insigniasRes.rows[0].count;

    // Breakdown de estados de microcredenciales
    const microcredencialesEstadoRes = await consultar(`
      SELECT e.nombre as estado, COUNT(m.id_microcredencial)::int
      FROM estado_microcredencial e
      LEFT JOIN microcredencial m ON e.id_estado = m.estado AND m.emisor = $1 AND m.eliminado = false
      GROUP BY e.nombre
    `, [idEmisor]);
    const microcredencialesPorEstado = microcredencialesEstadoRes.rows;

    // Microcredenciales más usadas (Top 5 con más insignias emitidas)
    const topMicrocredencialesRes = await consultar(`
      SELECT m.nombre, COUNT(i.id_insignia)::int as total_emitidas
      FROM microcredencial m
      LEFT JOIN insignia_emitida i ON m.id_microcredencial = i.microcredencial
      WHERE m.emisor = $1 AND m.eliminado = false
      GROUP BY m.id_microcredencial
      ORDER BY total_emitidas DESC
      LIMIT 5
    `, [idEmisor]);
    const topMicrocredenciales = topMicrocredencialesRes.rows;

    return res.status(200).json({
      exito: true,
      datos: {
        totalMicrocredenciales,
        totalInsigniasEmitidas,
        microcredencialesPorEstado,
        topMicrocredenciales
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de emisor:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las estadísticas del emisor.' });
  }
};

const obtenerEstadisticasReceptor = async (req, res) => {
  const idReceptor = req.usuario.id;
  try {
    // Total de insignias obtenidas
    const insigniasRes = await consultar(
      'SELECT COUNT(*)::int FROM insignia_emitida WHERE receptor = $1',
      [idReceptor]
    );
    const totalInsignias = insigniasRes.rows[0].count;

    // Insignias agrupadas por estado (Activa / Revocada)
    const insigniasEstadoRes = await consultar(`
      SELECT e.nombre as estado, COUNT(i.id_insignia)::int
      FROM estado_insignia e
      LEFT JOIN insignia_emitida i ON e.id_estado = i.estado AND i.receptor = $1
      GROUP BY e.nombre
    `, [idReceptor]);
    const insigniasPorEstado = insigniasEstadoRes.rows;

    // Insignias recientes
    const recientesRes = await consultar(`
      SELECT i.id_global, m.nombre as microcredencial, i.fecha_emision, i.png_baked_url, e.nombre as estado
      FROM insignia_emitida i
      JOIN microcredencial m ON i.microcredencial = m.id_microcredencial
      JOIN estado_insignia e ON i.estado = e.id_estado
      WHERE i.receptor = $1
      ORDER BY i.fecha_emision DESC
      LIMIT 3
    `, [idReceptor]);
    const recientes = recientesRes.rows;

    return res.status(200).json({
      exito: true,
      datos: {
        totalInsignias,
        insigniasPorEstado,
        recientes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de receptor:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener las estadísticas del receptor.' });
  }
};

module.exports = {
  obtenerEstadisticasAdministrador,
  obtenerEstadisticasEmisor,
  obtenerEstadisticasReceptor
};

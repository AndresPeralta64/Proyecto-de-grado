const { consultar } = require('../servicios/base_datos');

const obtenerMiPerfil = async (req, res) => {
  try {
    const idReceptor = req.usuario.id;

    // 1. Obtener datos de usuario
    const queryUsuario = 'SELECT nombres, apellidos, correo, foto_url FROM usuario WHERE id_usuario = $1';
    const resUsuario = await consultar(queryUsuario, [idReceptor]);
    if (resUsuario.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }
    const usuario = resUsuario.rows[0];

    // 2. Obtener preferencias de perfil_usuario
    const queryPerfil = 'SELECT descripcion, agrupar_insignias FROM perfil_usuario WHERE receptor = $1';
    const resPerfil = await consultar(queryPerfil, [idReceptor]);
    let descripcion = null;
    let agrupar_insignias = false;
    
    if (resPerfil.rows.length > 0) {
      descripcion = resPerfil.rows[0].descripcion;
      agrupar_insignias = resPerfil.rows[0].agrupar_insignias;
    }

    // 3. Obtener todas las insignias emitidas al usuario con su estado en el perfil público
    const queryInsignias = `
      SELECT 
        ie.id_insignia AS id,
        m.nombre AS microcredencial,
        m.descripcion AS microcredencial_descripcion,
        m.duracion_horas AS duracion,
        ie.png_baked_url,
        n.nombre AS nivel,
        ac.nombre AS area_conocimiento,
        ie.url_externo,
        ie.fecha_emision AS fecha_completa,
        TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY') AS fecha,
        CASE WHEN ip.insignia IS NOT NULL THEN true ELSE false END AS visible,
        COALESCE(ip.orden, 0) AS orden
      FROM insignia_emitida ie
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento ac ON m.area_conocimiento = ac.id_area
      LEFT JOIN insignias_perfil ip ON ie.id_insignia = ip.insignia AND ie.receptor = ip.receptor
      WHERE ie.receptor = $1 AND ie.estado = 1
      ORDER BY ip.orden ASC NULLS LAST, ie.fecha_emision DESC
    `;
    const resInsignias = await consultar(queryInsignias, [idReceptor]);

    res.status(200).json({
      exito: true,
      datos: {
        usuario,
        descripcion,
        agrupar_insignias,
        insignias: resInsignias.rows
      }
    });
  } catch (error) {
    console.error('Error en obtenerMiPerfil:', error);
    res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al obtener el perfil académico.' });
  }
};

const guardarConfiguracionPerfil = async (req, res) => {
  const { descripcion, agrupar_insignias, insignias_visibles } = req.body;
  const idReceptor = req.usuario.id;

  try {
    // Iniciar transacción de forma manual usando cliente o simular con promesas
    // Actualizar perfil_usuario
    const checkPerfil = await consultar('SELECT receptor FROM perfil_usuario WHERE receptor = $1', [idReceptor]);
    if (checkPerfil.rows.length === 0) {
      await consultar(
        'INSERT INTO perfil_usuario (receptor, descripcion, agrupar_insignias) VALUES ($1, $2, $3)',
        [idReceptor, descripcion, agrupar_insignias || false]
      );
    } else {
      await consultar(
        'UPDATE perfil_usuario SET descripcion = $2, agrupar_insignias = $3, ultima_actualizacion = now() WHERE receptor = $1',
        [idReceptor, descripcion, agrupar_insignias || false]
      );
    }

    // Actualizar insignias_perfil
    // Primero, eliminar todas las entradas anteriores del receptor
    await consultar('DELETE FROM insignias_perfil WHERE receptor = $1', [idReceptor]);

    // Insertar las nuevas configuraciones visibles
    if (Array.isArray(insignias_visibles) && insignias_visibles.length > 0) {
      // Filtrar solo las insignias que pertenecen al receptor para mayor seguridad
      for (const item of insignias_visibles) {
        // Validar que la insignia pertenece al receptor
        const checkInsignia = await consultar(
          'SELECT id_insignia FROM insignia_emitida WHERE id_insignia = $1 AND receptor = $2', 
          [item.id, idReceptor]
        );
        if (checkInsignia.rows.length > 0) {
          await consultar(
            'INSERT INTO insignias_perfil (receptor, insignia, orden) VALUES ($1, $2, $3)',
            [idReceptor, item.id, item.orden || 0]
          );
        }
      }
    }

    res.status(200).json({ exito: true, mensaje: 'Configuración del perfil guardada correctamente.' });
  } catch (error) {
    console.error('Error en guardarConfiguracionPerfil:', error);
    res.status(500).json({ exito: false, mensaje: 'Ocurrió un error al guardar la configuración del perfil.' });
  }
};

module.exports = {
  obtenerMiPerfil,
  guardarConfiguracionPerfil
};

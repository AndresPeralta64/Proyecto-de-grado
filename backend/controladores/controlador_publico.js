const { consultar } = require('../servicios/base_datos');

// 1. Obtener catálogo de microcredenciales aprobadas
const obtenerCatalogoMicrocredenciales = async (req, res) => {
  try {
    const query = `
      SELECT 
        m.id_microcredencial, m.nombre, m.descripcion, m.criterios_evaluacion, 
        m.duracion_horas, m.competencias, m.imagen_url, m.creado_en,
        nm.nombre as nivel_nombre,
        ac.nombre as area_nombre,
        u.nombres as emisor_nombres, u.apellidos as emisor_apellidos
      FROM microcredencial m
      JOIN nivel_microcredencial nm ON m.nivel = nm.id_nivel
      JOIN area_conocimiento ac ON m.area_conocimiento = ac.id_area
      JOIN usuario u ON m.emisor = u.id_usuario
      WHERE m.estado = 2 AND m.eliminado = false
      ORDER BY m.creado_en DESC
    `;
    const result = await consultar(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({ error: 'Error al obtener el catálogo de microcredenciales' });
  }
};

// 2. Obtener acreedores de una microcredencial específica
const obtenerAcreedoresMicrocredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        u.cedula, u.nombres, u.apellidos, u.foto_url,
        ie.fecha_emision, ie.id_global, ie.url_externo
      FROM insignia_emitida ie
      JOIN usuario u ON ie.receptor = u.id_usuario
      WHERE ie.microcredencial = $1 AND ie.estado = 1
      ORDER BY ie.fecha_emision DESC
    `;
    const result = await consultar(query, [id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener acreedores:', error);
    res.status(500).json({ error: 'Error al obtener los acreedores de la microcredencial' });
  }
};

// 3. Buscar perfiles públicos de Receptores
const buscarPerfiles = async (req, res) => {
  try {
    const { q } = req.query;
    const busqueda = q ? `%${q}%` : '%';
    const query = `
      SELECT DISTINCT
        u.cedula, u.nombres, u.apellidos, u.foto_url,
        pu.descripcion
      FROM usuario u
      JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.receptor
      WHERE ur.rol = 3 AND u.activo = true 
      AND (u.nombres ILIKE $1 OR u.apellidos ILIKE $1 OR u.cedula ILIKE $1)
      ORDER BY u.apellidos ASC, u.nombres ASC
    `;
    const result = await consultar(query, [busqueda]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al buscar perfiles:', error);
    res.status(500).json({ error: 'Error al buscar perfiles de usuarios' });
  }
};

// 4. Obtener el perfil público de un usuario y sus insignias configuradas
const obtenerPerfilPublico = async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Primero, obtener los datos del usuario si es receptor
    const queryUsuario = `
      SELECT 
        u.id_usuario, u.cedula, u.nombres, u.apellidos, u.foto_url, u.correo,
        pu.descripcion, pu.agrupar_insignias
      FROM usuario u
      JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      LEFT JOIN perfil_usuario pu ON u.id_usuario = pu.receptor
      WHERE u.cedula = $1 AND ur.rol = 3 AND u.activo = true
    `;
    const resultUsuario = await consultar(queryUsuario, [cedula]);
    
    if (resultUsuario.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    const usuario = resultUsuario.rows[0];
    
    // Luego, obtener las insignias que el usuario ha marcado para su perfil público
    const queryInsignias = `
      SELECT 
        ie.id_global, ie.fecha_emision, ie.url_externo,
        m.nombre as microcredencial_nombre, m.descripcion as microcredencial_descripcion,
        m.imagen_url as microcredencial_imagen,
        nm.nombre as nivel_nombre,
        ac.nombre as area_nombre,
        ip.orden
      FROM insignias_perfil ip
      JOIN insignia_emitida ie ON ip.insignia = ie.id_insignia
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial nm ON m.nivel = nm.id_nivel
      JOIN area_conocimiento ac ON m.area_conocimiento = ac.id_area
      WHERE ip.receptor = $1 AND ie.estado = 1
      ORDER BY ip.orden ASC
    `;
    const resultInsignias = await consultar(queryInsignias, [usuario.id_usuario]);
    
    res.status(200).json({
      perfil: {
        cedula: usuario.cedula,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        foto_url: usuario.foto_url,
        descripcion: usuario.descripcion,
        agrupar_insignias: usuario.agrupar_insignias
      },
      insignias: resultInsignias.rows
    });
  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    res.status(500).json({ error: 'Error al obtener el perfil público del usuario' });
  }
};

module.exports = {
  obtenerCatalogoMicrocredenciales,
  obtenerAcreedoresMicrocredencial,
  buscarPerfiles,
  obtenerPerfilPublico
};

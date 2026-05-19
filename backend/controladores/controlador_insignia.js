const { consultar } = require('../servicios/base_datos');
const { descifrarAES } = require('../servicios/servicio_criptografia');
const { generarInsigniaFirmada } = require('../servicios/servicio_insignia');
const { enviarNotificacionEmision, enviarNotificacionRevocacion } = require('../servicios/servicio_correo');
const crypto = require('crypto');

/**
 * [HU-010] Emitir insignias digitales a uno o varios receptores
 */
const emitirInsignia = async (req, res) => {
  const { id_microcredencial, receptores } = req.body;
  const emisorId = req.usuario.id;
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';

  // Validar campos obligatorios
  if (!id_microcredencial || !receptores || !Array.isArray(receptores) || receptores.length === 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'La microcredencial y al menos un receptor son obligatorios.'
    });
  }

  try {
    // 1. Obtener la microcredencial y verificar estado
    const queryMicro = `SELECT * FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false`;
    const resMicro = await consultar(queryMicro, [id_microcredencial]);
    
    if (resMicro.rows.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La microcredencial seleccionada no existe o fue eliminada.'
      });
    }

    const microcredencial = resMicro.rows[0];

    // Verificar que esté aprobada (estado = 2)
    if (microcredencial.estado !== 2) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La microcredencial seleccionada debe estar Aprobada para permitir la emisión.'
      });
    }

    // Si el usuario es emisor (no admin), validar propiedad
    if (!esAdmin && microcredencial.emisor !== emisorId) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Acceso denegado: No tiene permisos para emitir esta microcredencial.'
      });
    }

    // 2. Obtener llaves de firma del emisor del sistema
    const configRes = await consultar('SELECT emisor_url, clave_publica, clave_privada FROM configuracion_sistema LIMIT 1');
    if (configRes.rows.length === 0) {
      return res.status(500).json({
        exito: false,
        mensaje: 'Error de configuración: no se han generado las claves criptográficas en el sistema.'
      });
    }
    const config = configRes.rows[0];
    const clavePrivadaJwk = descifrarAES(config.clave_privada, true);

    // 3. Comprobar si alguno de los receptores seleccionados ya posee la insignia
    const queryPrevios = `
      SELECT ie.*, u.nombres, u.apellidos
      FROM insignia_emitida ie
      JOIN usuario u ON ie.receptor = u.id_usuario
      WHERE ie.microcredencial = $1 AND ie.receptor = ANY($2)
    `;
    const previosRes = await consultar(queryPrevios, [id_microcredencial, receptores]);
    
    if (previosRes.rows.length > 0) {
      const repetido = previosRes.rows[0];
      return res.status(400).json({
        exito: false,
        mensaje: `El Receptor ${repetido.nombres} ${repetido.apellidos} ya tiene esta insignia.`
      });
    }

    // 4. Obtener información de los receptores y validar rol y vigencia
    const queryReceptores = `
      SELECT u.id_usuario, u.nombres, u.apellidos, u.correo
      FROM usuario u
      JOIN usuario_rol ur ON u.id_usuario = ur.usuario
      JOIN rol r ON ur.rol = r.id_rol
      WHERE u.id_usuario = ANY($1) AND r.nombre = 'Receptor' AND u.activo = true
    `;
    const receptoresRes = await consultar(queryReceptores, [receptores]);
    
    if (receptoresRes.rows.length !== receptores.length) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Uno o más receptores seleccionados no son válidos o están inactivos en el sistema.'
      });
    }

    const listaReceptores = receptoresRes.rows;

    // 5. Proceder a emitir e insertar en base de datos bajo transacción
    await consultar('BEGIN');
    const emisionesExitosas = [];

    for (const receptor of listaReceptores) {
      const uuid = crypto.randomUUID();
      const host = req.get('host');
      const protocolo = req.protocol;
      
      const urlMicrocredencial = `${protocolo}://${host}/api/microcredenciales/${id_microcredencial}`;
      const imagenInsigniaUrl = `${protocolo}://${host}${microcredencial.imagen_url}`;

      const datosInsignia = {
        idInsignia: uuid,
        urlEmisor: config.emisor_url,
        correoReceptor: receptor.correo,
        urlMicrocredencial,
        nombreMicrocredencial: microcredencial.nombre,
        descripcionMicrocredencial: microcredencial.descripcion,
        criteriosAprobacion: microcredencial.criterios_evaluacion,
        imagenInsigniaUrl
      };

      // Generar declaración firmada (validación de metadatos incorporada)
      const assertionFirmado = generarInsigniaFirmada(datosInsignia, clavePrivadaJwk);

      // Almacenar en la base de datos
      const urlPublica = `${process.env.URL_FRONTEND || 'http://localhost:4200'}/verificar/${uuid}`;
      const queryInsert = `
        INSERT INTO insignia_emitida (
          microcredencial, emisor, receptor, id_global, url_externo, 
          firma_JWS, certificado_publico, assertion_jsonld, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
        RETURNING id_insignia
      `;
      const insertRes = await consultar(queryInsert, [
        id_microcredencial,
        emisorId,
        receptor.id_usuario,
        uuid,
        urlPublica,
        assertionFirmado.proof.proofValue,
        `${config.emisor_url}#clave-publica`,
        JSON.stringify(assertionFirmado)
      ]);

      emisionesExitosas.push({
        id_insignia: insertRes.rows[0].id_insignia,
        correo: receptor.correo,
        nombreCompleto: `${receptor.nombres} ${receptor.apellidos}`,
        urlPublica,
        microcredencialNombre: microcredencial.nombre
      });
    }

    await consultar('COMMIT');

    // 6. Enviar las notificaciones por correo simuladas
    for (const emision of emisionesExitosas) {
      await enviarNotificacionEmision(
        emision.correo,
        emision.nombreCompleto,
        emision.microcredencialNombre,
        emision.urlPublica
      );
    }

    return res.status(201).json({
      exito: true,
      mensaje: 'Insignias emitidas y firmadas con éxito.'
    });

  } catch (error) {
    try {
      await consultar('ROLLBACK');
    } catch (rollbackErr) {}
    console.error('Error al emitir insignias:', error);
    return res.status(500).json({
      exito: false,
      mensaje: error.message || 'Ocurrió un error inesperado al procesar la emisión.'
    });
  }
};

/**
 * [HU-010] Buscar y filtrar historial de emisiones de insignias
 */
const listarHistorialEmisiones = async (req, res) => {
  const emisorId = req.usuario.id;
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';
  const soloPropias = req.query.soloPropias === 'true';
  const { search, microcredencialId, estado } = req.query;

  try {
    let query = `
      SELECT ie.id_insignia, ie.id_global, ie.url_externo, ie.fecha_emision, ie.estado,
             u_receptor.nombres AS receptor_nombres, u_receptor.apellidos AS receptor_apellidos, u_receptor.correo AS receptor_correo,
             u_emisor.nombres AS emisor_nombres, u_emisor.apellidos AS emisor_apellidos,
             m.nombre AS microcredencial_nombre, m.imagen_url AS microcredencial_imagen,
             ri.justificacion AS revocacion_justificacion, ri.revocado_en AS revocacion_fecha
      FROM insignia_emitida ie
      JOIN usuario u_receptor ON ie.receptor = u_receptor.id_usuario
      JOIN usuario u_emisor ON ie.emisor = u_emisor.id_usuario
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      WHERE 1=1
    `;
    const values = [];

    // Si el usuario es emisor (no administrador), solo mostramos sus emisiones.
    // Si es administrador, puede usar el query ?soloPropias=true para ver las suyas.
    if (!esAdmin || soloPropias) {
      values.push(emisorId);
      query += ` AND ie.emisor = $${values.length}`;
    }

    // Filtro por microcredencial específica
    if (microcredencialId) {
      values.push(Number(microcredencialId));
      query += ` AND ie.microcredencial = $${values.length}`;
    }

    // Filtro por estado
    if (estado) {
      values.push(Number(estado));
      query += ` AND ie.estado = $${values.length}`;
    }

    // Filtro por búsqueda
    if (search) {
      values.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(u_receptor.nombres) LIKE $${values.length} OR 
        LOWER(u_receptor.apellidos) LIKE $${values.length} OR 
        LOWER(u_receptor.correo) LIKE $${values.length} OR 
        LOWER(m.nombre) LIKE $${values.length}
      )`;
    }

    query += ` ORDER BY ie.fecha_emision DESC`;

    const resultado = await consultar(query, values);
    return res.status(200).json({
      exito: true,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al listar historial de emisiones:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de emisiones de insignias.'
    });
  }
};

/**
 * [HU-010] Revocar una insignia emitida
 */
const revocarInsignia = async (req, res) => {
  const { id_insignia, justificacion } = req.body;
  const emisorId = req.usuario.id;
  const esAdmin = req.usuario.nombre_rol === 'Administrador' || req.usuario.nombre_rol === 'ADMIN';

  // Validaciones
  if (!id_insignia) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El identificador de la insignia es requerido.'
    });
  }

  if (!justificacion || justificacion.trim() === '') {
    return res.status(400).json({
      exito: false,
      mensaje: 'La justificación es obligatoria.'
    });
  }

  try {
    // 1. Obtener la insignia para validación de permisos
    const queryInsignia = `
      SELECT ie.*, m.nombre AS microcredencial_nombre,
             u.nombres AS receptor_nombres, u.apellidos AS receptor_apellidos, u.correo AS receptor_correo
      FROM insignia_emitida ie
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN usuario u ON ie.receptor = u.id_usuario
      WHERE ie.id_insignia = $1
    `;
    const resInsignia = await consultar(queryInsignia, [id_insignia]);

    if (resInsignia.rows.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La insignia digital especificada no existe.'
      });
    }

    const insignia = resInsignia.rows[0];

    // Verificar permisos
    if (!esAdmin && insignia.emisor !== emisorId) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Acceso denegado: No tiene permisos para revocar esta insignia.'
      });
    }

    // Verificar si ya está revocada
    if (insignia.estado === 2) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La insignia seleccionada ya se encuentra revocada.'
      });
    }

    // 2. Ejecutar revocación en transacción
    await consultar('BEGIN');

    // Cambiar estado a Revocada (2)
    await consultar(`UPDATE insignia_emitida SET estado = 2 WHERE id_insignia = $1`, [id_insignia]);

    // Insertar registro de revocación
    await consultar(
      `INSERT INTO revocacion_insignia (insignia, revocado_por, justificacion, revocado_en)
       VALUES ($1, $2, $3, NOW())`,
      [id_insignia, emisorId, justificacion.trim()]
    );

    await consultar('COMMIT');

    // 3. Enviar correo de notificación simulado
    await enviarNotificacionRevocacion(
      insignia.receptor_correo,
      `${insignia.receptor_nombres} ${insignia.receptor_apellidos}`,
      insignia.microcredencial_nombre,
      justificacion.trim()
    );

    return res.status(200).json({
      exito: true,
      mensaje: 'Insignia revocada con éxito.'
    });

  } catch (error) {
    try {
      await consultar('ROLLBACK');
    } catch (rollbackErr) {}
    console.error('Error al revocar insignia:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Ocurrió un error inesperado al revocar la insignia.'
    });
  }
};

module.exports = {
  emitirInsignia,
  listarHistorialEmisiones,
  revocarInsignia
};

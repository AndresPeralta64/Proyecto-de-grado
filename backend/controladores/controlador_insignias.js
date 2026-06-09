const { consultar, pool } = require('../servicios/base_datos');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const extractChunks = require('png-chunks-extract');
const encodeChunks = require('png-chunks-encode');
const textChunk = require('png-chunk-text');
const bs58 = require('bs58');
const jsonld = require('jsonld');
const { firmarEd25519 } = require('../servicios/servicio_criptografia');
const { obtenerClaves } = require('../utilidades/llaves');
const { v4: uuidv4 } = require('uuid');

const trabajosEmision = new Map();

const emitirInsignias = async (req, res) => {
  const { idMicrocredencial, receptoresIds } = req.body;
  const idEmisor = req.usuario.id;

  if (!idMicrocredencial || !Array.isArray(receptoresIds) || receptoresIds.length === 0) {
    return res.status(400).json({ exito: false, mensaje: 'Datos de emisión incompletos o inválidos.' });
  }

  try {
    // 1. Validar que la microcredencial existe y está aprobada (estado 2)
    const queryMicrocredencial = 'SELECT * FROM microcredencial WHERE id_microcredencial = $1 AND eliminado = false';
    const resMicro = await consultar(queryMicrocredencial, [idMicrocredencial]);
    if (resMicro.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Microcredencial no encontrada.' });
    }
    const microcredencial = resMicro.rows[0];
    if (microcredencial.estado !== 2) {
      return res.status(400).json({ exito: false, mensaje: 'La microcredencial no está aprobada para emisión.' });
    }

    if (!microcredencial.metadata_ob3) {
      return res.status(500).json({ exito: false, mensaje: 'La microcredencial no posee la plantilla base metadata_ob3.' });
    }

    // 2. Obtener llaves del sistema
    const claves = await obtenerClaves();
    if (!claves || !claves.clave_privada) {
      return res.status(500).json({ exito: false, mensaje: 'No se encontraron las llaves criptográficas del sistema.' });
    }

    const host = claves.emisor_url || process.env.URL_BACKEND || 'http://localhost:3000';

    // 3. Consultas Bulk: Obtener información de todos los usuarios y validar duplicados a la vez
    const queryDuplicados = 'SELECT receptor FROM insignia_emitida WHERE microcredencial = $1 AND receptor = ANY($2::int[]) AND estado = 1';
    const resDuplicados = await consultar(queryDuplicados, [idMicrocredencial, receptoresIds]);
    const setDuplicados = new Set(resDuplicados.rows.map(r => r.receptor));

    const queryUsuarios = 'SELECT id_usuario, nombres, apellidos, correo FROM usuario WHERE id_usuario = ANY($1::int[])';
    const resUsuarios = await consultar(queryUsuarios, [receptoresIds]);
    const mapaUsuarios = {};
    resUsuarios.rows.forEach(u => mapaUsuarios[u.id_usuario] = u);

    // 4. Crear Trabajo en Background y responder al cliente inmediatamente
    const idTrabajo = uuidv4();
    trabajosEmision.set(idTrabajo, { estado: 'procesando', resultados: { emitidas: [], fallidas: [] } });

    res.status(202).json({
      exito: true,
      mensaje: 'Las insignias se están procesando',
      idTrabajo: idTrabajo
    });

    // 5. Iniciar procesamiento asíncrono "fire-and-forget"
    (async () => {
      try {
        const urlImagenOriginal = microcredencial.imagen_url;
        const filenameOriginal = urlImagenOriginal.substring(urlImagenOriginal.lastIndexOf('/') + 1);
        const rutaImagenOriginal = path.join(__dirname, '..', 'recursos', 'insignias', filenameOriginal);
        let bufferOriginal = null;
        if (fs.existsSync(rutaImagenOriginal)) {
          bufferOriginal = fs.readFileSync(rutaImagenOriginal);
        }

        const resultados = trabajosEmision.get(idTrabajo).resultados;
        const TAMAÑO_LOTE = 50;

        for (let i = 0; i < receptoresIds.length; i += TAMAÑO_LOTE) {
          const loteReceptores = receptoresIds.slice(i, i + TAMAÑO_LOTE);

          const promesasLote = loteReceptores.map(async (idReceptor) => {
            try {
              if (setDuplicados.has(idReceptor)) {
                resultados.fallidas.push({ idReceptor, razon: 'El Receptor ya tiene esta insignia activa' });
                return;
              }

              const receptor = mapaUsuarios[idReceptor];
              if (!receptor) {
                resultados.fallidas.push({ idReceptor, razon: 'Usuario receptor no encontrado' });
                return;
              }

              // c. Generar UUID y URL
              const idGlobal = uuidv4();
              const urlExterno = `${host}/api/public/assertions/${idGlobal}`;
              const fechaEmision = new Date().toISOString();

              // d. Construir Assertion JSON-LD (Open Badges 3.0)
              const assertion = {
                "@context": [
                  "https://www.w3.org/ns/credentials/v2",
                  "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
                ],
                "id": urlExterno,
                "type": ["VerifiableCredential", "OpenBadgeCredential"],
                "name": microcredencial.metadata_ob3.name,
                "issuer": {
                  "id": `${host}/api/public/issuer`,
                  "type": ["Profile"],
                  "name": "Escuela Superior Politécnica de Chimborazo (ESPOCH)",
                  "url": "https://www.espoch.edu.ec"
                },
                "validFrom": fechaEmision,
                "credentialSubject": {
                  "id": `mailto:${receptor.correo}`,
                  "type": ["AchievementSubject"],
                  "achievement": {
                    "id": microcredencial.metadata_ob3.id,
                    "type": ["Achievement"],
                    "name": microcredencial.metadata_ob3.name,
                    "description": microcredencial.metadata_ob3.description,
                    "criteria": microcredencial.metadata_ob3.criteria,
                    "image": microcredencial.metadata_ob3.image,
                    "inLanguage": "es"
                  }
                }
              };

              // e. Firmar criptográficamente
              const proofOptions = {
                "@context": assertion["@context"],
                "type": "DataIntegrityProof",
                "cryptosuite": "eddsa-rdfc-2022",
                "created": fechaEmision,
                "proofPurpose": "assertionMethod",
                "verificationMethod": `${host}/api/public/issuer#key-1`
              };

              const docCanon = await jsonld.normalize(assertion, { algorithm: 'URDNA2015', format: 'application/n-quads' });
              const proofCanon = await jsonld.normalize(proofOptions, { algorithm: 'URDNA2015', format: 'application/n-quads' });

              const hashDoc = crypto.createHash('sha256').update(docCanon).digest();
              const hashProof = crypto.createHash('sha256').update(proofCanon).digest();

              const dataToSign = Buffer.concat([hashProof, hashDoc]);
              const firmaBuffer = firmarEd25519(dataToSign, claves.clave_privada);
              const proofValueBase58 = 'z' + bs58.encode(firmaBuffer);

              delete proofOptions["@context"];

              const finalJsonLd = { ...assertion };
              finalJsonLd.proof = [{
                ...proofOptions,
                "proofValue": proofValueBase58
              }];

              // f. Badge Baking (PNG)
              let fotoUrlBaked = null;

              if (bufferOriginal) {
                const chunks = extractChunks(bufferOriginal);
                const openBadgesChunk = textChunk.encode('openbadges', JSON.stringify(finalJsonLd));
                chunks.splice(-1, 0, openBadgesChunk);
                const bufferBaked = encodeChunks(chunks);

                const fechaObj = new Date();
                const d = String(fechaObj.getDate()).padStart(2, '0');
                const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
                const y = fechaObj.getFullYear();
                const fechaFormateada = `${d}${m}${y}`;
                const ts = fechaObj.getTime();

                const nombreNuevo = `insignia-digital-baked-${idEmisor}-${idReceptor}-${fechaFormateada}-${ts}.png`;
                const rutaNueva = path.join(__dirname, '..', 'recursos', 'insignias_metadatos', nombreNuevo);
                
                await fs.promises.writeFile(rutaNueva, bufferBaked);
                fotoUrlBaked = `${host}/recursos/insignias_metadatos/${nombreNuevo}`;
              }

              // g. Guardar en Base de Datos
              const insertQuery = `
                INSERT INTO insignia_emitida (
                  microcredencial, emisor, receptor, id_global, url_externo, 
                  firma_JWS, certificado_publico, fecha_emision, png_baked_url, assertion_jsonld, estado
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
                RETURNING id_insignia
              `;

              await consultar(insertQuery, [
                idMicrocredencial, idEmisor, idReceptor, idGlobal, urlExterno, proofValueBase58,
                `${host}/api/public/issuer`, fechaEmision, fotoUrlBaked, finalJsonLd
              ]);

              resultados.emitidas.push({ idReceptor, idGlobal });

            } catch (errLoop) {
              console.error('Error al emitir para receptor', idReceptor, errLoop);
              resultados.fallidas.push({ idReceptor, razon: 'Error interno durante la emisión' });
            }
          });

          await Promise.all(promesasLote);
        }

        // Marcar el trabajo como completado
        trabajosEmision.set(idTrabajo, { estado: 'completado', resultados });
        
        // Limpiar el estado después de 5 minutos
        setTimeout(() => trabajosEmision.delete(idTrabajo), 5 * 60 * 1000);

      } catch (errBg) {
        console.error('Error general en procesamiento asíncrono:', errBg);
        trabajosEmision.set(idTrabajo, { estado: 'error', mensaje: 'Ocurrió un error inesperado al procesar las insignias.' });
      }
    })(); // Se invoca inmediatamente pero sin 'await' para no bloquear

  } catch (error) {
    console.error('Error al preparar la emisión de insignias:', error);
    return res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al preparar la emisión masiva.' });
  }
};

const consultarEstadoEmision = async (req, res) => {
  const { idTrabajo } = req.params;
  const trabajo = trabajosEmision.get(idTrabajo);

  if (!trabajo) {
    return res.status(404).json({ exito: false, mensaje: 'Trabajo de emisión no encontrado o ya expiró.' });
  }

  return res.status(200).json({ exito: true, datos: trabajo });
};

const obtenerHistorial = async (req, res) => {
  try {
    const idEmisor = req.usuario.id;
    const query = `
      SELECT 
        ie.id_insignia AS id,
        u.nombres || ' ' || u.apellidos AS receptor,
        u.correo AS receptor_correo,
        c.nombre AS carrera,
        m.nombre AS microcredencial,
        m.descripcion AS microcredencial_descripcion,
        m.duracion_horas AS duracion,
        m.imagen_url,
        ie.png_baked_url,
        n.nombre AS nivel,
        ie.url_externo,
        ie.fecha_emision AS fecha_completa,
        ri.revocado_en,
        ri.justificacion AS motivo_revocacion,
        rev_u.nombres || ' ' || rev_u.apellidos AS revocado_por_nombre,
        CASE 
          WHEN ie.estado = 1 THEN 'ACTIVA'
          WHEN ie.estado = 2 THEN 'REVOCADA'
          ELSE 'DESCONOCIDO'
        END AS estado,
        TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY HH24:MI') AS fecha
      FROM insignia_emitida ie
      JOIN usuario u ON ie.receptor = u.id_usuario
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      LEFT JOIN usuario rev_u ON ri.revocado_por = rev_u.id_usuario
      WHERE ie.emisor = $1
      ORDER BY ie.fecha_emision DESC
    `;
    const result = await consultar(query, [idEmisor]);
    res.status(200).json({ exito: true, datos: result.rows });
  } catch (error) {
    console.error('Error en obtenerHistorial:', error);
    res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al obtener el historial.' });
  }
};

const revocarInsignia = async (req, res) => {
  const { idInsignia } = req.params;
  const { justificacion } = req.body;
  const idRevocador = req.usuario.id;

  if (!justificacion || justificacion.trim() === '') {
    return res.status(400).json({ exito: false, mensaje: 'La justificación es obligatoria.' });
  }

  try {
    // Verificar que la insignia exista y no esté revocada
    const resInsignia = await consultar('SELECT estado FROM insignia_emitida WHERE id_insignia = $1', [idInsignia]);
    if (resInsignia.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Insignia no encontrada.' });
    }
    if (resInsignia.rows[0].estado === 2) {
      return res.status(400).json({ exito: false, mensaje: 'La insignia ya se encuentra revocada.' });
    }

    // Actualizar estado
    await consultar('UPDATE insignia_emitida SET estado = 2 WHERE id_insignia = $1', [idInsignia]);

    // Insertar justificación en revocacion_insignia
    await consultar(
      'INSERT INTO revocacion_insignia (insignia, revocado_por, justificacion) VALUES ($1, $2, $3)',
      [idInsignia, idRevocador, justificacion.trim()]
    );

    res.status(200).json({ exito: true, mensaje: 'Insignia revocada correctamente.' });
  } catch (error) {
    console.error('Error al revocar insignia:', error);
    res.status(500).json({ exito: false, mensaje: 'Ocurrió un error al revocar la insignia.' });
  }
};

const obtenerReceptoresConInsignia = async (req, res) => {
  const { idMicrocredencial } = req.params;
  try {
    const query = 'SELECT receptor FROM insignia_emitida WHERE microcredencial = $1 AND estado = 1';
    const result = await consultar(query, [idMicrocredencial]);
    const receptoresIds = result.rows.map(r => r.receptor);
    return res.status(200).json({ exito: true, datos: receptoresIds });
  } catch (error) {
    console.error('Error en obtenerReceptoresConInsignia:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener receptores.' });
  }
};

const obtenerHistorialGeneral = async (req, res) => {
  try {
    const query = `
      SELECT
        ie.id_insignia AS id,
        e.nombres || ' ' || e.apellidos AS emisor,
        e.correo AS emisor_correo,
        u.nombres || ' ' || u.apellidos AS receptor,
        u.correo AS receptor_correo,
        c.nombre AS carrera,
        m.nombre AS microcredencial,
        m.descripcion AS microcredencial_descripcion,
        m.duracion_horas AS duracion,
        m.imagen_url,
        ie.png_baked_url,
        n.nombre AS nivel,
        ie.url_externo,
        ie.fecha_emision AS fecha_completa,
        ri.revocado_en,
        ri.justificacion AS motivo_revocacion,
        rev_u.nombres || ' ' || rev_u.apellidos AS revocado_por_nombre,
        CASE 
          WHEN ie.estado = 1 THEN 'ACTIVA'
          WHEN ie.estado = 2 THEN 'REVOCADA'
          ELSE 'DESCONOCIDO'
        END AS estado,
        TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY HH24:MI') AS fecha
      FROM insignia_emitida ie
      JOIN usuario u ON ie.receptor = u.id_usuario
      JOIN usuario e ON ie.emisor = e.id_usuario
      LEFT JOIN carrera c ON u.carrera = c.id_carrera
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      LEFT JOIN usuario rev_u ON ri.revocado_por = rev_u.id_usuario
      ORDER BY ie.fecha_emision DESC
    `;
    const result = await consultar(query);
    return res.status(200).json({ exito: true, datos: result.rows });
  } catch (error) {
    console.error('Error en obtenerHistorialGeneral:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener historial general.' });
  }
};

const obtenerHistorialReceptor = async (req, res) => {
  try {
    const idReceptor = req.usuario.id;
    const query = `
      SELECT 
        ie.id_insignia AS id,
        ie.id_global,
        ue.nombres || ' ' || ue.apellidos AS emisor,
        ue.correo AS emisor_correo,
        m.nombre AS microcredencial,
        m.descripcion AS microcredencial_descripcion,
        m.criterios_evaluacion,
        m.competencias,
        a.nombre AS area_conocimiento,
        m.duracion_horas AS duracion,
        m.imagen_url,
        ie.png_baked_url,
        n.nombre AS nivel,
        ie.url_externo,
        ie.fecha_emision AS fecha_completa,
        ri.revocado_en,
        ri.justificacion AS motivo_revocacion,
        rev_u.nombres || ' ' || rev_u.apellidos AS revocado_por_nombre,
        CASE 
          WHEN ie.estado = 1 THEN 'ACTIVA'
          WHEN ie.estado = 2 THEN 'REVOCADA'
          ELSE 'DESCONOCIDO'
        END AS estado,
        TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY HH24:MI') AS fecha
      FROM insignia_emitida ie
      JOIN usuario ue ON ie.emisor = ue.id_usuario
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      LEFT JOIN usuario rev_u ON ri.revocado_por = rev_u.id_usuario
      WHERE ie.receptor = $1
      ORDER BY ie.fecha_emision DESC
    `;
    const result = await consultar(query, [idReceptor]);
    return res.status(200).json({ exito: true, datos: result.rows });
  } catch (error) {
    console.error('Error en obtenerHistorialReceptor:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener historial.' });
  }
};

const obtenerInsigniaPublica = async (req, res) => {
  try {
    const { idGlobal } = req.params;
    const query = `
      SELECT 
        ie.id_global,
        ue.nombres || ' ' || ue.apellidos AS emisor,
        ue.correo AS emisor_correo,
        m.nombre AS microcredencial,
        m.descripcion AS microcredencial_descripcion,
        m.criterios_evaluacion,
        m.competencias,
        a.nombre AS area_conocimiento,
        m.duracion_horas AS duracion,
        m.imagen_url,
        ie.png_baked_url,
        n.nombre AS nivel,
        ie.url_externo,
        ie.fecha_emision AS fecha_completa,
        ri.revocado_en,
        ri.justificacion AS motivo_revocacion,
        rev_u.nombres || ' ' || rev_u.apellidos AS revocado_por_nombre,
        CASE 
          WHEN ie.estado = 1 THEN 'ACTIVA'
          WHEN ie.estado = 2 THEN 'REVOCADA'
          ELSE 'DESCONOCIDO'
        END AS estado,
        TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY HH24:MI') AS fecha
      FROM insignia_emitida ie
      JOIN usuario ue ON ie.emisor = ue.id_usuario
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      LEFT JOIN usuario rev_u ON ri.revocado_por = rev_u.id_usuario
      WHERE ie.id_global = $1
    `;
    const result = await consultar(query, [idGlobal]);

    if (result.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Insignia no encontrada' });
    }

    return res.status(200).json({
      exito: true,
      datos: result.rows[0]
    });
  } catch (error) {
    console.error('Error en obtenerInsigniaPublica:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener la insignia' });
  }
};

module.exports = {
  obtenerHistorialGeneral,
  emitirInsignias,
  obtenerHistorial,
  revocarInsignia,
  obtenerReceptoresConInsignia,
  obtenerHistorialReceptor,
  obtenerInsigniaPublica,
  consultarEstadoEmision
};

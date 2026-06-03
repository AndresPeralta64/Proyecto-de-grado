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

    // Procesar cada receptor
    const resultados = { emitidas: [], fallidas: [] };

    for (let idReceptor of receptoresIds) {
      try {
        // a. Verificar si ya la tiene activa (estado = 1)
        const checkDuplicado = await consultar('SELECT id_insignia FROM insignia_emitida WHERE microcredencial = $1 AND receptor = $2 AND estado = 1', [idMicrocredencial, idReceptor]);
        if (checkDuplicado.rows.length > 0) {
          resultados.fallidas.push({ idReceptor, razon: 'El Receptor ya tiene esta insignia activa' });
          continue;
        }

        // b. Obtener info del receptor
        const resReceptor = await consultar('SELECT nombres, apellidos, correo FROM usuario WHERE id_usuario = $1', [idReceptor]);
        if (resReceptor.rows.length === 0) {
          resultados.fallidas.push({ idReceptor, razon: 'Usuario receptor no encontrado' });
          continue;
        }
        const receptor = resReceptor.rows[0];

        // c. Generar UUID y URL
        const idGlobal = uuidv4();
        const urlExterno = `${host}/api/public/assertions/${idGlobal}`;
        const fechaEmision = new Date().toISOString();

        // d. Construir Assertion JSON-LD (Open Badges 3.0)
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

        // e. Firmar criptográficamente (Ed25519 con canonización URDNA2015)
        const proofOptions = {
          "@context": assertion["@context"],
          "type": "DataIntegrityProof",
          "cryptosuite": "eddsa-rdfc-2022",
          "created": fechaEmision,
          "proofPurpose": "assertionMethod",
          "verificationMethod": `${host}/api/public/issuer#key-1`
        };

        // Canonizar aserción y proof por separado
        const docCanon = await jsonld.normalize(assertion, { algorithm: 'URDNA2015', format: 'application/n-quads' });
        const proofCanon = await jsonld.normalize(proofOptions, { algorithm: 'URDNA2015', format: 'application/n-quads' });

        // Hashear ambos resultados
        const hashDoc = crypto.createHash('sha256').update(docCanon).digest();
        const hashProof = crypto.createHash('sha256').update(proofCanon).digest();

        // Concatenar hashes (64 bytes en total)
        const dataToSign = Buffer.concat([hashProof, hashDoc]);
        
        // Firmar
        const firmaBuffer = firmarEd25519(dataToSign, claves.clave_privada);
        const proofValueBase58 = 'z' + bs58.encode(firmaBuffer);

        // Remover el contexto local del proof para no duplicar en el JSON final
        delete proofOptions["@context"];

        const finalJsonLd = { ...assertion };
        finalJsonLd.proof = [{
          ...proofOptions,
          "proofValue": proofValueBase58
        }];

        // f. Badge Baking (PNG)
        // Extraer filename original
        const urlImagenOriginal = microcredencial.imagen_url;
        const filenameOriginal = urlImagenOriginal.substring(urlImagenOriginal.lastIndexOf('/') + 1);
        const rutaImagenOriginal = path.join(__dirname, '..', 'recursos', 'insignias', filenameOriginal);

        let fotoUrlBaked = null;

        if (fs.existsSync(rutaImagenOriginal)) {
          const bufferOriginal = fs.readFileSync(rutaImagenOriginal);
          const chunks = extractChunks(bufferOriginal);
          
          // Crear chunk iTXt (según especificación, se recomienda usar texto plano en png-chunk-text para tEXt, 
          // pero para iTXt a veces requieren librerías más avanzadas. Usaremos png-chunk-text que genera un tEXt chunk
          // que la mayoría de validadores (como el de Open Badges) todavía soportan como fallback o soporte básico).
          // Para ser precisos con iTXt, se puede construir manualmente o dejar que un validador robusto lea el tEXt.
          const openBadgesChunk = textChunk.encode('openbadges', JSON.stringify(finalJsonLd));
          
          // Insertar antes del último chunk (IEND)
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
          fs.writeFileSync(rutaNueva, bufferBaked);
          
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
          idMicrocredencial,
          idEmisor,
          idReceptor,
          idGlobal,
          urlExterno,
          proofValueBase58,
          `${host}/api/public/issuer`,
          fechaEmision,
          fotoUrlBaked,
          finalJsonLd
        ]);

        resultados.emitidas.push({ idReceptor, idGlobal });

      } catch (errLoop) {
        console.error('Error al emitir para receptor', idReceptor, errLoop);
        resultados.fallidas.push({ idReceptor, razon: 'Error interno durante la emisión' });
      }
    } // Fin del for

    // Si fallaron todas, mostramos un error particular, especialmente si es porque ya las tenían
    if (resultados.emitidas.length === 0 && resultados.fallidas.length > 0) {
      const unicaRazon = resultados.fallidas.every(f => f.razon === 'El Receptor ya tiene esta insignia activa');
      if (unicaRazon) {
         return res.status(409).json({ exito: false, mensaje: 'Los receptores seleccionados ya tienen esta insignia.' });
      }
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'No se pudo emitir ninguna insignia.', 
        detalles: resultados.fallidas 
      });
    }

    return res.status(201).json({
      exito: true,
      mensaje: 'Insignias digitales emitidas correctamente',
      datos: resultados
    });

  } catch (error) {
    console.error('Error en emitirInsignias:', error);
    return res.status(500).json({ exito: false, mensaje: 'Ha ocurrido un error al emitir las insignias digitales.' });
  }
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
      ORDER BY ie.fecha_emision DESC
    `;
    const result = await consultar(query);
    return res.status(200).json({ exito: true, datos: result.rows });
  } catch (error) {
    console.error('Error en obtenerHistorialGeneral:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al obtener historial general.' });
  }
};

module.exports = {
  obtenerHistorialGeneral,
  emitirInsignias,
  obtenerHistorial,
  revocarInsignia,
  obtenerReceptoresConInsignia
};

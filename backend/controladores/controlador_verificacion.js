const { consultar } = require('../servicios/base_datos');
const { verificarRS256 } = require('../servicios/servicio_criptografia');

/**
 * Endpoint público para verificar una insignia digital sin requerir autenticación.
 */
async function verificarInsigniaPublica(req, res) {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El identificador global (UUID) de la insignia es requerido.'
      });
    }

    // 1. Consultar la insignia y toda la información relacionada en la base de datos
    const consultaInsignia = `
      SELECT ie.id_insignia, ie.id_global, ie.url_externo, ie.fecha_emision, ie.assertion_jsonld, ie.estado,
             u_receptor.nombres AS receptor_nombres, 
             u_receptor.apellidos AS receptor_apellidos, 
             u_receptor.correo AS receptor_correo,
             u_emisor.nombres AS emisor_nombres, 
             u_emisor.apellidos AS emisor_apellidos, 
             u_emisor.correo AS emisor_correo,
             m.nombre AS mc_nombre,
             m.descripcion AS mc_descripcion,
             m.criterios_evaluacion AS mc_criterios,
             m.imagen_url AS mc_imagen_url,
             m.duracion_horas AS mc_duracion,
             n.nombre AS nivel_nombre,
             a.nombre AS area_nombre,
             ri.justificacion AS revocacion_justificacion,
             ri.revocado_en AS revocacion_fecha
      FROM insignia_emitida ie
      JOIN usuario u_receptor ON ie.receptor = u_receptor.id_usuario
      JOIN usuario u_emisor ON ie.emisor = u_emisor.id_usuario
      JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial
      JOIN nivel_microcredencial n ON m.nivel = n.id_nivel
      JOIN area_conocimiento a ON m.area_conocimiento = a.id_area
      LEFT JOIN revocacion_insignia ri ON ie.id_insignia = ri.insignia
      WHERE ie.id_global = $1
    `;

    const resultadoInsignia = await consultar(consultaInsignia, [uuid]);

    if (resultadoInsignia.rows.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La insignia digital especificada no existe en el registro del sistema.'
      });
    }

    const registro = resultadoInsignia.rows[0];

    // 2. Consultar la clave pública configurada en el sistema
    const consultaConfig = `SELECT clave_publica FROM configuracion_sistema LIMIT 1`;
    const resultadoConfig = await consultar(consultaConfig);

    if (resultadoConfig.rows.length === 0) {
      return res.status(500).json({
        exito: false,
        mensaje: 'Error de configuración: no se encontraron las claves criptográficas del sistema.'
      });
    }

    const clavePublicaJwk = JSON.parse(resultadoConfig.rows[0].clave_publica);

    // 3. Realizar la verificación criptográfica de la firma digital (RS256)
    const assertion = { ...registro.assertion_jsonld };
    const proof = assertion.proof;
    let firmaValida = false;
    let errorVerificacion = null;

    if (!proof || !proof.proofValue) {
      errorVerificacion = 'La insignia no contiene una prueba de firma digital válida.';
    } else {
      try {
        const proofValue = proof.proofValue;
        
        // Aislar la declaración original removiendo la propiedad 'proof'
        const declaracionOriginal = { ...assertion };
        delete declaracionOriginal.proof;

        // Verificar la firma con la clave pública del sistema
        firmaValida = verificarRS256(declaracionOriginal, proofValue, clavePublicaJwk);
      } catch (err) {
        errorVerificacion = `Fallo en el proceso de descifrado/verificación: ${err.message}`;
      }
    }

    // 4. Mapear estado legible
    let estadoTexto = 'Pendiente';
    if (registro.estado === 1) {
      estadoTexto = 'Activa';
    } else if (registro.estado === 2) {
      estadoTexto = 'Revocada';
    }

    // 5. Responder al cliente público
    return res.status(200).json({
      exito: true,
      valido: firmaValida && registro.estado === 1,
      firmaValida,
      errorVerificacion,
      idGlobal: registro.id_global,
      urlExterno: registro.url_externo,
      fechaEmision: registro.fecha_emision,
      estado: estadoTexto,
      assertion: registro.assertion_jsonld,
      receptor: {
        nombres: registro.receptor_nombres,
        apellidos: registro.receptor_apellidos,
        correo: registro.receptor_correo
      },
      emisor: {
        nombres: registro.emisor_nombres,
        apellidos: registro.emisor_apellidos,
        correo: registro.emisor_correo
      },
      microcredencial: {
        nombre: registro.mc_nombre,
        descripcion: registro.mc_descripcion,
        criterios: registro.mc_criterios,
        imagenUrl: registro.mc_imagen_url,
        duracion: registro.mc_duracion,
        nivel: registro.nivel_nombre,
        area: registro.area_nombre
      },
      revocacion: registro.estado === 2 ? {
        justificacion: registro.revocacion_justificacion,
        fecha: registro.revocacion_fecha
      } : null
    });

  } catch (error) {
    console.error('Error en verificarInsigniaPublica:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Ocurrió un error inesperado al procesar la verificación pública.',
      error: error.message
    });
  }
}

module.exports = {
  verificarInsigniaPublica
};

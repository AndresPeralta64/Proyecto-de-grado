const { generarParClavesRSA, cifrarAES, descifrarAES } = require('../servicios/servicio_criptografia');
const { generarInsigniaFirmada } = require('../servicios/servicio_insignia');
const { consultar, pool } = require('../servicios/base_datos');
const crypto = require('crypto');

async function emitirInsigniaPrueba() {
  try {
    console.log('--- Iniciando Emisión de Insignia de Prueba ---');

    // 1. Verificar/generar claves del sistema
    let configRes = await consultar('SELECT emisor_url, clave_publica, clave_privada FROM configuracion_sistema LIMIT 1');
    let config;

    if (configRes.rows.length === 0) {
      console.log('Generando nuevas claves criptográficas de prueba...');
      const { clavePublica, clavePrivada } = await generarParClavesRSA();
      const clavePrivadaCifrada = cifrarAES(clavePrivada);
      const urlEmisor = 'https://microcredenciales.espoch.edu.ec';

      await consultar(
        'INSERT INTO configuracion_sistema (emisor_url, clave_publica, clave_privada) VALUES ($1, $2, $3)',
        [urlEmisor, JSON.stringify(clavePublica), clavePrivadaCifrada]
      );
      
      config = {
        emisor_url: urlEmisor,
        clave_publica: JSON.stringify(clavePublica),
        clave_privada: clavePrivadaCifrada
      };
      console.log('Claves inicializadas.');
    } else {
      config = configRes.rows[0];
      console.log('Claves criptográficas encontradas en la base de datos.');
    }

    // Descifrar clave privada
    const clavePrivadaJwk = descifrarAES(config.clave_privada, true);

    // 2. Asegurar existencia de Usuarios (Emisor y Receptor) y sus Roles
    // Emisor (Rol ID 2)
    let emisorRes = await consultar("SELECT id_usuario FROM usuario WHERE correo = $1", ['emisor.test@espoch.edu.ec']);
    let emisorId;
    if (emisorRes.rows.length === 0) {
      console.log('Creando usuario Emisor de prueba...');
      const insEmisor = await consultar(
        "INSERT INTO usuario (cedula, nombres, apellidos, correo, contrasenia, carrera, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario",
        ['9999999999', 'Emisor', 'Prueba', 'emisor.test@espoch.edu.ec', 'hashed_pass_123', 'Sistemas', '0999999999']
      );
      emisorId = insEmisor.rows[0].id_usuario;
      // Asignar rol Emisor (2)
      await consultar("INSERT INTO usuario_rol (usuario, rol) VALUES ($1, 2)", [emisorId]);
    } else {
      emisorId = emisorRes.rows[0].id_usuario;
    }

    // Receptor (Rol ID 3)
    let receptorRes = await consultar("SELECT id_usuario FROM usuario WHERE correo = $1", ['receptor.test@espoch.edu.ec']);
    let receptorId;
    if (receptorRes.rows.length === 0) {
      console.log('Creando usuario Receptor de prueba...');
      const insReceptor = await consultar(
        "INSERT INTO usuario (cedula, nombres, apellidos, correo, contrasenia, carrera, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario",
        ['8888888888', 'Receptor', 'Prueba', 'receptor.test@espoch.edu.ec', 'hashed_pass_123', 'Sistemas', '0988888888']
      );
      receptorId = insReceptor.rows[0].id_usuario;
      // Asignar rol Receptor (3)
      await consultar("INSERT INTO usuario_rol (usuario, rol) VALUES ($1, 3)", [receptorId]);
    } else {
      receptorId = receptorRes.rows[0].id_usuario;
    }

    // 3. Asegurar existencia de una Microcredencial Aprobada
    // Consultar primer nivel y área de conocimiento para evitar violaciones de clave foránea
    const niveles = await consultar('SELECT id FROM nivel_microcredencial LIMIT 1');
    const areas = await consultar('SELECT id FROM area_conocimiento LIMIT 1');
    if (niveles.rows.length === 0 || areas.rows.length === 0) {
      throw new Error('Es necesario que existan niveles y áreas de conocimiento pre-cargados en la base de datos.');
    }
    const nivelId = niveles.rows[0].id;
    const areaId = areas.rows[0].id;

    let microRes = await consultar("SELECT id_microcredencial FROM microcredencial WHERE nombre = $1", ['DESARROLLO DE SOFTWARE SEGURO']);
    let microId;
    if (microRes.rows.length === 0) {
      console.log('Creando Microcredencial aprobada de prueba...');
      const metadataMock = {
        id: "https://microcredenciales.espoch.edu.ec/microcredenciales/1",
        type: "Achievement",
        name: "DESARROLLO DE SOFTWARE SEGURO",
        description: "Certifica competencias avanzadas en el desarrollo de software seguro.",
        criteria: { narrative: "Aprobar el proyecto final con calificación superior a 80%." },
        image: { id: "https://microcredenciales.espoch.edu.ec/recursos/insignias/insignia-default.png", type: "Image" }
      };

      const insMicro = await consultar(
        `INSERT INTO microcredencial (
           emisor, nombre, descripcion, criterios_evaluacion, nivel, 
           duracion_horas, area_conocimiento, competencias, imagen_url, metadata_ob3, estado
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 2) RETURNING id_microcredencial`,
        [
          emisorId,
          'DESARROLLO DE SOFTWARE SEGURO',
          'Certifica competencias avanzadas en el desarrollo de software seguro.',
          'Aprobar el proyecto final con calificación superior a 80%.',
          nivelId,
          40,
          areaId,
          ['Seguridad', 'Criptografía', 'Desarrollo Web'],
          '/recursos/insignias/insignia-default.png',
          JSON.stringify(metadataMock)
        ]
      );
      microId = insMicro.rows[0].id_microcredencial;
    } else {
      microId = microRes.rows[0].id_microcredencial;
    }

    // 4. Limpiar cualquier emisión de prueba previa para evitar violación de llave única (microcredencial, receptor)
    const busquedaEmisionPrevia = await consultar(
      "SELECT id_insignia FROM insignia_emitida WHERE microcredencial = $1 AND receptor = $2",
      [microId, receptorId]
    );

    if (busquedaEmisionPrevia.rows.length > 0) {
      const prevId = busquedaEmisionPrevia.rows[0].id_insignia;
      console.log(`Limpiando registro previo de insignia (ID: ${prevId}) para permitir nueva emisión...`);
      await consultar("DELETE FROM revocacion_insignia WHERE insignia = $1", [prevId]);
      await consultar("DELETE FROM insignia_emitida WHERE id_insignia = $1", [prevId]);
    }

    // 5. Preparar datos para la firma conforme a Open Badges 3.0
    const idInsignia = crypto.randomUUID();
    const urlMicrocredencial = `https://microcredenciales.espoch.edu.ec/api/microcredenciales/${microId}`;
    const imagenInsigniaUrl = `https://microcredenciales.espoch.edu.ec/recursos/insignias/insignia-default.png`;

    const datosInsignia = {
      idInsignia,
      urlEmisor: config.emisor_url,
      correoReceptor: 'receptor.test@espoch.edu.ec',
      urlMicrocredencial,
      nombreMicrocredencial: 'DESARROLLO DE SOFTWARE SEGURO',
      descripcionMicrocredencial: 'Certifica competencias avanzadas en el desarrollo de software seguro.',
      criteriosAprobacion: 'Aprobar el proyecto final con calificación superior a 80%.',
      imagenInsigniaUrl
    };

    console.log('Generando y firmando declaración de insignia digital (Open Badges 3.0)...');
    const assertionFirmado = generarInsigniaFirmada(datosInsignia, clavePrivadaJwk);

    // 6. Insertar el registro en insignia_emitida
    const urlPublica = `http://localhost:4200/verificar/${idInsignia}`;
    console.log('Guardando registro firmado en insignia_emitida...');
    await consultar(
      `INSERT INTO insignia_emitida (
         microcredencial, emisor, receptor, id_global, url_externo, 
         firma_JWS, certificado_publico, assertion_jsonld, estado
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
      [
        microId,
        emisorId,
        receptorId,
        idInsignia,
        urlPublica,
        assertionFirmado.proof.proofValue,
        `${config.emisor_url}#clave-publica`,
        JSON.stringify(assertionFirmado)
      ]
    );

    console.log('\n================================================================');
    console.log('¡INSIGNIA DE PRUEBA EMITIDA CON ÉXITO!');
    console.log('ID Global:', idInsignia);
    console.log('URL de Verificación Pública (Front):');
    console.log(urlPublica);
    console.log('================================================================\n');

  } catch (error) {
    console.error('Error durante la emisión de prueba:', error);
  } finally {
    await pool.end();
  }
}

emitirInsigniaPrueba();

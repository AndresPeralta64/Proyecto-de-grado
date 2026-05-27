const { consultar } = require('../servicios/base_datos');
const crypto = require('crypto');
const { cifrarAES, descifrarAES } = require('../servicios/servicio_criptografia');

/**
 * Obtiene o genera las claves RSA para la firma de insignias (RS256)
 */
const obtenerClaves = async () => {
  const query = 'SELECT emisor_url, clave_publica, clave_privada FROM configuracion_sistema LIMIT 1';
  const res = await consultar(query);

  if (res.rows.length > 0) {
    const config = res.rows[0];
    try {
      // Descifrar la clave privada para uso en memoria
      config.clave_privada = descifrarAES(config.clave_privada);
    } catch (e) {
      console.warn('Advertencia: No se pudo descifrar la clave privada. Quizá no estaba cifrada.');
    }
    return config;
  }

  // Si no hay configuración, generar las claves RSA
  console.log('Generando par de claves RSA (2048) para la firma de insignias...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const puerto = process.env.PORT || 3000;
  const emisorUrl = process.env.URL_BACKEND || `http://localhost:${puerto}`;

  // Cifrar la clave privada antes de guardarla en la BD
  const clavePrivadaCifrada = cifrarAES(privateKey);

  const insertQuery = `
    INSERT INTO configuracion_sistema (emisor_url, clave_publica, clave_privada)
    VALUES ($1, $2, $3)
    RETURNING emisor_url, clave_publica, clave_privada
  `;

  await consultar(insertQuery, [emisorUrl, publicKey, clavePrivadaCifrada]);
  
  return {
    emisor_url: emisorUrl,
    clave_publica: publicKey,
    clave_privada: privateKey // En memoria se retorna sin cifrar para poder firmar
  };
};

module.exports = {
  obtenerClaves
};

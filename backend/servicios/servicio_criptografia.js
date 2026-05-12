const crypto = require('crypto');
require('dotenv').config();

// Configuración de AES
const CLAVE_SECRETA_AES = crypto.createHash('sha256').update(process.env.AES_SECRET_KEY || 'clave_por_defecto_32_bytes_minimo_!!').digest();
const ALGORITMO_AES = 'aes-256-cbc';
const LONGITUD_IV = 16;

/**
 * Genera un par de claves RSA de 2048 bits en formato JWK
 * @returns {Promise<Object>} Clave pública y privada en formato JWK
 */
const generarParClavesRSA = () => {
  return new Promise((resolver, rechazar) => {
    crypto.generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        format: 'jwk'
      },
      privateKeyEncoding: {
        format: 'jwk'
      }
    }, (error, clavePublica, clavePrivada) => {
      if (error) return rechazar(error);
      resolver({ clavePublica, clavePrivada });
    });
  });
};

/**
 * Cifra un texto o un objeto usando AES-256-CBC
 * @param {string|Object} datos - Datos a cifrar
 * @returns {string} Texto cifrado en formato IV:DATOS (hex)
 */
const cifrarAES = (datos) => {
  const texto = typeof datos === 'string' ? datos : JSON.stringify(datos);
  const iv = crypto.randomBytes(LONGITUD_IV);
  const cifrador = crypto.createCipheriv(ALGORITMO_AES, CLAVE_SECRETA_AES, iv);
  let cifrado = cifrador.update(texto, 'utf8', 'hex');
  cifrado += cifrador.final('hex');
  return `${iv.toString('hex')}:${cifrado}`;
};

/**
 * Descifra un texto cifrado con AES-256-CBC
 * @param {string} textoCifrado - Texto en formato IV:DATOS (hex)
 * @param {boolean} esObjeto - Si se desea retornar un objeto (para JWK)
 * @returns {string|Object} Texto original descifrado
 */
const descifrarAES = (textoCifrado, esObjeto = false) => {
  try {
    const [ivHex, datosCifradosHex] = textoCifrado.split(':');
    if (!ivHex || !datosCifradosHex) throw new Error('Formato de texto cifrado inválido');
    
    const iv = Buffer.from(ivHex, 'hex');
    const descifrador = crypto.createDecipheriv(ALGORITMO_AES, CLAVE_SECRETA_AES, iv);
    let descifrado = descifrador.update(datosCifradosHex, 'hex', 'utf8');
    descifrado += descifrador.final('utf8');
    
    return esObjeto ? JSON.parse(descifrado) : descifrado;
  } catch (error) {
    console.error('Error al descifrar:', error.message);
    throw new Error('Error en el proceso de descifrado');
  }
};

/**
 * Firma datos usando el algoritmo RS256 (RSA con SHA-256)
 * @param {Object|string} datos - Datos a firmar
 * @param {string|Object} clavePrivada - Clave privada (PEM o JWK)
 * @returns {string} Firma en formato base64
 */
const firmarRS256 = (datos, clavePrivada) => {
  const firma = crypto.createSign('RSA-SHA256');
  const contenido = typeof datos === 'string' ? datos : JSON.stringify(datos);
  firma.update(contenido);
  
  // Convertir clave si es JWK
  const llave = (typeof clavePrivada === 'object') 
    ? crypto.createPrivateKey({ key: clavePrivada, format: 'jwk' }) 
    : clavePrivada;
    
  return firma.sign(llave, 'base64');
};

/**
 * Verifica una firma RS256
 * @param {Object|string} datos - Datos originales
 * @param {string} firma - Firma en formato base64
 * @param {string|Object} clavePublica - Clave pública (PEM o JWK)
 * @returns {boolean} Verdadero si la firma es válida
 */
const verificarRS256 = (datos, firma, clavePublica) => {
  const verificador = crypto.createVerify('RSA-SHA256');
  const contenido = typeof datos === 'string' ? datos : JSON.stringify(datos);
  verificador.update(contenido);
  
  // Convertir clave si es JWK
  const llave = (typeof clavePublica === 'object') 
    ? crypto.createPublicKey({ key: clavePublica, format: 'jwk' }) 
    : clavePublica;
    
  return verificador.verify(llave, firma, 'base64');
};

module.exports = {
  generarParClavesRSA,
  cifrarAES,
  descifrarAES,
  firmarRS256,
  verificarRS256
};

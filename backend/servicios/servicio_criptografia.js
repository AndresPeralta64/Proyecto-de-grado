const crypto = require('crypto');
require('dotenv').config();

// Configuración de AES
const CLAVE_SECRETA_AES = crypto.createHash('sha256').update(process.env.AES_SECRET_KEY || 'clave_por_defecto_32_bytes_minimo_!!').digest();
const ALGORITMO_AES = 'aes-256-cbc';
const LONGITUD_IV = 16;

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

const firmarEd25519 = (datos, clavePrivadaJWK) => {
  const contenido = typeof datos === 'string' ? datos : JSON.stringify(datos);
  const llavePrivada = crypto.createPrivateKey({ key: clavePrivadaJWK, format: 'jwk' });
  const firmaBuffer = crypto.sign(null, Buffer.from(contenido), llavePrivada);
  return firmaBuffer; // Devuelve un Buffer para que el controlador lo codifique como guste (bs58, etc)
};

const generarParClavesEd25519 = () => {
  return new Promise((resolver, rechazar) => {
    crypto.generateKeyPair('ed25519', {
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

module.exports = {
  generarParClavesEd25519,
  cifrarAES,
  descifrarAES,
  firmarEd25519
};

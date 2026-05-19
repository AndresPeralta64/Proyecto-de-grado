const { firmarRS256 } = require('./servicio_criptografia');
const { validarMetadatosOpenBadges } = require('./validador_insignia');

/**
 * Genera una declaración (assertion) de insignia digital conforme al estándar Open Badges 3.0
 * @param {Object} datosInsignia - Datos necesarios para la insignia
 * @param {string} clavePrivada - Clave privada del sistema para realizar la firma
 * @returns {Object} Objeto JSON-LD firmado con el campo proof
 */
const generarInsigniaFirmada = (datosInsignia, clavePrivada) => {
  const fechaActual = new Date().toISOString();
  
  // Estructura base conforme a Open Badges 3.0 y Verifiable Credentials v1
  const declaracion = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
    ],
    "id": `urn:uuid:${datosInsignia.idInsignia}`,
    "type": ["VerifiableCredential", "OpenBadgeCredential"],
    "issuer": {
      "id": datosInsignia.urlEmisor,
      "type": "Profile",
      "name": "Escuela Superior Politécnica de Chimborazo",
      "description": "Institución de Educación Superior Pública de Ecuador",
      "image": "https://www.espoch.edu.ec/logo-espoch.png",
      "email": "comunicacion@espoch.edu.ec"
    },
    "issuanceDate": fechaActual,
    "credentialSubject": {
      "id": `mailto:${datosInsignia.correoReceptor}`,
      "type": "AchievementSubject",
      "achievement": {
        "id": datosInsignia.urlMicrocredencial,
        "type": "Achievement",
        "name": datosInsignia.nombreMicrocredencial,
        "description": datosInsignia.descripcionMicrocredencial,
        "criteria": {
          "narrative": datosInsignia.criteriosAprobacion
        },
        "image": {
          "id": datosInsignia.imagenInsigniaUrl,
          "type": "Image"
        }
      }
    }
  };

  // Validar metadatos antes de firmar
  const resultadoValidacion = validarMetadatosOpenBadges(declaracion);
  if (!resultadoValidacion.valido) {
    const error = new Error('Los metadatos de la microcredencial no cumplen con el estándar Open Badges 3.0.');
    error.detalles = resultadoValidacion.errores;
    throw error;
  }

  // Generar la firma digital sobre el contenido de la declaración
  const valorFirma = firmarRS256(declaracion, clavePrivada);

  // Añadir la prueba de integridad (Proof) según el estándar de Linked Data Proofs
  declaracion.proof = {
    "type": "DataIntegrityProof",
    "cryptosuite": "rsa-2018",
    "created": fechaActual,
    "verificationMethod": `${datosInsignia.urlEmisor}#clave-publica`,
    "proofPurpose": "assertionMethod",
    "proofValue": valorFirma
  };

  return declaracion;
};

module.exports = {
  generarInsigniaFirmada
};

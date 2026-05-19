/**
 * Validador para la estructura de metadatos de Open Badges 3.0
 * Referencia: IMS Global / 1EdTech Open Badges Specification v3.0
 */

/**
 * Valida un formato de correo electrónico simple
 */
function esCorreoValido(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

/**
 * Valida un formato de URI (debe empezar con urn: o http: o https:)
 */
function esUriValida(uri) {
  if (typeof uri !== 'string') return false;
  return uri.startsWith('urn:') || uri.startsWith('http://') || uri.startsWith('https://');
}

/**
 * Valida una fecha en formato ISO 8601
 */
function esFechaIsoValida(fechaStr) {
  if (typeof fechaStr !== 'string') return false;
  const timestamp = Date.parse(fechaStr);
  return !isNaN(timestamp);
}

/**
 * Validador principal del documento JSON-LD conforme al estándar Open Badges 3.0
 * @param {Object} assertion - Objeto JSON-LD a validar
 * @returns {Object} { valido: boolean, errores: Array<string> }
 */
function validarMetadatosOpenBadges(assertion) {
  const errores = [];

  if (!assertion || typeof assertion !== 'object') {
    return { valido: false, errores: ['El documento de la credencial no es un objeto válido.'] };
  }

  // 1. Validar @context
  const contexto = assertion['@context'];
  if (!contexto) {
    errores.push("Falta el campo '@context'.");
  } else if (!Array.isArray(contexto)) {
    errores.push("El campo '@context' debe ser un arreglo de cadenas.");
  } else {
    const contieneCredv1 = contexto.includes('https://www.w3.org/2018/credentials/v1');
    const contieneOb3 = contexto.includes('https://purl.imsglobal.org/spec/ob/v3p0/context.json');
    if (!contieneCredv1) {
      errores.push("El campo '@context' debe incluir 'https://www.w3.org/2018/credentials/v1'.");
    }
    if (!contieneOb3) {
      errores.push("El campo '@context' debe incluir 'https://purl.imsglobal.org/spec/ob/v3p0/context.json'.");
    }
  }

  // 2. Validar id
  if (!assertion.id) {
    errores.push("Falta el identificador único de la credencial ('id').");
  } else if (!esUriValida(assertion.id)) {
    errores.push("El identificador único ('id') debe ser una URI válida (ej: 'urn:uuid:...').");
  }

  // 3. Validar type
  const tipo = assertion.type;
  if (!tipo) {
    errores.push("Falta el campo 'type'.");
  } else if (!Array.isArray(tipo)) {
    errores.push("El campo 'type' debe ser un arreglo de tipos.");
  } else {
    if (!tipo.includes('VerifiableCredential')) {
      errores.push("El campo 'type' debe incluir 'VerifiableCredential'.");
    }
    if (!tipo.includes('OpenBadgeCredential')) {
      errores.push("El campo 'type' debe incluir 'OpenBadgeCredential'.");
    }
  }

  // 4. Validar issuer
  const emisor = assertion.issuer;
  if (!emisor) {
    errores.push("Falta la información del emisor ('issuer').");
  } else if (typeof emisor !== 'object') {
    errores.push("El emisor ('issuer') debe ser un objeto detallado.");
  } else {
    if (!emisor.id || !esUriValida(emisor.id)) {
      errores.push("El emisor debe tener un 'id' que sea una URI o URL válida.");
    }
    if (emisor.type !== 'Profile') {
      errores.push("El tipo de perfil del emisor ('issuer.type') debe ser 'Profile'.");
    }
    if (!emisor.name || typeof emisor.name !== 'string' || emisor.name.trim() === '') {
      errores.push("El emisor debe tener un nombre ('issuer.name') no vacío.");
    }
    if (!emisor.email) {
      errores.push("Falta el correo electrónico del emisor ('issuer.email').");
    } else if (!esCorreoValido(emisor.email)) {
      errores.push("El correo electrónico del emisor ('issuer.email') no es válido.");
    }
    
    // Imagen del emisor
    if (!emisor.image) {
      errores.push("Falta la imagen del emisor ('issuer.image').");
    } else if (typeof emisor.image === 'object') {
      if (!emisor.image.id || !esUriValida(emisor.image.id)) {
        errores.push("La imagen del emisor ('issuer.image.id') debe ser una URL válida.");
      }
      if (emisor.image.type !== 'Image') {
        errores.push("El tipo de imagen del emisor ('issuer.image.type') debe ser 'Image'.");
      }
    } else if (typeof emisor.image !== 'string' || !esUriValida(emisor.image)) {
      errores.push("La imagen del emisor ('issuer.image') debe ser una cadena con URL válida o un objeto de imagen.");
    }
  }

  // 5. Validar issuanceDate
  if (!assertion.issuanceDate) {
    errores.push("Falta la fecha de emisión ('issuanceDate').");
  } else if (!esFechaIsoValida(assertion.issuanceDate)) {
    errores.push("La fecha de emisión ('issuanceDate') debe ser una marca de tiempo válida en formato ISO 8601.");
  }

  // 6. Validar credentialSubject
  const sujeto = assertion.credentialSubject;
  if (!sujeto) {
    errores.push("Falta el sujeto de la credencial ('credentialSubject').");
  } else if (typeof sujeto !== 'object') {
    errores.push("El sujeto de la credencial ('credentialSubject') debe ser un objeto.");
  } else {
    // ID del receptor (generalmente mailto:correo)
    if (!sujeto.id) {
      errores.push("Falta el identificador del receptor ('credentialSubject.id').");
    } else if (typeof sujeto.id !== 'string' || !sujeto.id.startsWith('mailto:')) {
      errores.push("El identificador del receptor ('credentialSubject.id') debe tener el formato 'mailto:correo@dominio.com'.");
    } else {
      const correo = sujeto.id.replace('mailto:', '');
      if (!esCorreoValido(correo)) {
        errores.push("El correo del receptor en 'credentialSubject.id' es inválido.");
      }
    }

    if (sujeto.type !== 'AchievementSubject') {
      errores.push("El tipo de sujeto de credencial ('credentialSubject.type') debe ser 'AchievementSubject'.");
    }

    // Achievement (Logro / Microcredencial)
    const logro = sujeto.achievement;
    if (!logro) {
      errores.push("Falta el logro académico ('credentialSubject.achievement').");
    } else if (typeof logro !== 'object') {
      errores.push("El logro académico ('credentialSubject.achievement') debe ser un objeto.");
    } else {
      if (!logro.id || !esUriValida(logro.id)) {
        errores.push("El logro debe tener un 'id' que sea una URI válida.");
      }
      if (logro.type !== 'Achievement') {
        errores.push("El tipo de logro ('credentialSubject.achievement.type') debe ser 'Achievement'.");
      }
      if (!logro.name || typeof logro.name !== 'string' || logro.name.trim() === '') {
        errores.push("El nombre de la microcredencial ('achievement.name') es obligatorio.");
      }
      if (!logro.description || typeof logro.description !== 'string' || logro.description.trim() === '') {
        errores.push("La descripción de la microcredencial ('achievement.description') es obligatoria.");
      }

      // Criterios de evaluación
      if (!logro.criteria || typeof logro.criteria !== 'object') {
        errores.push("Falta la configuración de criterios ('achievement.criteria').");
      } else if (!logro.criteria.narrative || typeof logro.criteria.narrative !== 'string' || logro.criteria.narrative.trim() === '') {
        errores.push("La narrativa de los criterios ('achievement.criteria.narrative') es obligatoria.");
      }

      // Imagen de insignia
      if (!logro.image) {
        errores.push("Falta la imagen de la insignia ('achievement.image').");
      } else if (typeof logro.image !== 'object') {
        errores.push("La imagen de la insignia ('achievement.image') debe ser un objeto.");
      } else {
        if (!logro.image.id || !esUriValida(logro.image.id)) {
          errores.push("La URL de la imagen de la insignia ('achievement.image.id') debe ser una URL válida.");
        }
        if (logro.image.type !== 'Image') {
          errores.push("El tipo de la imagen de insignia ('achievement.image.type') debe ser 'Image'.");
        }
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

module.exports = {
  validarMetadatosOpenBadges
};

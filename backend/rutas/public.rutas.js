const express = require('express');
const router = express.Router();
const { consultar } = require('../servicios/base_datos');
const { obtenerClaves } = require('../utilidades/llaves');
const { obtenerInsigniaPublica } = require('../controladores/controlador_insignias');

// Perfil del Emisor y Llave Pública
router.get('/issuer', async (req, res) => {
  try {
    const claves = await obtenerClaves();
    const host = claves.emisor_url || process.env.URL_BACKEND || 'http://localhost:3000';

    const issuerProfile = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
      ],
      "id": `${host}/api/public/issuer`,
      "type": ["Profile"],
      "name": "Escuela Superior Politécnica de Chimborazo (ESPOCH)",
      "url": "https://www.espoch.edu.ec",
      "publicKey": [
        {
          "id": `${host}/api/public/issuer#key-1`,
          "type": "JsonWebKey2020",
          "controller": `${host}/api/public/issuer`,
          "publicKeyJwk": claves.clave_publica
        }
      ]
    };
    
    res.json(issuerProfile);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil del emisor' });
  }
});

// Aserción (Insignia emitida)
router.get('/assertions/:idGlobal', async (req, res) => {
  try {
    const { idGlobal } = req.params;
    const query = 'SELECT assertion_jsonld, estado FROM insignia_emitida WHERE id_global = $1';
    const result = await consultar(query, [idGlobal]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aserción no encontrada' });
    }

    const { assertion_jsonld, estado } = result.rows[0];

    // Si está revocada, en un entorno estricto podríamos retornar un 410 Gone,
    // o incluir el campo revoked: true. Para simplicidad, solo retornamos el json-ld, 
    // Open Badges 3.0 sugiere manejar revocación en el issuer profile o endpoint de status.
    if (estado === 2) {
      assertion_jsonld.revoked = true;
    }

    res.json(assertion_jsonld);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la aserción' });
  }
});

// Detalles públicos de la insignia (para la página de compartir)
router.get('/insignia/:idGlobal', obtenerInsigniaPublica);

module.exports = router;

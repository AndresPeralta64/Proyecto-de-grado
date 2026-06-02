const { generarParClavesEd25519, cifrarAES } = require('../servicios/servicio_criptografia');
const { consultar, pool } = require('../servicios/base_datos');

/**
 * Script para inicializar las claves criptográficas del sistema
 * Genera un par de claves Ed25519, cifra la privada y las guarda en la tabla configuracion_sistema
 */
async function inicializarConfiguracion() {
  try {
    console.log('Iniciando configuración del sistema');

    // Verificar si ya existe una configuración
    const resultado = await consultar('SELECT id_config FROM configuracion_sistema LIMIT 1');

    if (resultado.rows.length > 0) {
      console.log('Aviso: El sistema ya cuenta con una configuración y claves registradas.');
      return;
    }

    console.log('Generando par de claves Ed25519 en formato JWK...');
    const { clavePublica, clavePrivada } = await generarParClavesEd25519();

    console.log('Cifrando la clave privada con AES-256 para almacenamiento seguro...');
    const clavePrivadaCifrada = cifrarAES(clavePrivada);

    // URL institucional por defecto
    const urlEmisor = 'https://microcredenciales.espoch.edu.ec';

    console.log('Guardando la configuración en la base de datos...');
    await consultar(
      'INSERT INTO configuracion_sistema (emisor_url, clave_publica, clave_privada) VALUES ($1, $2, $3)',
      [urlEmisor, JSON.stringify(clavePublica), clavePrivadaCifrada]
    );

    console.log('Proceso finalizado con éxito');
    console.log('Clave pública (JWK) y privada cifrada almacenadas correctamente.');
  } catch (error) {
    console.error('Error crítico durante la inicialización:', error.message);
  } finally {
    await pool.end();
  }
}

inicializarConfiguracion();

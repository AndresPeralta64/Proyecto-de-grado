const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Función para ejecutar consultas a la base de datos
 * @param {string} texto - La consulta SQL
 * @param {Array} parametros - Los parámetros para la consulta
 * @returns {Promise} - Resultado de la consulta
 */
const consultar = (texto, parametros) => {
  return pool.query(texto, parametros);
};

module.exports = {
  consultar,
  pool
};

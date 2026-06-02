const { pool } = require('./servicios/base_datos');

async function update() {
  await pool.query("UPDATE configuracion_sistema SET emisor_url = 'http://localhost:3000'");
  console.log("updated");
  process.exit(0);
}

update();

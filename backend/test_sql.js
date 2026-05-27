const { consultar } = require('./servicios/base_datos'); 
const idEmisor = 2; 
const query = `SELECT ie.id_insignia AS id, u.nombres || ' ' || u.apellidos AS receptor, u.correo AS receptor_correo, m.nombre AS microcredencial, m.duracion_horas AS duracion, ie.estado, TO_CHAR(ie.fecha_emision, 'DD/MM/YYYY') AS fecha FROM insignia_emitida ie JOIN usuario u ON ie.receptor = u.id_usuario JOIN microcredencial m ON ie.microcredencial = m.id_microcredencial WHERE ie.emisor = $1 ORDER BY ie.fecha_emision DESC`; 
consultar(query, [idEmisor]).then(r => console.log(r.rows)).catch(console.error).finally(()=>process.exit(0));

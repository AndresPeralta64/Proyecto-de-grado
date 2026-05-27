const { consultar } = require('./servicios/base_datos');
const { emitirInsignias } = require('./controladores/controlador_insignias');

(async () => {
    try {
        const micro = await consultar("SELECT id_microcredencial, metadata_ob3 FROM microcredencial WHERE nombre = 'Prueba microcredencial 3'");
        console.log(micro.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();

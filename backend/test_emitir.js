const { emitirInsignias } = require('./controladores/controlador_insignias');

(async () => {
    try {
        const req = {
            usuario: { id: 2 },
            body: {
                idMicrocredencial: 3,
                receptoresIds: [1, 2, 3]
            }
        };
        const res = {
            status: function(s) { 
                this.statusCode = s; 
                return this; 
            },
            json: function(data) {
                console.log('Status:', this.statusCode);
                console.log('Response:', JSON.stringify(data, null, 2));
            }
        };

        await emitirInsignias(req, res);
    } catch (e) {
        console.error('Crash:', e);
    } finally {
        process.exit();
    }
})();

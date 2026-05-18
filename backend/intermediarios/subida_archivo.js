const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta de destino existe
const carpetaDestino = path.join(__dirname, '../recursos/perfiles');
if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
}

const almacenamiento = multer.diskStorage({
    destination: (req, archivo, cb) => {
        cb(null, carpetaDestino);
    },
    filename: (req, archivo, cb) => {
        const extension = path.extname(archivo.originalname);
        
        // 1. Obtener ID de la persona que edita (quien realiza la petición)
        const idEditor = req.usuario ? req.usuario.id : 'sistema';
        
        // 2. Obtener ID del usuario al que pertenece el perfil
        let idTarget = 'nuevo';
        if (req.path === '/perfil') {
            idTarget = idEditor;
        } else if (req.params && req.params.id) {
            idTarget = req.params.id;
        } else {
            // Extraer ID como fallback si req.params no está totalmente mapeado aún
            const match = req.originalUrl.match(/\/api\/usuarios\/(\d+)/);
            if (match) {
                idTarget = match[1];
            }
        }
        
        // 3. Obtener la fecha actual en formato D-M-YYYY (ej. 1852026 para 18/05/2026)
        const ahora = new Date();
        const dia = ahora.getDate();
        const mes = ahora.getMonth() + 1; // Enero es 0
        const anio = ahora.getFullYear();
        const fechaStr = `${dia}${mes}${anio}`;
        
        // Formato final: foto-perfil-[idTarget]-[idEditor]-[fecha]-[timestamp].ext
        const nombreUnico = `foto-perfil-${idTarget}-${idEditor}-${fechaStr}-${Date.now()}${extension}`;
        cb(null, nombreUnico);
    }
});

const filtroArchivo = (req, archivo, cb) => {
    // Aceptar solo imágenes
    if (archivo.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, png, etc.)'), false);
    }
};

const subida = multer({ 
    storage: almacenamiento,
    fileFilter: filtroArchivo,
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB
});

module.exports = subida;

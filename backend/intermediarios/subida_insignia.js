const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta de destino existe
const carpetaDestino = path.join(__dirname, '../recursos/insignias');
if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
}

const almacenamiento = multer.diskStorage({
    destination: (req, archivo, cb) => {
        cb(null, carpetaDestino);
    },
    filename: (req, archivo, cb) => {
        const extension = path.extname(archivo.originalname) || '.png';
        
        // 1. Obtener ID de la persona que edita (quien realiza la petición)
        const idEditor = req.usuario ? req.usuario.id : 'sistema';
        
        // 2. Obtener la fecha actual en formato D-M-YYYY
        const ahora = new Date();
        const dia = ahora.getDate();
        const mes = ahora.getMonth() + 1; // Enero es 0
        const anio = ahora.getFullYear();
        const fechaStr = `${dia}${mes}${anio}`;
        
        // Formato temporal: insignia-digital-[idEditor]-temp-[fecha]-[timestamp].ext
        const nombreUnico = `insignia-digital-${idEditor}-temp-${fechaStr}-${Date.now()}${extension}`;
        cb(null, nombreUnico);
    }
});

const filtroArchivo = (req, archivo, cb) => {
    // Aceptar solo imágenes
    if (archivo.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (png, jpg, etc.)'), false);
    }
};

const subidaInsignia = multer({ 
    storage: almacenamiento,
    fileFilter: filtroArchivo,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

module.exports = subidaInsignia;

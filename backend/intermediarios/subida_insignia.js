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
        const extension = path.extname(archivo.originalname);
        
        // 1. Obtener ID del emisor
        const idEmisor = req.usuario ? req.usuario.id : 'sistema';
        
        // 2. Generar nombre de archivo único
        // Formato: insignia-[idEmisor]-[timestamp].ext
        const nombreUnico = `insignia-${idEmisor}-${Date.now()}${extension}`;
        cb(null, nombreUnico);
    }
});

const filtroArchivo = (req, archivo, cb) => {
    // Aceptar PNG, JPEG/JPG, SVG
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (tiposPermitidos.includes(archivo.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes en formato PNG, JPG o SVG'), false);
    }
};

const subidaInsignia = multer({ 
    storage: almacenamiento,
    fileFilter: filtroArchivo,
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB
});

module.exports = subidaInsignia;

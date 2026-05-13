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
        // Nombre de archivo único: perfil-ID-TIMESTAMP.ext
        const extension = path.extname(archivo.originalname);
        const nombreUnico = `perfil-${req.usuario.id}-${Date.now()}${extension}`;
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

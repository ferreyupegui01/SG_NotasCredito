import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORRECCIÓN: Subimos un nivel (..) para salir de 'middlewares' y entrar a 'uploads'
const uploadDir = path.join(__dirname, '../uploads');

// Crear la carpeta automáticamente si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Carpeta creada: ${uploadDir}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Limpiar nombre de archivo (quitar espacios) y agregar timestamp único
        const cleanName = file.originalname.replace(/\s+/g, '-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceptamos cualquier archivo (PDF, Imágenes, etc.)
    cb(null, true);
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });
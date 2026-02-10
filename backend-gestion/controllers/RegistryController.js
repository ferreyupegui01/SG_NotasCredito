import { RegistryService } from '../services/RegistryService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const RegistryController = {
    // 1. Crear Registro
    async create(req, res) {
        try {
            const data = { ...req.body, idEstado: 1 };
            const id = await RegistryService.createRegistry(data);
            res.status(201).json({ message: 'Registro creado', id });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear registro', error: error.message });
        }
    },

    // 2. Obtener Todos (Filtros)
    async getAll(req, res) {
        try {
            const { start, end, search } = req.query;
            const today = new Date().toISOString().split('T')[0];
            const startDate = start || today;
            const endDate = end || today;
            const searchTerm = search || null;

            const data = await RegistryService.getRegistriesWithStats(startDate, endDate, searchTerm);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener datos', error: error.message });
        }
    },

    // 3. Subir Archivo
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se ha proporcionado un archivo válido o el formato es incorrecto.' });
            }

            const { idRegistro, tipoAdjunto } = req.body;
            const file = req.file;

            const result = await RegistryService.uploadDocument(idRegistro, tipoAdjunto, file);
            res.json(result);
        } catch (error) {
            console.error('Error en upload:', error);
            res.status(500).json({ message: 'Error al procesar la subida del archivo', error: error.message });
        }
    },

    // 4. Eliminar (Soft Delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            await RegistryService.deleteRegistry(id);
            res.json({ message: 'Registro eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar', error: error.message });
        }
    },

    // 5. NUEVO: Ver Archivo Seguro (Streaming)
    async viewFile(req, res) {
        try {
            const { filename } = req.params;

            // Seguridad básica contra Directory Traversal
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({ message: 'Nombre de archivo inválido' });
            }

            // Subimos un nivel (..) para salir de controllers y buscar uploads en la raíz o donde esté configurado
            // Ajusta '../uploads' según tu estructura real. Si uploads está en raíz:
            const filePath = path.join(__dirname, '../uploads', filename);

            if (fs.existsSync(filePath)) {
                const ext = path.extname(filename).toLowerCase();
                let contentType = 'application/octet-stream';
                
                if (ext === '.pdf') contentType = 'application/pdf';
                else if (['.jpg', '.jpeg', '.png'].includes(ext)) contentType = 'image/jpeg';

                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                res.sendFile(filePath);
            } else {
                return res.status(404).json({ message: 'El archivo físico no existe.' });
            }
        } catch (error) {
            console.error('Error visualizando archivo:', error);
            res.status(500).json({ message: 'Error interno al procesar el archivo' });
        }
    }
};
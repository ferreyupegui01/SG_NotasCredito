import { Router } from 'express';
import { RegistryController } from '../controllers/RegistryController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = Router();

// --- SEGURIDAD: Todo requiere Token ---
router.use(verifyToken); 

// Rutas CRUD
router.get('/', RegistryController.getAll);
router.post('/', RegistryController.create);
router.post('/upload', upload.single('archivo'), RegistryController.upload);

// Eliminar (Solo SuperAdmin)
router.delete('/:id', verifyRole(['SuperAdmin']), RegistryController.delete);

// --- NUEVA RUTA PARA VER ARCHIVOS ---
router.get('/archivo/:filename', RegistryController.viewFile);

export default router;
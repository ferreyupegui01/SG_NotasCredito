import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = Router();

// --- SEGURIDAD: Solo SuperAdmin puede gestionar usuarios ---
router.use(verifyToken);
router.use(verifyRole(['SuperAdmin']));

// Definición de Endpoints
router.get('/', UserController.getAll);               // Ver lista
router.post('/', UserController.create);              // Crear
router.put('/:id', UserController.update);            // Editar
router.patch('/:id/status', UserController.toggleStatus); // Activar/Inactivar

export default router;
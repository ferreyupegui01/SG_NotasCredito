import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
// Importamos los middlewares
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);

// PROTEGIDO: Solo SuperAdmin puede crear usuarios nuevos (Inventario/Contabilidad)
router.post('/register', 
    verifyToken, 
    verifyRole(['SuperAdmin']), 
    AuthController.register
);

export default router;
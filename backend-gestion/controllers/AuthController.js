// controllers/AuthController.js
import { AuthService } from '../services/AuthService.js';

export const AuthController = {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            // Validaciones básicas
            if (!username || !password) {
                return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
            }

            const data = await AuthService.login(username, password);
            
            res.status(200).json({
                message: 'Login exitoso',
                ...data
            });

        } catch (error) {
            console.error('Error en Login:', error.message);
            // Si el error es conocido (credenciales), devolvemos 401, sino 500
            const status = error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta' 
                ? 401 
                : 500;
            
            res.status(status).json({ message: error.message });
        }
    },

    async register(req, res) {
        try {
            const { username, password, roleId } = req.body;
            await AuthService.register(username, password, roleId);
            res.status(201).json({ message: 'Usuario registrado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
        }
    }
};
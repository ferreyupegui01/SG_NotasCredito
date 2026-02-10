import { AuthService } from '../services/AuthService.js';

export const UserController = {
    // GET: Obtener todos
    async getAll(req, res) {
        try {
            const users = await AuthService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
        }
    },

    // POST: Crear usuario
    async create(req, res) {
        try {
            await AuthService.register(req.body);
            res.status(201).json({ message: 'Usuario creado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear usuario', error: error.message });
        }
    },

    // PUT: Actualizar usuario
    async update(req, res) {
        try {
            const { id } = req.params;
            await AuthService.updateUser(id, req.body);
            res.json({ message: 'Usuario actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
        }
    },

    // PATCH: Activar/Inactivar
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { activo } = req.body; // true o false
            await AuthService.toggleStatus(id, activo);
            res.json({ message: `Usuario ${activo ? 'activado' : 'inactivado'} correctamente` });
        } catch (error) {
            res.status(500).json({ message: 'Error al cambiar estado', error: error.message });
        }
    }
};
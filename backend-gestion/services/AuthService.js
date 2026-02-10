import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js';

export const AuthService = {
    // 1. LOGIN
    async login(username, password) {
        // Buscar usuario en BD (El SP ahora devuelve NombreCompleto y Activo)
        const user = await UserModel.findByUsername(username);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // --- VALIDACIÓN DE ESTADO ---
        // Si el usuario está marcado como inactivo (Activo = 0/false), bloqueamos el acceso.
        if (!user.Activo) {
            throw new Error('Usuario inactivo. Contacte al administrador.');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }

        // Generar Token JWT
        const token = jwt.sign(
            { 
                id: user.IdUsuario, 
                username: user.NombreUsuario, 
                role: user.NombreRol 
            },
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        return {
            token,
            user: {
                id: user.IdUsuario,
                username: user.NombreUsuario,
                fullName: user.NombreCompleto, // <--- DATO CLAVE PARA EL SALUDO
                role: user.NombreRol
            }
        };
    },

    // 2. REGISTRAR USUARIO
    async register(data) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(data.password, salt);
        
        return await UserModel.createUser({ 
            ...data, 
            passwordHash: hash 
        });
    },

    // 3. OBTENER TODOS LOS USUARIOS
    async getAllUsers() {
        return await UserModel.getAll();
    },

    // 4. ACTUALIZAR USUARIO
    async updateUser(id, data) {
        let passwordHash = null;
        
        // Solo hasheamos si el usuario escribió una nueva contraseña
        if (data.password && data.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(data.password, salt);
        }

        return await UserModel.update(id, { ...data, passwordHash });
    },

    // 5. CAMBIAR ESTADO (Activar/Inactivar)
    async toggleStatus(id, status) {
        return await UserModel.updateStatus(id, status);
    }
};
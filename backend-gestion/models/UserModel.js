import { getConnection, sql } from '../config/db.js';

export const UserModel = {
    // Buscar usuario por nombre (Para Login)
    async findByUsername(username) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('NombreUsuario', sql.NVarChar, username)
            .execute('sp_ObtenerUsuarioPorNombre');
        return result.recordset[0]; // Retorna usuario con campo Activo
    },

    // Crear Usuario
    async createUser(data) {
        const pool = await getConnection();
        await pool.request()
            .input('NombreUsuario', sql.NVarChar, data.username) // Cédula
            .input('PasswordHash', sql.NVarChar, data.passwordHash)
            .input('IdRol', sql.Int, data.roleId)
            .input('NombreCompleto', sql.NVarChar, data.nombreCompleto)
            .input('Area', sql.NVarChar, data.area)
            .input('Cargo', sql.NVarChar, data.cargo)
            .execute('sp_RegistrarUsuario');
        return { message: 'Usuario creado exitosamente' };
    },

    // Obtener lista completa
    async getAll() {
        const pool = await getConnection();
        const result = await pool.request().execute('sp_ObtenerUsuarios');
        return result.recordset;
    },

    // Editar Usuario
    async update(id, data) {
        const pool = await getConnection();
        await pool.request()
            .input('IdUsuario', sql.Int, id)
            .input('NombreUsuario', sql.NVarChar, data.username)
            .input('NombreCompleto', sql.NVarChar, data.nombreCompleto)
            .input('Area', sql.NVarChar, data.area)
            .input('Cargo', sql.NVarChar, data.cargo)
            .input('IdRol', sql.Int, data.roleId)
            .input('PasswordHash', sql.NVarChar, data.passwordHash || null) // null si no se cambia
            .execute('sp_EditarUsuario');
        return { message: 'Usuario actualizado correctamente' };
    },

    // Cambiar Estado (Activo/Inactivo)
    async updateStatus(id, nuevoEstado) {
        const pool = await getConnection();
        await pool.request()
            .input('IdUsuario', sql.Int, id)
            .input('NuevoEstado', sql.Bit, nuevoEstado)
            .execute('sp_CambiarEstadoUsuario');
    }
};
import { getConnection, sql } from '../config/db.js';

export const RegistryModel = {
    // 1. CREAR NUEVO REGISTRO
    async create(data) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('TipoDocumento', sql.NVarChar, data.tipoDocumento)
            .input('FechaEmision', sql.Date, data.fechaEmision)
            .input('FechaRecepcion', sql.Date, data.fechaRecepcion)
            .input('NitEmisor', sql.NVarChar, data.nitEmisor)
            .input('NombreEmisor', sql.NVarChar, data.nombreEmisor)
            .input('Iva', sql.Decimal(18, 2), data.iva)
            .input('Total', sql.Decimal(18, 2), data.total)
            .input('IdEstado', sql.Int, 1) // Estado inicial: 1 (Pendiente)
            .execute('sp_CrearRegistro');
        return result.recordset[0];
    },

    // 2. OBTENER LISTA DE REGISTROS (Con filtros)
    async getAll(fechaInicio, fechaFin, busqueda = null) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('FechaInicio', sql.Date, fechaInicio)
            .input('FechaFin', sql.Date, fechaFin)
            .input('Busqueda', sql.NVarChar, busqueda)
            .execute('sp_ObtenerRegistros');
        return result.recordset;
    },

    // 3. OBTENER ESTADÍSTICAS (Las tarjetas del Dashboard)
    async getStats(fechaInicio, fechaFin) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('FechaInicio', sql.Date, fechaInicio)
            .input('FechaFin', sql.Date, fechaFin)
            .execute('sp_ObtenerEstadisticas');
        // Retornamos el primer objeto (contiene los contadores)
        return result.recordset[0];
    },

    // 4. GUARDAR ARCHIVO ADJUNTO EN BD
    async saveAttachment(idRegistro, tipoAdjunto, rutaArchivo, nombreOriginal) {
        const pool = await getConnection();
        await pool.request()
            .input('IdRegistro', sql.Int, idRegistro)
            .input('TipoAdjunto', sql.NVarChar, tipoAdjunto)
            .input('RutaArchivo', sql.NVarChar, rutaArchivo)
            .input('NombreOriginal', sql.NVarChar, nombreOriginal)
            .execute('sp_GuardarAdjunto');
    },

    // 5. VERIFICAR DOCUMENTOS (Para cambio de estado automático)
    async checkDocuments(idRegistro) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('IdRegistro', sql.Int, idRegistro)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM Adjuntos WHERE IdRegistro = @IdRegistro AND TipoAdjunto = 'NOTA_CREDITO') as TieneNota,
                    (SELECT COUNT(*) FROM Adjuntos WHERE IdRegistro = @IdRegistro AND TipoAdjunto = 'SALIDA_INVENTARIO') as TieneSalida
            `);
        return result.recordset[0];
    },

    // 6. ACTUALIZAR ESTADO MANUALMENTE
    async updateStatus(idRegistro, nuevoEstado) {
        const pool = await getConnection();
        await pool.request()
            .input('IdEstado', sql.Int, nuevoEstado)
            .input('IdRegistro', sql.Int, idRegistro)
            .query('UPDATE Registros SET IdEstado = @IdEstado WHERE IdRegistro = @IdRegistro');
    },

    // 7. ELIMINAR REGISTRO (NUEVO - Solo para SuperAdmin)
    async delete(idRegistro) {
        const pool = await getConnection();
        await pool.request()
            .input('IdRegistro', sql.Int, idRegistro)
            .execute('sp_EliminarRegistro');
    }
};
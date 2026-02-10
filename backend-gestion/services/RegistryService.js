import { RegistryModel } from '../models/RegistryModel.js';

export const RegistryService = {
    async createRegistry(data) {
        return await RegistryModel.create(data);
    },

    async getRegistriesWithStats(startDate, endDate, search) {
        const [registros, estadisticas] = await Promise.all([
            RegistryModel.getAll(startDate, endDate, search),
            RegistryModel.getStats(startDate, endDate)
        ]);
        return { registros, estadisticas };
    },

    async uploadDocument(idRegistro, tipoAdjunto, file) {
        if (!file) throw new Error('No se ha subido ningún archivo');
        
        // Guardamos ruta relativa (aunque ahora la usaremos solo para extraer el nombre)
        const relativePath = `/uploads/${file.filename}`.replace(/\\/g, '/');
        
        await RegistryModel.saveAttachment(idRegistro, tipoAdjunto, relativePath, file.originalname);
        
        const { TieneNota, TieneSalida } = await RegistryModel.checkDocuments(idRegistro);
        
        let nuevoEstado = 1; 
        if (TieneNota > 0 && TieneSalida > 0) {
            nuevoEstado = 3; // Realizado
        } else if (TieneNota > 0 || TieneSalida > 0) {
            nuevoEstado = 2; // En Proceso
        }

        await RegistryModel.updateStatus(idRegistro, nuevoEstado);
        
        return { 
            message: 'Archivo subido y estado actualizado', 
            path: relativePath,
            nuevoEstado: nuevoEstado
        };
    },

    async deleteRegistry(idRegistro) {
        // Lógica de borrado (Soft Delete en BD)
        await RegistryModel.delete(idRegistro);
        return { message: 'Registro eliminado correctamente' };
    }
};
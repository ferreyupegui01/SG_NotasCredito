import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuración SGC (Adaptada a tus variables del .env)
export const configSGC = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME, // <--- Aquí estaba el error, ahora usa DB_NAME
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        // Convertimos el string 'true'/'false' del .env a booleano real
        encrypt: process.env.DB_ENCRYPT === 'true', 
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true
    },
};

// Pool Singleton (Solo para la base de datos principal)
let poolSGC = null;

// Conexión Principal
export async function getConnection() {
    try {
        if (!poolSGC) {
            console.log('------------------------------------------------');
            console.log('🔄 Conectando a SQL Server...');
            console.log(`📡 Servidor: ${configSGC.server}`);
            console.log(`🗄️  Base de Datos: ${configSGC.database}`);
            console.log('------------------------------------------------');
            
            poolSGC = await new sql.ConnectionPool(configSGC).connect();
            console.log('✅ Conexión a SQL Server exitosa.');
        }
        return poolSGC;
    } catch (error) {
        console.error('❌ Error crítico conectando a BD:', error);
        throw error;
    }
}

export { sql };
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar Rutas
import authRoutes from './routes/authRoutes.js';
import registryRoutes from './routes/registryRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- CAMBIO IMPORTANTE: COMENTAMOS O BORRAMOS ESTO ---
// Ya no serviremos uploads como estáticos por seguridad
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/auth', authRoutes); 
app.use('/api/registros', registryRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'API Online (Modo Seguro)', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
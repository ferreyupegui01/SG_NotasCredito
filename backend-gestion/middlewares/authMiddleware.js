import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Obtener el token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: Token no proporcionado' });
    }

    try {
        // 2. Verificar token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // { id, username, role }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// NUEVO: Middleware para verificar roles específicos
export const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user viene del verifyToken anterior
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}` 
            });
        }
        next();
    };
};
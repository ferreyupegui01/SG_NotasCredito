// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api.service.js';
import logoEmpresa from '../assets/logo.png'; // <-- AJUSTA EL NOMBRE DEL ARCHIVO (ej: logo.png)
import '../styles/login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Comunicación real con el backend Node.js + SQL Server
            const data = await authService.login(credentials); 
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                
                {/* PARTE IZQUIERDA: ROJA CON MENSAJE PERSONALIZADO */}
                <div className="login-left">
                    
                    <h1>Sistema de Gestión de Notas Crédito</h1>
                    <div className="divider-line"></div>
                    <p>Ingrese sus credenciales para acceder al módulo seleccionado.</p>
                </div>

                {/* PARTE DERECHA: BLANCA CON FORMULARIO */}
                <div className="login-right">
                    <div className="logo-container">
                        <img 
                            src={logoEmpresa} 
                            alt="Logo El Trece" 
                            className="logo-img" 
                        />
                    </div>

                    <h2>Empaquetados El Trece</h2>
                    <h3>Iniciar Sesión</h3>

                    {error && <p className="error-msg">{error}</p>}

                    <form onSubmit={handleSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div className="form-group">
                            <label>Usuario / Cédula</label>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    name="username" 
                                    placeholder="Ingrese su usuario" 
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <div className="input-wrapper">
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Ingrese su contraseña" 
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-ingresar" disabled={loading}>
                            {loading ? 'Validando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
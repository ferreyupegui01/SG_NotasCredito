import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api.service.js';
import UserModal from '../components/UserModal.jsx'; // <--- IMPORTAMOS EL MODAL
import Swal from 'sweetalert2';
import '../styles/dashboard.css';

const UsersAdmin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) { console.error(error); }
    };

    // Abrir modal para crear
    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    // Abrir modal para editar
    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    // Guardar (Crear o Editar)
    const handleSave = async (formData) => {
        try {
            if (editingUser) {
                await userService.update(editingUser.IdUsuario, formData);
                Swal.fire('Éxito', 'Usuario actualizado', 'success');
            } else {
                await userService.create(formData);
                Swal.fire('Éxito', 'Usuario creado', 'success');
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error desconocido', 'error');
        }
    };

    // TOGGLE ESTADO (Activar/Inactivar)
    const handleToggleStatus = async (user) => {
        const nuevoEstado = !user.Activo;
        const accion = nuevoEstado ? 'Activar' : 'Inactivar';
        const color = nuevoEstado ? '#10b981' : '#ef4444';

        const result = await Swal.fire({
            title: `¿${accion} usuario?`,
            text: `El usuario ${user.NombreUsuario} ${nuevoEstado ? 'podrá' : 'YA NO podrá'} ingresar al sistema.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: color,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await userService.toggleStatus(user.IdUsuario, nuevoEstado);
                loadUsers(); // Recargar lista para ver cambio de color
                Swal.fire('Listo', `Usuario ${accion.toLowerCase()}do correctamente.`, 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
            }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <header className="main-header" style={{background: '#1e293b'}}>
                <div className="header-brand">
                    <h1 style={{color: 'white'}}>🛠️ Gestión de Usuarios</h1>
                </div>
                <button className="btn-logout" onClick={() => navigate('/dashboard')}>⬅ Volver</button>
            </header>

            <main className="dashboard-content" style={{maxWidth: '1200px', marginTop: '2rem'}}>
                
                {/* BARRA SUPERIOR CON BOTÓN NUEVO */}
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
                    <button className="btn-new-record" onClick={handleCreate}>
                        <span>+</span> Nuevo Usuario
                    </button>
                </div>

                {/* TABLA */}
                <div className="table-container">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre Completo</th>
                                    <th>Área / Cargo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.IdUsuario} style={{opacity: user.Activo ? 1 : 0.6}}>
                                        <td style={{fontWeight: 'bold'}}>{user.NombreUsuario}</td>
                                        <td>{user.NombreCompleto}</td>
                                        <td>
                                            <div>{user.Area}</div>
                                            <small style={{color: '#64748b'}}>{user.Cargo}</small>
                                        </td>
                                        <td>{user.NombreRol}</td>
                                        <td>
                                            <span className={`status-badge ${user.Activo ? 'status-realizado' : 'status-pendiente'}`}>
                                                {user.Activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                <button 
                                                    className="btn-action" 
                                                    style={{background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74'}}
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    ✏️ Editar
                                                </button>

                                                <button 
                                                    className="btn-action"
                                                    style={{
                                                        background: user.Activo ? '#fef2f2' : '#ecfdf5',
                                                        color: user.Activo ? '#dc2626' : '#059669',
                                                        border: `1px solid ${user.Activo ? '#fecaca' : '#a7f3d0'}`
                                                    }}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.Activo ? '🚫 Inactivar' : '✅ Activar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL */}
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                editingUser={editingUser} 
            />
        </div>
    );
};

export default UsersAdmin;
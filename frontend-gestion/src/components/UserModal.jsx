import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/modals.css';

const UserModal = ({ isOpen, onClose, onSave, editingUser }) => {
    const initialState = {
        username: '', nombreCompleto: '', area: '', cargo: '', roleId: 2, password: ''
    };
    const [form, setForm] = useState(initialState);

    // Roles disponibles
    const roles = [
        { id: 2, name: 'Contabilidad' },
        { id: 3, name: 'Inventario' },
        { id: 1, name: 'SuperAdmin' }
    ];

    // Cargar datos si estamos editando
    useEffect(() => {
        if (editingUser) {
            setForm({
                username: editingUser.NombreUsuario,
                nombreCompleto: editingUser.NombreCompleto || '',
                area: editingUser.Area || '',
                cargo: editingUser.Cargo || '',
                roleId: editingUser.IdRol,
                password: '' // Contraseña limpia
            });
        } else {
            setForm(initialState);
        }
    }, [editingUser, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validación simple
        if (!editingUser && !form.password) {
            Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios', 'error');
            return;
        }
        onSave(form);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2 className="modal-title">
                    {editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </h2>
                <form onSubmit={handleSubmit} className="modal-form-grid">
                    
                    <div className="form-item">
                        <label>Cédula / Usuario</label>
                        <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                    </div>

                    <div className="form-item">
                        <label>Nombre Completo</label>
                        <input type="text" required value={form.nombreCompleto} onChange={e => setForm({...form, nombreCompleto: e.target.value})} />
                    </div>

                    <div className="form-item">
                        <label>Área</label>
                        <input type="text" required value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                    </div>

                    <div className="form-item">
                        <label>Cargo</label>
                        <input type="text" required value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
                    </div>

                    <div className="form-item">
                        <label>Rol</label>
                        <select value={form.roleId} onChange={e => setForm({...form, roleId: parseInt(e.target.value)})}>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    <div className="form-item">
                        <label>Contraseña {editingUser && <small>(Opcional)</small>}</label>
                        <input type="password" placeholder="********" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                    </div>

                    <div className="modal-actions full" style={{gridColumn: 'span 2'}}>
                        <button type="submit" className="btn-confirm">Guardar</button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
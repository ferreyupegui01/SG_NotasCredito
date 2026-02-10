import { useState } from 'react';
import { registryService } from '../services/api.service.js';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import '../styles/modals.css';

const RegistryModal = ({ isOpen, onClose, onRefresh }) => {
    // Estado inicial limpio
    const initialState = {
        tipoDocumento: '', 
        fechaEmision: '', 
        fechaRecepcion: '',
        nitEmisor: '', 
        nombreEmisor: '', 
        iva: '', 
        total: ''
    };
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Enviamos los datos. El backend asignará idEstado = 1 (Pendiente)
            await registryService.create({
                ...form,
                iva: parseFloat(form.iva),
                total: parseFloat(form.total)
            });
            
            setForm(initialState); // Limpiar formulario
            await onRefresh();     // Recargar tabla del dashboard
            onClose();             // Cerrar modal
            
            // --- ALERTA DE ÉXITO ---
            Swal.fire({
                icon: 'success',
                title: 'Registro Creado',
                text: 'La información se ha guardado correctamente.',
                confirmButtonColor: '#8b0000', // Rojo corporativo
                timer: 2000
            });

        } catch (err) { 
            console.error(err);
            // --- ALERTA DE ERROR ---
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el registro. Verifica los datos.',
                confirmButtonColor: '#8b0000'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2 className="modal-title">Nuevo Registro</h2>
                <form onSubmit={handleSubmit} className="modal-form-grid">
                    
                    <div className="form-item full">
                        <label>Nombre del Emisor / Empresa</label>
                        <input type="text" placeholder="Ej: Distribuidora El Trece" 
                            value={form.nombreEmisor}
                            onChange={e => setForm({...form, nombreEmisor: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>Tipo de Documento</label>
                        <input type="text" placeholder="Ej: Factura Electrónica" 
                            value={form.tipoDocumento}
                            onChange={e => setForm({...form, tipoDocumento: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>NIT del Emisor</label>
                        <input type="text" placeholder="NIT sin puntos" 
                            value={form.nitEmisor}
                            onChange={e => setForm({...form, nitEmisor: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>Fecha Emisión</label>
                        <input type="date" 
                            value={form.fechaEmision}
                            onChange={e => setForm({...form, fechaEmision: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>Fecha Recepción</label>
                        <input type="date" 
                            value={form.fechaRecepcion}
                            onChange={e => setForm({...form, fechaRecepcion: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>IVA ($)</label>
                        <input type="number" step="0.01" placeholder="0.00" 
                            value={form.iva}
                            onChange={e => setForm({...form, iva: e.target.value})} required />
                    </div>

                    <div className="form-item">
                        <label>Total ($)</label>
                        <input type="number" step="0.01" placeholder="0.00" 
                            value={form.total}
                            onChange={e => setForm({...form, total: e.target.value})} required />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-confirm" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Registro'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistryModal;
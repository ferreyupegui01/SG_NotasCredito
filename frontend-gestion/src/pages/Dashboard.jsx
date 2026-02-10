import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registryService } from '../services/api.service.js'; // Asegúrate de que este servicio tenga viewFileSecure
import RegistryModal from '../components/RegistryModal.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import Swal from 'sweetalert2';
import logoEmpresa from '../assets/logo.png'; 
import '../styles/dashboard.css';

const Dashboard = () => {
    // --- HOOKS ---
    const navigate = useNavigate();
    
    // --- 1. ESTADOS ---
    const [registros, setRegistros] = useState([]);
    const [stats, setStats] = useState({
        TotalGeneral: 0, 
        TotalIva: 0, 
        CantidadPendientes: 0, 
        CantidadRealizados: 0,
        FaltaSalidaInv: 0, 
        FaltaNotaCredito: 0
    });

    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: now.toISOString().split('T')[0]
        };
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadConfig, setUploadConfig] = useState({ id: null, type: null });

    // Estado del Usuario (Para el saludo y permisos)
    const [currentUser, setCurrentUser] = useState(null);

    // --- 2. FUNCIONES DE SEGURIDAD Y CARGA ---
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const loadData = useCallback(async () => {
        try {
            const query = `?start=${dateRange.start}&end=${dateRange.end}&search=${searchTerm}`;
            const data = await registryService.getRegistries(query);
            
            setRegistros(data.registros || []);
            const st = data.estadisticas || {};
            setStats({
                TotalGeneral: st.TotalGeneral || 0,
                TotalIva: st.TotalIva || 0,
                CantidadPendientes: st.CantidadPendientes || 0,
                CantidadRealizados: st.CantidadRealizados || 0,
                FaltaSalidaInv: st.FaltaSalidaInv || 0,
                FaltaNotaCredito: st.FaltaNotaCredito || 0
            });
      
        } catch (error) {
            console.error("Error al cargar datos:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                handleLogout();
            }
        }
    }, [dateRange, searchTerm]);

    useEffect(() => { 
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
            return;
        }

        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        loadData(); 
    }, [loadData, navigate]);

    // --- 3. ACCIONES PRINCIPALES ---

    // A. ELIMINAR (Solo SuperAdmin)
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el registro permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() });
                await registryService.delete(id);
                
                await loadData();
                Swal.fire('Eliminado', 'El registro ha sido borrado.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
        }
    };

    // B. ABRIR DOCUMENTO SEGURO (Lógica BLOB)
    // Esto evita que la ruta sea pública. Pide el archivo autenticado y lo abre en memoria.
    const openDocument = async (relativePath) => {
        if (!relativePath) return;

        // Extraer nombre del archivo
        const filename = relativePath.split('/').pop(); 

        try {
            Swal.fire({
                title: 'Abriendo documento...',
                didOpen: () => Swal.showLoading(),
                backdrop: `rgba(0,0,0,0.4)`
            });

            // 1. Pedir el Blob al servicio (api.service.js debe tener viewFileSecure)
            const blob = await registryService.viewFileSecure(filename);

            // 2. Crear URL temporal en memoria
            const fileUrl = window.URL.createObjectURL(blob);

            // 3. Abrir en nueva pestaña
            window.open(fileUrl, '_blank');

            Swal.close();
        } catch (error) {
            console.error("Error abriendo archivo:", error);
            Swal.fire('Error', 'No se pudo cargar el archivo. Verifica permisos o existencia.', 'error');
        }
    };

    // C. SUBIR ARCHIVO
    const triggerUpload = (reg, tipo) => {
        const id = reg.IdRegistro || reg.idRegistro;
        if (!id) return;
        setUploadConfig({ id, type: tipo });
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; 
                fileInputRef.current.click();
            }
        }, 100);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadConfig.id) return;

        const result = await Swal.fire({
            title: '¿Adjuntar documento?',
            text: `Archivo: ${file.name}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#8b0000',
            confirmButtonText: 'Sí, cargar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('idRegistro', uploadConfig.id);
        formData.append('tipoAdjunto', uploadConfig.type);

        try {
            Swal.fire({
                title: 'Subiendo...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            await registryService.uploadFile(formData);
            await loadData(); 
            
            Swal.fire({
                icon: 'success',
                title: '¡Subido!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) { 
            console.error(err);
            Swal.fire('Error', 'No se pudo subir el archivo', 'error');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- 4. RENDER ---
    const isSuperAdmin = currentUser?.role === 'SuperAdmin';
    const getStatusClass = (status) => status ? status.toLowerCase().replace('en ', '').split(' ')[0] : 'pendiente';

    return (
        <div className="dashboard-wrapper">
            <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange}/>

            <header className="main-header">
                <div className="header-brand">
                    <img src={logoEmpresa} alt="Logo" />
                    <h1>Gestión Empresarial</h1>
                </div>

                {currentUser && (
                    <div className="header-welcome">
                        Hola, bienvenido: 
                        <strong style={{marginLeft: '5px', fontSize: '1.2rem'}}>
                            {currentUser.fullName || currentUser.username}
                        </strong>
                    </div>
                )}
                
                <div className="header-actions">
                    {isSuperAdmin && (
                        <button 
                            className="btn-logout" 
                            style={{background: '#fbbf24', color: '#78350f', border: 'none', fontWeight: 'bold'}}
                            onClick={() => navigate('/admin-users')}
                        >
                            <span>👥</span> Usuarios
                        </button>
                    )}
                    
                    <button className="btn-logout" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="toolbar-card">
                    <div className="filters-wrapper">
                        <div className="input-group">
                            <label>📅 Fecha Inicial</label>
                            <input type="date" className="modern-input" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>📅 Fecha Final</label>
                            <input type="date" className="modern-input" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
                        </div>
                        <div className="input-group" style={{flex: 2}}>
                            <label>🔍 Buscar</label>
                            <input type="text" className="modern-input search-input" placeholder="NIT o nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn-new-record" onClick={() => setIsModalOpen(true)}>
                        <span>+</span> Nuevo Registro
                    </button>
                </section>

                <section className="stats-grid">
                    <div className="stat-card stat-total">
                        <span className="stat-title">Total General</span>
                        <div className="stat-value">${stats.TotalGeneral.toLocaleString('es-CO')}</div>
                    </div>
                    <div className="stat-card stat-iva">
                        <span className="stat-title">Total IVA</span>
                        <div className="stat-value">${stats.TotalIva.toLocaleString('es-CO')}</div>
                    </div>
                    <div className="stat-card stat-pending">
                        <span className="stat-title">Pendientes</span>
                        <div className="stat-value">{stats.CantidadPendientes}</div>
                        <span className="stat-desc">Sin gestionar</span>
                    </div>
                    <div className="stat-card stat-missing-inv">
                        <span className="stat-title">Falta Salida Inv.</span>
                        <div className="stat-value">{stats.FaltaSalidaInv}</div>
                        <span className="stat-desc" style={{color: '#7c3aed'}}>⚠️ Tiene Nota Crédito</span>
                    </div>
                    <div className="stat-card stat-missing-note">
                        <span className="stat-title">Falta Nota Crédito</span>
                        <div className="stat-value">{stats.FaltaNotaCredito}</div>
                        <span className="stat-desc" style={{color: '#d97706'}}>⚠️ Tiene Salida Inv.</span>
                    </div>
                    <div className="stat-card stat-done">
                        <span className="stat-title">Realizados</span>
                        <div className="stat-value">{stats.CantidadRealizados}</div>
                        <span className="stat-desc">Completados</span>
                    </div>
                </section>

                <div className="table-container">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Emisor / Tipo</th>
                                    <th>NIT</th>
                                    <th>Recepción</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                    <th className="text-center">Nota Crédito</th>
                                    <th className="text-center">Salida Inv.</th>
                                    {isSuperAdmin && <th className="text-center" style={{color: '#ef4444'}}>Admin</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {registros.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 9 : 8} style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
                                            No hay registros en este rango de fechas.
                                        </td>
                                    </tr>
                                ) : (
                                    registros.map((reg, index) => (
                                        <tr key={reg.IdRegistro || index}>
                                            <td>
                                                <div style={{fontWeight: '600', color: '#334155'}}>{reg.NombreEmisor}</div>
                                                <div style={{fontSize: '0.8rem', color: '#64748b'}}>{reg.TipoDocumento}</div>
                                            </td>
                                            <td>{reg.NitEmisor}</td>
                                            <td>{new Date(reg.FechaRecepcion).toLocaleDateString()}</td>
                                            <td style={{fontWeight: '700', color: '#1e293b'}}>${reg.Total?.toLocaleString('es-CO')}</td>
                                            <td>
                                                <span className={`status-badge status-${getStatusClass(reg.NombreEstado)}`}>
                                                    {reg.NombreEstado}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-details-link" onClick={() => setSelectedRecord(reg)}>Detalles</button>
                                            </td>
                                            
                                            {/* BOTONES DE DOCUMENTOS CON BLOB */}
                                            <td className="text-center">
                                                <button 
                                                    className={`btn-action ${reg.AdjuntoNotaCredito ? 'btn-view' : 'btn-upload'}`}
                                                    onClick={() => reg.AdjuntoNotaCredito ? openDocument(reg.AdjuntoNotaCredito) : triggerUpload(reg, 'NOTA_CREDITO')}
                                                >
                                                    {reg.AdjuntoNotaCredito ? '👁 Ver PDF' : '⬆ Cargar'}
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    className={`btn-action ${reg.AdjuntoSalidaInventario ? 'btn-view' : 'btn-upload-inv'}`}
                                                    onClick={() => reg.AdjuntoSalidaInventario ? openDocument(reg.AdjuntoSalidaInventario) : triggerUpload(reg, 'SALIDA_INVENTARIO')}
                                                >
                                                    {reg.AdjuntoSalidaInventario ? '👁 Ver PDF' : '⬆ Cargar'}
                                                </button>
                                            </td>

                                            {/* BOTÓN ELIMINAR */}
                                            {isSuperAdmin && (
                                                <td className="text-center">
                                                    <button 
                                                        className="btn-action"
                                                        style={{background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5'}} 
                                                        onClick={() => handleDelete(reg.IdRegistro)}
                                                    >
                                                        🗑 Eliminar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <RegistryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={loadData} />
            <DetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        </div>
    );
};

export default Dashboard;
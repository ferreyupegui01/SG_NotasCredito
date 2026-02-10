import React from 'react';
import '../styles/modals.css';

const DetailsModal = ({ record, onClose }) => {
    if (!record) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP' 
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-pendiente';
        const s = status.toLowerCase();
        if (s.includes('pendiente')) return 'status-pendiente';
        if (s.includes('proceso')) return 'status-proceso';
        return 'status-realizado';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* AGREGAMOS LA CLASE 'card-details' AQUÍ */}
            <div className="modal-card card-details" onClick={(e) => e.stopPropagation()}>
                
                {/* HEADER */}
                <div className="modal-header">
                    <h2 className="modal-title">Detalles del Registro</h2>
                    <span className={`status-badge-large ${getStatusClass(record.NombreEstado)}`}>
                        {record.NombreEstado}
                    </span>
                </div>

                {/* BODY */}
                <div className="modal-body">
                    <div className="details-grid">
                        
                        {/* DATOS EMISOR */}
                        <div className="detail-group detail-full">
                            <label>Razón Social / Emisor</label>
                            <div className="detail-value" style={{fontSize: '1.2rem', fontWeight: '700'}}>
                                {record.NombreEmisor}
                            </div>
                        </div>

                        <div className="detail-group">
                            <label>NIT / Identificación</label>
                            <div className="detail-value">{record.NitEmisor}</div>
                        </div>

                        <div className="detail-group">
                            <label>Tipo de Documento</label>
                            <div className="detail-value">{record.TipoDocumento}</div>
                        </div>

                        <div className="section-divider"></div>

                        {/* FECHAS */}
                        <div className="detail-group">
                            <label>Fecha de Emisión</label>
                            <div className="detail-value">{formatDate(record.FechaEmision)}</div>
                        </div>

                        <div className="detail-group">
                            <label>Fecha de Recepción</label>
                            <div className="detail-value">{formatDate(record.FechaRecepcion)}</div>
                        </div>

                        <div className="section-divider"></div>

                        {/* VALORES */}
                        <div className="detail-group">
                            <label>IVA</label>
                            <div className="detail-value iva-highlight">
                                {formatCurrency(record.Iva)}
                            </div>
                        </div>

                        <div className="detail-group">
                            <label>Total General</label>
                            <div className="detail-value money-highlight">
                                {formatCurrency(record.Total)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cerrar Detalle</button>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
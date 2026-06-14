import { useState } from 'react';
import './ModalEstado.css';

export default function ModalEstado({ solicitud, accion, onConfirmar, onCerrar }) {
  const [obs, setObs]   = useState('');
  const esAprobar   = accion === 'aprobar';
  const esRevision  = accion === 'revision';
  const estadoNuevo = esAprobar ? 'aprobada' : esRevision ? 'en_revision' : 'rechazada';

  const confirmar = () => {
    if (!esAprobar && !esRevision && !obs.trim()) { alert('Indique el motivo del rechazo'); return; }
    onConfirmar(solicitud.idSolicitud, estadoNuevo, obs);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal-box">
        <div className={`modal-header ${esAprobar ? 'modal-header-exito' : esRevision ? 'modal-header-revision' : 'modal-header-peligro'}`}>
          <span className="modal-icono">{esAprobar ? '✅' : esRevision ? '🔍' : '❌'}</span>
          <h2 className="modal-titulo">
            {esAprobar ? 'Aprobar Solicitud' : esRevision ? 'Enviar a Revisión de Autoridad' : 'Rechazar Solicitud'}
          </h2>
        </div>
        <div className="modal-body">
          <div className="modal-info">
            <div className="modal-info-item"><span>Solicitud #</span><strong>{solicitud.idSolicitud}</strong></div>
            <div className="modal-info-item"><span>Trámite</span><strong>{solicitud.tramite}</strong></div>
            <div className="modal-info-item"><span>Fecha</span><strong>{new Date(solicitud.fechaSolicitud).toLocaleDateString('es-BO')}</strong></div>
          </div>
          <div className="form-group" style={{ marginTop: 20 }}>
            <label>{esAprobar || esRevision ? 'Observación (opcional)' : 'Motivo del rechazo *'}</label>
            <textarea rows={4} value={obs} onChange={e => setObs(e.target.value)}
              placeholder={esAprobar
                ? 'Observaciones para el ciudadano...'
                : esRevision
                  ? 'Indicaciones para la autoridad revisora...'
                  : 'Explique el motivo del rechazo...'}
              style={{ width:'100%', padding:'10px 14px', borderRadius:8,
                border:'1.5px solid var(--gris-borde)', resize:'vertical', fontFamily:'DM Sans, sans-serif' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button className={`btn ${esAprobar ? 'btn-success' : esRevision ? 'btn-primary' : 'btn-danger'}`} onClick={confirmar}>
            {esAprobar ? '✅ Confirmar Aprobación' : esRevision ? '🔍 Enviar a Autoridad' : '❌ Confirmar Rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../../context/AuthContext';
import './VisorDocumentos.css';

const BASE = '';

export default function VisorDocumentos({ idSolicitud, tramite, onCerrar }) {
  const [docs, setDocs]       = useState([]);
  const [cargando, setCarg]   = useState(true);
  const [activo, setActivo]   = useState(null);

  useEffect(() => {
    axios.get(`${API}/documentos/solicitud/${idSolicitud}`)
      .then(r => { setDocs(r.data); setActivo(r.data[0] || null); })
      .catch(() => toast.error('Error al cargar documentos'))
      .finally(() => setCarg(false));
  }, [idSolicitud]);

  const icono = mime => {
    if (!mime) return '📄';
    if (mime.includes('pdf'))   return '📕';
    if (mime.includes('image')) return '🖼️';
    return '📝';
  };

  const esImg = mime => mime?.startsWith('image/');
  const esPdf = mime => mime?.includes('pdf');
  const url   = doc  => `/uploads/${doc.nombre}`;

  return (
    <div className="visor-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="visor-box">
        <div className="visor-header">
          <div>
            <h2 className="visor-titulo">📄 Documentos — Solicitud #{idSolicitud}</h2>
            <p className="visor-sub">Trámite: <strong>{tramite}</strong></p>
          </div>
          <button className="visor-cerrar" onClick={onCerrar}>✕</button>
        </div>

        {cargando ? <div className="spinner" style={{ margin: '40px auto' }} /> :
          docs.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>No hay documentos adjuntos en esta solicitud.</p>
            </div>
          ) : (
            <div className="visor-contenido">
              <div className="visor-lista">
                <p className="visor-lista-titulo">{docs.length} documento(s)</p>
                {docs.map(d => (
                  <div key={d.idDoc}
                    className={`visor-doc-item ${activo?.idDoc === d.idDoc ? 'activo' : ''}`}
                    onClick={() => setActivo(d)}>
                    <span className="visor-doc-icono">{icono(d.tipo)}</span>
                    <div className="visor-doc-info">
                      <p className="visor-doc-nombre">{d.nombre}</p>
                      <p className="visor-doc-meta">
                        {d.estado} · {new Date(d.fechaEmision).toLocaleDateString('es-BO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="visor-preview">
                {activo ? (
                  <>
                    <div className="visor-preview-header">
                      <span>{icono(activo.tipo)} {activo.nombre}</span>
                      <a href={url(activo)} target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary btn-sm">↗ Abrir</a>
                    </div>
                    <div className="visor-preview-area">
                      {esPdf(activo.tipo) && (
                        <iframe src={url(activo)} title={activo.nombre} className="visor-iframe" />
                      )}
                      {esImg(activo.tipo) && (
                        <img src={url(activo)} alt={activo.nombre} className="visor-imagen" />
                      )}
                      {!esPdf(activo.tipo) && !esImg(activo.tipo) && (
                        <div className="visor-no-preview">
                          <div style={{ fontSize: 56, marginBottom: 16 }}>{icono(activo.tipo)}</div>
                          <p>Vista previa no disponible para este tipo de archivo.</p>
                          <a href={url(activo)} target="_blank" rel="noopener noreferrer"
                            className="btn btn-primary" style={{ marginTop: 16 }}>
                            ↓ Descargar
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="visor-no-preview"><p>Selecciona un documento</p></div>
                )}
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

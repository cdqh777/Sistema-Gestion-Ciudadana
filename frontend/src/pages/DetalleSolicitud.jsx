import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import ModalEstado from '../components/funcionario/ModalEstado';
import './DetalleTramite.css';

const icono = mime => {
  if (!mime) return '📄';
  if (mime.includes('pdf'))   return '📕';
  if (mime.includes('image')) return '🖼️';
  return '📝';
};

export default function DetalleSolicitud() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [sol, setSol]       = useState(null);
  const [cargando, setCarg] = useState(true);
  const [modal, setModal]   = useState(null);
  const [docActivo, setDoc] = useState(null);

  const cargar = async () => {
    try {
      const r = await axios.get(`${API}/tramites/solicitudes/${id}`);
      setSol(r.data);
      setDoc(r.data.documentos?.[0] || null);
    } catch { toast.error('Error al cargar solicitud'); }
    finally { setCarg(false); }
  };

  useEffect(() => { cargar(); }, [id]);

  const cambiarEstado = async (sid, estado, obs) => {
    try {
      await axios.patch(`${API}/tramites/solicitudes/${sid}/estado`, { estado, observacion: obs });
      toast.success(`Solicitud ${estado}`);
      setModal(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error'); }
  };

  if (cargando) return <><Header /><div className="spinner" style={{ marginTop: 80 }} /></>;
  if (!sol)     return <><Header /><p style={{ padding: 40 }}>Solicitud no encontrada</p></>;

  const volverA = location.pathname.startsWith('/gestor-umsa') ? '/gestor-umsa'
    : location.pathname.startsWith('/autoridad') ? '/autoridad' : '/funcionario';

  const estadoBadge = sol.estado === 'aprobada' ? 'aceptado' : sol.estado === 'rechazada' ? 'rechazado' : sol.estado;

  return (
    <div className="detalle-page">
      <Header />
      <div className="detalle-container">
        <Link to={volverA} className="detalle-volver">← Volver al panel</Link>

        <div className="detalle-header">
          <div>
            <p className="detalle-eyebrow">Solicitud #{sol.idSolicitud}</p>
            <h1 className="detalle-titulo">{sol.tramite_nombre}</h1>
          </div>
          <span className={`badge ${estadoBadge}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {sol.estado}
          </span>
        </div>

        <div className="detalle-grid">
          <div className="detalle-col-info">

            {/* Datos del trámite */}
            <div className="card detalle-card">
              <h3 className="detalle-card-titulo">📋 Información del Trámite</h3>
              <div className="detalle-fila"><span>Tipo</span><strong>{sol.tramite_nombre}</strong></div>
              <div className="detalle-fila">
                <span>Costo</span>
                <strong>{sol.costo === 0 ? 'Gratuito' : `Bs ${sol.costo}`}</strong>
              </div>
              <div className="detalle-fila">
                <span>Fecha solicitud</span>
                <strong>{new Date(sol.fechaSolicitud).toLocaleDateString('es-BO')}</strong>
              </div>
              {sol.tramite_desc && (
                <div className="detalle-descripcion">
                  <span>Descripción:</span><p>{sol.tramite_desc}</p>
                </div>
              )}
              {sol.observacion && (
                <div className="detalle-observacion">
                  <span>Observación:</span><p>{sol.observacion}</p>
                </div>
              )}
            </div>

            {/* Datos del ciudadano */}
            {sol.ciudadano_nombre && (
              <div className="card detalle-card">
                <h3 className="detalle-card-titulo">👤 Ciudadano</h3>
                <div className="detalle-fila"><span>Nombre</span><strong>{sol.ciudadano_nombre}</strong></div>
                {sol.ciudadano_email && <div className="detalle-fila"><span>Email</span><strong>{sol.ciudadano_email}</strong></div>}
                {sol.ciudadano_telefono && <div className="detalle-fila"><span>Teléfono</span><strong>{sol.ciudadano_telefono}</strong></div>}
                {sol.ciudadano_direccion && <div className="detalle-fila"><span>Dirección</span><strong>{sol.ciudadano_direccion}</strong></div>}
              </div>
            )}

            {/* Pago */}
            <div className="card detalle-card">
              <h3 className="detalle-card-titulo">💳 Información de Pago</h3>
              {sol.idPago ? <>
                <div className="detalle-fila"><span>Monto</span><strong>Bs {sol.monto}</strong></div>
                <div className="detalle-fila"><span>Método</span><strong>{sol.metodo}</strong></div>
                <div className="detalle-fila"><span>Estado pago</span>
                  <span className={`badge ${sol.estado_pago === 'pagado' ? 'aceptado' : sol.estado_pago === 'devuelto' ? 'rechazado' : 'pendiente'}`}>
                    {sol.estado_pago}
                  </span>
                </div>
                {sol.comp_numero && <>
                  <div className="detalle-fila"><span>Comprobante</span><strong>{sol.comp_numero}</strong></div>
                  {sol.comp_url && (
                    <div className="detalle-fila">
                      <span>Enlace</span>
                      <a href={sol.comp_url} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--azul-brillante)', fontSize: 13 }}>Ver comprobante ↗</a>
                    </div>
                  )}
                </>}
              </> : (
                <p style={{ color: 'var(--gris-texto)', fontSize: 14 }}>Sin información de pago.</p>
              )}
            </div>

            {/* Acciones según rol */}
            {sol.estado === 'pendiente' && !location.pathname.startsWith('/autoridad') && (
              <div className="card detalle-card detalle-acciones">
                <h3 className="detalle-card-titulo">
                  {location.pathname.startsWith('/gestor-umsa') ? '🎓 Validación UMSA' : '⚙️ Acciones del Funcionario'}
                </h3>
                <p style={{ color:'var(--gris-texto)', fontSize:14, marginBottom:16 }}>
                  {location.pathname.startsWith('/gestor-umsa')
                    ? 'Revisa los documentos académicos y, si son válidos, envía a revisión municipal.'
                    : 'Revisa los documentos y, si cumple los requisitos, envíala a revisión final de la autoridad.'}
                </p>
                <div style={{ display:'flex', gap:12 }}>
                  <button className="btn btn-primary"
                    onClick={() => setModal({ solicitud:{ idSolicitud:sol.idSolicitud, tramite:sol.tramite_nombre, fechaSolicitud:sol.fechaSolicitud }, accion:'revision' })}>
                    {location.pathname.startsWith('/gestor-umsa') ? '✅ Validar y enviar' : '🔍 Enviar a Revisión de Autoridad'}
                  </button>
                  {!location.pathname.startsWith('/gestor-umsa') && (
                    <button className="btn btn-danger"
                      onClick={() => setModal({ solicitud:{ idSolicitud:sol.idSolicitud, tramite:sol.tramite_nombre, fechaSolicitud:sol.fechaSolicitud }, accion:'rechazar' })}>
                      ❌ Rechazar
                    </button>
                  )}
                </div>
              </div>
            )}
            {sol.estado === 'en_revision' && location.pathname.startsWith('/autoridad') && (
              <div className="card detalle-card detalle-acciones">
                <h3 className="detalle-card-titulo">🏛️ Resolución Final — Autoridad</h3>
                <p style={{ color:'var(--gris-texto)', fontSize:14, marginBottom:16 }}>
                  Esta solicitud fue revisada por un funcionario. Como autoridad, tú la oficializas definitivamente.
                </p>
                <div style={{ display:'flex', gap:12 }}>
                  <button className="btn btn-success"
                    onClick={() => setModal({ solicitud:{ idSolicitud:sol.idSolicitud, tramite:sol.tramite_nombre, fechaSolicitud:sol.fechaSolicitud }, accion:'aprobar' })}>
                    ✅ Aprobar Definitivamente
                  </button>
                  <button className="btn btn-danger"
                    onClick={() => setModal({ solicitud:{ idSolicitud:sol.idSolicitud, tramite:sol.tramite_nombre, fechaSolicitud:sol.fechaSolicitud }, accion:'rechazar' })}>
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="detalle-col-docs">
            <div className="card detalle-card">
              <h3 className="detalle-card-titulo">
                📄 Documentos Adjuntos
                <span className="doc-count">{sol.documentos?.length || 0}</span>
              </h3>

              {!sol.documentos?.length ? (
                <p style={{ color: 'var(--gris-texto)', fontSize: 14 }}>No hay documentos adjuntos.</p>
              ) : (<>
                <div className="doc-lista">
                  {sol.documentos.map(d => (
                    <div key={d.idDoc}
                      className={`doc-item ${docActivo?.idDoc === d.idDoc ? 'activo' : ''}`}
                      onClick={() => setDoc(d)}>
                      <span className="doc-icono">{icono(d.tipo)}</span>
                      <div>
                        <span className="doc-nombre">{d.nombre}</span>
                        <p style={{ fontSize: 11, color: 'var(--gris-texto)', marginTop: 2 }}>
                          {d.estado} · {new Date(d.fechaEmision).toLocaleDateString('es-BO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {docActivo && (
                  <div className="doc-preview">
                    <div className="doc-preview-bar">
                      <span>{icono(docActivo.tipo)} {docActivo.nombre}</span>
                      <a href={`/uploads/${docActivo.nombre}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm">↗ Abrir</a>
                    </div>
                    {docActivo.tipo?.startsWith('image/') && (
                      <img src={`/uploads/${docActivo.nombre}`} alt={docActivo.nombre} className="doc-preview-img" />
                    )}
                    {docActivo.tipo?.includes('pdf') && (
                      <iframe src={`/uploads/${docActivo.nombre}`} title={docActivo.nombre} className="doc-preview-iframe" />
                    )}
                    {!docActivo.tipo?.startsWith('image/') && !docActivo.tipo?.includes('pdf') && (
                      <div className="doc-no-preview">
                        <p>Vista previa no disponible.</p>
                        <a href={`/uploads/${docActivo.nombre}`} target="_blank" rel="noopener noreferrer"
                          className="btn btn-primary btn-sm">Descargar</a>
                      </div>
                    )}
                  </div>
                )}
              </>)}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <ModalEstado
          solicitud={modal.solicitud}
          accion={modal.accion}
          onConfirmar={cambiarEstado}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './MisTramites.css';

const ESTADOS = ['todos', 'pendiente', 'en_revision', 'aprobada', 'rechazada'];

const ESTADO_CFG = {
  pendiente:   { label: 'Pendiente',    clase: 'pendiente',   icono: '⏳', desc: 'Tu solicitud está en espera de revisión.' },
  en_revision: { label: 'En revisión',  clase: 'en_revision', icono: '🔍', desc: 'Tu solicitud está siendo revisada por la institución correspondiente.' },
  aprobada:    { label: 'Aprobada',     clase: 'aceptado',    icono: '✅', desc: 'Tu solicitud ha sido oficializada por la autoridad competente.' },
  rechazada:   { label: 'Rechazada',    clase: 'rechazado',   icono: '❌', desc: 'Tu solicitud no pudo continuar. Ver el justificante abajo.' },
};

const MOTIVOS_RECHAZO = [
  'No cumple con los requisitos necesarios para este trámite.',
  'El documento recibido no es el correcto o está incompleto.',
  'No se realizó la transferencia obligatoria o el comprobante no fue adjuntado.',
];

function ProgresoDual({ s }) {
  const esUmsa = s.tipo_tramite === 'umsa' || s.tipo_tramite === 'convenio';
  if (!esUmsa) return null;

  const umsaEstado = s.estado_umsa || 'pendiente';
  const muniEstado = s.estado_municipio || 'pendiente';

  const umsaCfg = {
    pendiente: { label: 'Pendiente', color: '#94A3B8' },
    validado:  { label: 'Validado', color: '#16A34A' },
    rechazado: { label: 'Rechazado', color: '#DC2626' },
  };

  const muniCfg = {
    pendiente:    { label: 'Pendiente', color: '#94A3B8' },
    en_revision:  { label: 'En revisión', color: '#D97706' },
    aprobado:     { label: 'Aprobado', color: '#16A34A' },
    rechazado:    { label: 'Rechazado', color: '#DC2626' },
  };

  const uc = umsaCfg[umsaEstado] || umsaCfg.pendiente;
  const mc = muniCfg[muniEstado] || muniCfg.pendiente;

  return (
    <div className="mt-progreso-dual">
      <div className="mt-prog-inst">
        <span className="mt-prog-inst-icon">🎓</span>
        <span className="mt-prog-inst-name">UMSA</span>
        <span className="mt-prog-inst-badge" style={{ background: uc.color + '20', color: uc.color }}>
          {uc.label}
        </span>
      </div>
      <div className="mt-prog-arrow">→</div>
      <div className="mt-prog-inst">
        <span className="mt-prog-inst-icon">🏛️</span>
        <span className="mt-prog-inst-name">Municipio</span>
        <span className="mt-prog-inst-badge" style={{ background: mc.color + '20', color: mc.color }}>
          {mc.label}
        </span>
      </div>
    </div>
  );
}

export default function MisTramites() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [filtro, setFiltro]           = useState('todos');
  const [notifs, setNotifs]           = useState([]);
  const [mostrarNotifs, setMostrarNotifs] = useState(false);
  const [expandida, setExpandida]     = useState(null);

  useEffect(() => {
    axios.get(`${API}/tramites/mis-solicitudes`)
      .then(r => { setSolicitudes(r.data); })
      .catch(() => setSolicitudes([]))
      .finally(() => setCargando(false));
  }, []);

  const filtradas = filtro === 'todos'
    ? solicitudes
    : solicitudes.filter(s => s.estado === filtro);

  const cfg = s => ESTADO_CFG[s] || { label: s, clase: 'pendiente', icono: '📋', desc: '' };

  return (
    <>
      <Header />
      <div className="mt-page">

        <div className="mt-header">
          <div>
            <h1 className="mt-titulo">Mis Trámites</h1>
            <p className="mt-sub">Seguimiento interinstitucional — UMSA · Municipalidad La Paz</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="mt-bell-wrapper">
              <button className="mt-bell" onClick={() => setMostrarNotifs(p => !p)}>
                🔔
                {notifs.length > 0 && <span className="mt-bell-badge">{notifs.length}</span>}
              </button>
              {mostrarNotifs && (
                <div className="mt-notifs-panel">
                  <p className="mt-notifs-titulo">Notificaciones</p>
                  {notifs.length === 0
                    ? <p className="mt-notifs-empty">Sin notificaciones nuevas</p>
                    : notifs.map(n => (
                      <div key={n.id} className={`mt-notif-item mt-notif-${n.tipo}`}>
                        <p className="mt-notif-texto">{n.texto}</p>
                        <p className="mt-notif-tiempo">{n.tiempo}</p>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <Link to="/nuevo-tramite" className="btn btn-primary">+ Nueva Solicitud</Link>
          </div>
        </div>

        <div className="mt-filtros">
          {ESTADOS.map(e => (
            <button key={e}
              className={`mt-filtro-btn ${filtro === e ? 'activo' : ''}`}
              onClick={() => setFiltro(e)}>
              {e === 'todos' ? '📋 Todos' : `${cfg(e).icono} ${cfg(e).label}`}
              <span className="mt-filtro-count">
                {e === 'todos' ? solicitudes.length : solicitudes.filter(s => s.estado === e).length}
              </span>
            </button>
          ))}
        </div>

        {cargando ? <div className="spinner" /> : filtradas.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
            <p>No tienes solicitudes {filtro !== 'todos' ? `con estado "${filtro}"` : 'aún'}.</p>
            <Link to="/nuevo-tramite" className="btn btn-primary" style={{ marginTop: 16 }}>
              Iniciar primer trámite
            </Link>
          </div>
        ) : (
          <div className="mt-lista">
            {filtradas.map(s => {
              const c = cfg(s.estado);
              const abierta = expandida === s.idSolicitud;
              const esInter = s.tipo_tramite === 'umsa' || s.tipo_tramite === 'convenio';
              return (
                <div key={s.idSolicitud} className={`mt-item mt-item-${c.clase}`}>
                  <div className="mt-item-top" onClick={() => setExpandida(abierta ? null : s.idSolicitud)}>
                    <div className="mt-item-icono">{c.icono}</div>
                    <div className="mt-item-info">
                      <h3 className="mt-item-nombre">{s.tramite}</h3>
                      <p className="mt-item-fecha">
                        Solicitud #{s.idSolicitud} · {new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}
                        {esInter && <span className="mt-item-badge-inter">Interinstitucional</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span className={`badge ${c.clase}`}>{c.label}</span>
                      <span style={{ color: 'var(--gris-texto)', fontSize: 18 }}>{abierta ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  <div className="mt-progreso">
                    <div className={`mt-progreso-fill mt-prog-${s.estado}`} />
                  </div>

                  {esInter && <ProgresoDual s={s} />}

                  {abierta && (
                    <div className="mt-item-detalle">
                      <p className="mt-item-desc">{c.desc}</p>

                      {s.estado === 'rechazada' && (
                        <div className="mt-justificante">
                          <h4>⚠️ Motivo del rechazo</h4>
                          <p>{s.observacion || 'El funcionario no especificó el motivo.'}</p>
                          <p className="mt-just-posibles">Posibles motivos:</p>
                          <ul>
                            {MOTIVOS_RECHAZO.map((m, i) => <li key={i}>{m}</li>)}
                          </ul>
                          <Link to="/nuevo-tramite" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                            🔄 Volver a solicitar
                          </Link>
                        </div>
                      )}

                      {s.observacion && s.estado !== 'rechazada' && (
                        <div className="mt-observacion">
                          <strong>Observación:</strong> {s.observacion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import ModalEstado from '../components/funcionario/ModalEstado';
import VisorDocumentos from '../components/funcionario/VisorDocumentos';
import './DashboardAutoridad.css';

const TABS = [
  { key: 'revision',  label: 'Para Revisión Final', emoji: '🏛️', estado: 'en_revision' },
  { key: 'aprobadas', label: 'Aprobadas',            emoji: '✅', estado: 'aprobada'    },
  { key: 'rechazadas',label: 'Rechazadas',           emoji: '❌', estado: 'rechazada'   },
];

export default function DashboardAutoridad() {
  const { usuario } = useAuth();
  const [tab, setTab]           = useState('revision');
  const [todas, setTodas]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal]       = useState(null);
  const [visor, setVisor]       = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API}/tramites/solicitudes`);
      setTodas(res.data);
    } catch { toast.error('Error al cargar solicitudes'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const estadoActual = TABS.find(t => t.key === tab)?.estado || 'en_revision';
  const filtradas = todas
    .filter(s => s.estado === estadoActual)
    .filter(s => {
      const q = busqueda.toLowerCase();
      return !q || String(s.idSolicitud).includes(q) || s.tramite?.toLowerCase().includes(q);
    });

  const totales = TABS.reduce((acc, t) => {
    acc[t.key] = todas.filter(s => s.estado === t.estado).length;
    return acc;
  }, {});

  const cambiarEstado = async (id, estado, observacion) => {
    try {
      await axios.patch(`${API}/tramites/solicitudes/${id}/estado`, { estado, observacion });
      toast.success(`Solicitud ${estado === 'aprobada' ? 'aprobada oficialmente' : 'rechazada'}`);
      setModal(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error'); }
  };

  return (
    <div className="aut-page">
      <Header />
      <div className="aut-container">

        {/* Encabezado */}
        <div className="aut-header">
          <div className="aut-header-badge">🏛️ Panel de Autoridad</div>
          <div>
            <h1 className="aut-titulo">Revisión y Oficialización de Trámites</h1>
            <p className="aut-sub">
              Bienvenido, <strong>{usuario?.nombre}</strong> — Esta es la última capa de legalización.
              Solo las solicitudes aprobadas aquí se consideran oficiales.
            </p>
          </div>
          <Link to="/autoridad/reporte" className="btn btn-ghost">📊 Ver Reporte</Link>
        </div>

        {/* KPIs */}
        <div className="aut-kpis">
          <div className="aut-kpi aut-kpi-revision">
            <span className="aut-kpi-num">{totales.revision}</span>
            <span className="aut-kpi-label">🏛️ Pendientes de mi revisión</span>
          </div>
          <div className="aut-kpi aut-kpi-aprobadas">
            <span className="aut-kpi-num">{totales.aprobadas}</span>
            <span className="aut-kpi-label">✅ Oficializadas</span>
          </div>
          <div className="aut-kpi aut-kpi-rechazadas">
            <span className="aut-kpi-num">{totales.rechazadas}</span>
            <span className="aut-kpi-label">❌ Rechazadas definitivamente</span>
          </div>
        </div>

        {/* Banner informativo */}
        <div className="aut-banner">
          <span>⚖️</span>
          <p>
            Como autoridad, recibes las solicitudes que ya fueron revisadas por un funcionario.
            Tu aprobación las convierte en <strong>trámites oficiales</strong>.
            Tu rechazo es <strong>definitivo</strong> e incluye justificante al ciudadano.
          </p>
        </div>

        {/* Tabla */}
        <div className="aut-card">
          <div className="tabs-header">
            <div className="tabs">
              {TABS.map(t => (
                <button key={t.key}
                  className={`tab-btn ${tab === t.key ? 'activo' : ''}`}
                  onClick={() => { setTab(t.key); setBusqueda(''); }}>
                  {t.emoji} {t.label}
                  <span className="tab-count">{totales[t.key]}</span>
                </button>
              ))}
            </div>
            <input className="busqueda-input" placeholder="🔍 Buscar..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>

          {cargando ? <div className="spinner" /> :
            filtradas.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>No hay solicitudes {TABS.find(t => t.key === tab)?.label.toLowerCase()}</p>
              </div>
            ) : (
              <div className="tabla-container">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>#ID</th>
                      <th>Tipo de Trámite</th>
                      <th>Costo (Bs)</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Observación del Funcionario</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(s => (
                      <tr key={s.idSolicitud}>
                        <td className="td-id">#{s.idSolicitud}</td>
                        <td className="td-nombre">{s.tramite}</td>
                        <td>{s.costo === 0 ? 'Gratuito' : `Bs ${s.costo}`}</td>
                        <td>{new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}</td>
                        <td>
                          <span className={`badge ${s.estado === 'aprobada' ? 'aceptado' : s.estado === 'rechazada' ? 'rechazado' : 'en_revision'}`}>
                            {s.estado}
                          </span>
                        </td>
                        <td className="td-obs">{s.observacion || '—'}</td>
                        <td>
                          <div className="acciones-btns">
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => setVisor({ idSolicitud: s.idSolicitud, tramite: s.tramite })}>
                              📄 Docs
                            </button>
                            <Link to={`/autoridad/solicitud/${s.idSolicitud}`} className="btn btn-ghost btn-sm">
                              👁️ Ver
                            </Link>
                            {s.estado === 'en_revision' && <>
                              <button className="btn btn-success btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'aprobar' })}>
                                ✅ Oficializar
                              </button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'rechazar' })}>
                                ❌ Rechazar
                              </button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
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
      {visor && (
        <VisorDocumentos
          idSolicitud={visor.idSolicitud}
          tramite={visor.tramite}
          onCerrar={() => setVisor(null)}
        />
      )}
    </div>
  );
}

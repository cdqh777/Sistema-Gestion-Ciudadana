import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import ModalEstado from '../components/funcionario/ModalEstado';
import VisorDocumentos from '../components/funcionario/VisorDocumentos';
import './DashboardFuncionario.css';

const TABS = [
  { key: 'pendientes', label: 'Pendientes',  emoji: '⏳', estado: 'pendiente'  },
  { key: 'revision',   label: 'En Revisión', emoji: '🔍', estado: 'en_revision'},
  { key: 'aceptados',  label: 'Aceptadas',   emoji: '✅', estado: 'aprobada'   },
  { key: 'rechazados', label: 'Rechazadas',  emoji: '❌', estado: 'rechazada'  },
];

export default function DashboardFuncionario() {
  const { usuario } = useAuth();
  const [tab, setTab]             = useState('pendientes');
  const [todas, setTodas]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [modal, setModal]         = useState(null);
  const [visor, setVisor]         = useState(null);
  const [busqueda, setBusqueda]   = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API}/tramites/solicitudes`);
      setTodas(res.data);
    } catch { toast.error('Error al cargar solicitudes'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const estadoActual = TABS.find(t => t.key === tab)?.estado || 'pendiente';
  const filtradas = todas
    .filter(s => s.estado === estadoActual)
    .filter(s => {
      const q = busqueda.toLowerCase();
      return !q ||
        String(s.idSolicitud).includes(q) ||
        s.tramite?.toLowerCase().includes(q) ||
        s.fechaSolicitud?.toLowerCase().includes(q);
    });

  const totales = TABS.reduce((acc, t) => {
    acc[t.key] = todas.filter(s => s.estado === t.estado).length;
    return acc;
  }, {});

  const cambiarEstado = async (id, estado, observacion) => {
    try {
      await axios.patch(`${API}/tramites/solicitudes/${id}/estado`, { estado, observacion });
      toast.success(`Solicitud marcada como "${estado}"`);
      setModal(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error'); }
  };

  return (
    <div className="dash-page">
      <Header />
      <div className="dash-container">

        <div className="dash-header">
          <div>
            <h1 className="dash-titulo">Panel del Funcionario</h1>
            <p className="dash-sub">Bienvenido, <strong>{usuario?.nombre}</strong> — {usuario?.rol}</p>
          </div>
          
        </div>

        {/* KPIs */}
        <div className="dash-kpis">
          {TABS.map(t => (
            <div key={t.key} className={`kpi kpi-${t.key === 'aceptados' ? 'aceptado' : t.key === 'rechazados' ? 'rechazado' : t.key === 'revision' ? 'revision' : 'pendiente'}`}>
              <span className="kpi-num">{totales[t.key]}</span>
              <span className="kpi-label">{t.emoji} {t.label}</span>
            </div>
          ))}
          <div className="kpi kpi-total">
            <span className="kpi-num">{todas.length}</span>
            <span className="kpi-label">📊 Total</span>
          </div>
        </div>

        {/* Tabla */}
        <div className="dash-card">
          <div className="tabs-header">
            <div className="tabs">
              {TABS.map(t => (
                <button key={t.key}
                  className={`tab-btn ${tab === t.key ? 'activo' : ''}`}
                  onClick={() => { setTab(t.key); setBusqueda(''); }}
                >
                  {t.emoji} {t.label}
                  <span className="tab-count">{totales[t.key]}</span>
                </button>
              ))}
            </div>
            <input className="busqueda-input" placeholder="🔍 Buscar por ID o trámite..."
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
                      <th>Fecha Solicitud</th>
                      <th>Estado</th>
                      <th>Observación</th>
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
                        <td><span className={`badge ${s.estado === 'aprobada' ? 'aceptado' : s.estado === 'rechazada' ? 'rechazado' : s.estado}`}>{s.estado}</span></td>
                        <td className="td-obs">{s.observacion || '—'}</td>
                        <td>
                          <div className="acciones-btns">
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => setVisor({ idSolicitud: s.idSolicitud, tramite: s.tramite })}>
                              📄 Docs
                            </button>
                            <Link to={`/funcionario/solicitud/${s.idSolicitud}`} className="btn btn-ghost btn-sm">
                              👁️ Ver
                            </Link>
                            {s.estado === 'pendiente' && <>
                              <button className="btn btn-ghost btn-sm"
                                onClick={() => cambiarEstado(s.idSolicitud, 'en_revision', 'En proceso de revisión')}>
                                🔍 Revisar
                              </button>
                              <button className="btn btn-success btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'aprobar' })}>✅</button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'rechazar' })}>❌</button>
                            </>}
                            {s.estado === 'en_revision' && <>
                              <button className="btn btn-success btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'aprobar' })}>✅ Aprobar</button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => setModal({ solicitud: s, accion: 'rechazar' })}>❌ Rechazar</button>
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
          onConfirmar={(id, estado, obs) => cambiarEstado(id, estado, obs)}
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

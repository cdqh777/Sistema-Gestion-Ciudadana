import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './MisTramites.css';

const ESTADOS = ['todos', 'pendiente', 'en_revision', 'aprobada', 'rechazada'];

const ESTADO_CFG = {
  pendiente:   { label: 'Pendiente',    clase: 'pendiente',   icono: '⏳' },
  en_revision: { label: 'En revisión',  clase: 'en_revision', icono: '🔍' },
  aprobada:    { label: 'Aprobada',     clase: 'aceptado',    icono: '✅' },
  rechazada:   { label: 'Rechazada',    clase: 'rechazado',   icono: '❌' },
};

export default function PanelGestorUMSA() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const ruta = filtro === 'todos' ? 'solicitudes' : `solicitudes/${filtro}`;
    axios.get(`${API}/tramites/${ruta}`)
      .then(r => setSolicitudes(r.data))
      .catch(() => setSolicitudes([]))
      .finally(() => setCargando(false));
  }, [filtro]);

  const handleEstado = async (id, estado) => {
    try {
      await axios.patch(`${API}/tramites/solicitudes/${id}/estado`, { estado, observacion: 'Validado por Gestor UMSA' });
      setSolicitudes(p => p.map(s => s.idSolicitud === id ? { ...s, estado } : s));
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error');
    }
  };

  const cfg = s => ESTADO_CFG[s] || { label: s, clase: 'pendiente', icono: '📋' };

  return (
    <>
      <Header />
      <div className="mt-page">
        <div className="mt-header">
          <div>
            <h1 className="mt-titulo">🎓 Panel Gestor UMSA</h1>
            <p className="mt-sub">Validación de trámites universitarios</p>
          </div>
        </div>

        <div className="mt-filtros">
          {ESTADOS.map(e => (
            <button key={e}
              className={`mt-filtro-btn ${filtro === e ? 'activo' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFiltro(e)}>
              {e === 'todos' ? '📋 Todos' : `${cfg(e).icono} ${cfg(e).label}`}
            </button>
          ))}
        </div>

        {cargando ? <div className="spinner" /> : solicitudes.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
            <p>No hay solicitudes UMSA pendientes.</p>
          </div>
        ) : (
          <div className="mt-lista">
            {solicitudes.map(s => {
              const c = cfg(s.estado);
              return (
                <div key={s.idSolicitud} className={`mt-item mt-item-${c.clase}`}>
                  <div className="mt-item-top">
                    <div className="mt-item-icono">{c.icono}</div>
                    <div className="mt-item-info" style={{ flex: 1 }}>
                      <h3 className="mt-item-nombre">{s.tramite}</h3>
                      <p className="mt-item-fecha">
                        Solicitud #{s.idSolicitud} · {s.ciudadano_nombre || `CI: ${s.ci_ciudadano}`} · {new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}
                      </p>
                      {s.tipo_tramite && <span className="badge" style={{ background: s.tipo_tramite === 'convenio' ? '#7C3AED' : '#0369A1' }}>{s.tipo_tramite}</span>}
                    </div>
                    <span className={`badge ${c.clase}`}>{c.label}</span>
                  </div>
                  <div className="mt-item-actions" style={{ display: 'flex', gap: 8, padding: '8px 16px 12px' }}>
                    <Link to={`/gestor-umsa/solicitud/${s.idSolicitud}`} className="btn btn-ghost btn-sm">Ver detalle</Link>
                    {s.estado === 'pendiente' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleEstado(s.idSolicitud, 'en_revision')}>
                        ✅ Validar y enviar a revisión
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

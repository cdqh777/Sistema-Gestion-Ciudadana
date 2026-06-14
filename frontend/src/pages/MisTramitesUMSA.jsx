import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './MisTramites.css';

const ESTADO_CFG = {
  pendiente:   { label: 'Pendiente',    clase: 'pendiente',   icono: '⏳' },
  en_revision: { label: 'En revisión',  clase: 'en_revision', icono: '🔍' },
  aprobada:    { label: 'Aprobada',     clase: 'aceptado',    icono: '✅' },
  rechazada:   { label: 'Rechazada',    clase: 'rechazado',   icono: '❌' },
};

export default function MisTramitesUMSA() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get(`${API}/tramites/mis-solicitudes`)
      .then(r => setSolicitudes(r.data.filter(s => s.tipo_tramite === 'umsa' || s.tipo_tramite === 'convenio')))
      .catch(() => setSolicitudes([]))
      .finally(() => setCargando(false));
  }, []);

  const cfg = s => ESTADO_CFG[s] || { label: s, clase: 'pendiente', icono: '📋' };

  return (
    <>
      <Header />
      <div className="mt-page">
        <div className="mt-header">
          <div>
            <h1 className="mt-titulo">🎓 Trámites UMSA</h1>
            <p className="mt-sub">Seguimiento de tus trámites universitarios — Municipalidad La Paz</p>
          </div>
          <Link to="/nuevo-tramite" className="btn btn-primary">+ Nueva Solicitud UMSA</Link>
        </div>

        {cargando ? <div className="spinner" /> : solicitudes.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎓</div>
            <p>No tienes trámites UMSA aún.</p>
            <Link to="/nuevo-tramite" className="btn btn-primary" style={{ marginTop: 16 }}>
              Iniciar trámite universitario
            </Link>
          </div>
        ) : (
          <div className="mt-lista">
            {solicitudes.map(s => {
              const c = cfg(s.estado);
              return (
                <div key={s.idSolicitud} className={`mt-item mt-item-${c.clase}`}>
                  <div className="mt-item-top">
                    <div className="mt-item-icono">{c.icono}</div>
                    <div className="mt-item-info">
                      <h3 className="mt-item-nombre">{s.tramite}</h3>
                      <p className="mt-item-fecha">
                        Solicitud #{s.idSolicitud} · Enviado: {new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}
                      </p>
                      {s.tipo_tramite && (
                        <span className="badge" style={{ background: s.tipo_tramite === 'convenio' ? '#7C3AED' : '#0369A1', marginTop: 4 }}>
                          {s.tipo_tramite === 'umsa' ? 'Trámite UMSA' : 'Convenio'}
                        </span>
                      )}
                    </div>
                    <span className={`badge ${c.clase}`}>{c.label}</span>
                  </div>

                  <div className="mt-progreso">
                    <div className={`mt-progreso-fill mt-prog-${s.estado}`} />
                  </div>

                  {s.observacion && (
                    <div className="mt-item-detalle">
                      <p className="mt-item-desc">{c.desc}</p>
                      <div className="mt-observacion">
                        <strong>Observación:</strong> {s.observacion}
                      </div>
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

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './Requisitos.css';

export default function Requisitos() {
  const [tramites, setTramites] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    axios.get(`${API}/tramites/catalogo`)
      .then(r => { setTramites(r.data); setSeleccionado(r.data[0] || null); })
      .catch(() => {});
  }, []);

  const tramitesFiltrados = filtroTipo === 'todos'
    ? tramites
    : tramites.filter(t => t.tipo_tramite === filtroTipo);

  const getTipoBadge = (tipo) => {
    if (tipo === 'umsa') return { icon: '🎓', label: 'UMSA', color: '#002A5C' };
    if (tipo === 'convenio') return { icon: '🤝', label: 'Convenio', color: '#7C3AED' };
    return { icon: '🏛️', label: 'Municipal', color: '#C4A35A' };
  };

  return (
    <>
      <Header />
      <div className="req-page">
        <aside className="req-menu">
          <h2 className="req-menu-titulo">Trámites</h2>
          
          <div className="req-filtros">
            {[
              { id: 'todos', label: 'Todos', icon: '📋' },
              { id: 'municipal', label: 'Municipal', icon: '🏛️' },
              { id: 'umsa', label: 'UMSA', icon: '🎓' },
              { id: 'convenio', label: 'Convenio', icon: '🤝' },
            ].map(f => (
              <button
                key={f.id}
                className={`req-filtro-btn ${filtroTipo === f.id ? 'activo' : ''}`}
                onClick={() => setFiltroTipo(f.id)}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          <div className="req-lista-scroll">
            {tramitesFiltrados.map(t => {
              const badge = getTipoBadge(t.tipo_tramite);
              return (
                <button
                  key={t.idTramite}
                  className={`req-btn ${seleccionado?.idTramite === t.idTramite ? 'activo' : ''}`}
                  onClick={() => setSeleccionado(t)}
                >
                  <span className="req-btn-tipo" style={{ background: badge.color + '20', color: badge.color }}>
                    {badge.icon} {badge.label}
                  </span>
                  <span className="req-btn-nombre">{t.nombre}</span>
                </button>
              );
            })}
            {tramitesFiltrados.length === 0 && (
              <p style={{ color: 'var(--gris-texto)', fontSize: 13, padding: '8px 0' }}>
                No hay trámites de este tipo.
              </p>
            )}
          </div>
        </aside>

        <section className="req-contenido">
          <h1 className="req-titulo">Requisitos de Trámites</h1>
          {!seleccionado ? (
            <p className="req-placeholder">Seleccione un trámite para ver sus detalles.</p>
          ) : (
            <div className="req-detalle">
              <div className="req-tipo-badge" style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px',
                background: getTipoBadge(seleccionado.tipo_tramite).color + '20',
                color: getTipoBadge(seleccionado.tipo_tramite).color
              }}>
                {getTipoBadge(seleccionado.tipo_tramite).icon} {getTipoBadge(seleccionado.tipo_tramite).label}
              </div>
              <h2 className="req-nombre">{seleccionado.nombre}</h2>
              {seleccionado.descripcion && <p className="req-desc">{seleccionado.descripcion}</p>}

              <div className="req-meta">
                <div className="req-meta-item">
                  <span>💰 Costo</span>
                  <strong>{seleccionado.costo === 0 ? 'Gratuito' : `Bs ${seleccionado.costo}`}</strong>
                </div>
                <div className="req-meta-item">
                  <span>🏛️ Departamento</span>
                  <strong>{seleccionado.departamento}</strong>
                </div>
                <div className="req-meta-item">
                  <span>👤 Responsable</span>
                  <strong>{seleccionado.funcionario_nombre}</strong>
                </div>
              </div>

              {seleccionado.requisitos && (
                <div className="req-lista-box">
                  <h3>📋 Requisitos</h3>
                  <ul className="req-lista">
                    {seleccionado.requisitos.split(',').map((r, i) => (
                      <li key={i}>{r.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="req-cta">
                <p>Para realizar este trámite debe tener una cuenta activa.</p>
                <a href="/login" className="btn btn-primary">Iniciar sesión</a>
                <a href="/registro" className="btn btn-ghost" style={{ marginLeft: 10 }}>Registrarse</a>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

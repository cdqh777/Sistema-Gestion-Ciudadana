import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './Requisitos.css';

export default function Requisitos() {
  const [tramites, setTramites] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    axios.get(`${API}/tramites/catalogo`)
      .then(r => { setTramites(r.data); setSeleccionado(r.data[0] || null); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <div className="req-page">
        <aside className="req-menu">
          <h2 className="req-menu-titulo">Trámites</h2>
          {tramites.map(t => (
            <button
              key={t.idTramite}
              className={`req-btn ${seleccionado?.idTramite === t.idTramite ? 'activo' : ''}`}
              onClick={() => setSeleccionado(t)}
            >
              {t.nombre}
            </button>
          ))}
          {tramites.length === 0 && (
            <p style={{ color: 'var(--gris-texto)', fontSize: 13, padding: '8px 0' }}>
              Cargando trámites...
            </p>
          )}
        </aside>

        <section className="req-contenido">
          <h1 className="req-titulo">Requisitos de Trámites</h1>
          {!seleccionado ? (
            <p className="req-placeholder">Seleccione un trámite para ver sus detalles.</p>
          ) : (
            <div className="req-detalle">
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

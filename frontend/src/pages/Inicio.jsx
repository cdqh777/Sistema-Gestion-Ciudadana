import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './Inicio.css';

export default function Inicio() {
  const [tramites, setTramites] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    axios.get(`${API}/tramites/catalogo`)
      .then(r => setTramites(r.data))
      .catch(() => {});
  }, []);

  const tramitesFiltrados = filtro === 'todos'
    ? tramites.slice(0, 8)
    : tramites.filter(t => t.tipo_tramite === filtro);

  const iconoTramite = tipo => {
    if (tipo === 'umsa') return '🎓';
    if (tipo === 'convenio') return '🤝';
    return '🏛️';
  };

  const colorTramite = tipo => {
    if (tipo === 'umsa') return '#002A5C';
    if (tipo === 'convenio') return '#7C3AED';
    return '#C4A35A';
  };

  return (
    <div className="inicio-page">
      <Header />

      {/* ── HERO CONJUNTO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-logos">
            <div className="hero-logo-item">
              <div className="hero-logo-circle" style={{ background: '#002A5C' }}>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 700 }}>U</span>
              </div>
              <span className="hero-logo-label">UMSA</span>
            </div>
            <div className="hero-logo-connector">
              <svg width="40" height="2" viewBox="0 0 40 2">
                <line x1="0" y1="1" x2="40" y2="1" stroke="#C4A35A" strokeWidth="2" strokeDasharray="4,3" />
              </svg>
            </div>
            <div className="hero-logo-item">
              <div className="hero-logo-circle" style={{ background: '#C4A35A' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 9h20L12 2z"
                    stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="hero-logo-label">Municipalidad</span>
            </div>
          </div>

          <p className="hero-eyebrow">Ventanilla Única Interinstitucional</p>
          <h1 className="hero-titulo">
            UMSA <span style={{ color: '#C4A35A' }}>·</span> Municipalidad
            <br /><span>La Paz</span>
          </h1>
          <p className="hero-desc">
            Plataforma conjunta para gestionar trámites entre la Universidad Mayor de San Andrés
            y la Municipalidad de La Paz. Certificados, legalizaciones, convenios y prácticas
            pre-profesionales en un solo lugar.
          </p>
          <div className="hero-acciones">
            <Link to="/registro" className="btn-dorado">Registrarse</Link>
            <Link to="/login" className="btn-blanco">Iniciar Sesión</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{tramites.length || 11}</span>
              <span className="hero-stat-label">Trámites disponibles</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">2</span>
              <span className="hero-stat-label">Instituciones</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">24h</span>
              <span className="hero-stat-label">Seguimiento online</span>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-float hero-card-1">
            <span className="hero-card-icon">🎓</span>
            <div>
              <p className="hero-card-titulo">Validado por UMSA</p>
              <p className="hero-card-sub">Certificado Estudiantil</p>
            </div>
          </div>
          <div className="hero-card-float hero-card-2">
            <span className="hero-card-icon">🏛️</span>
            <div>
              <p className="hero-card-titulo">Aprobado por Municipio</p>
              <p className="hero-card-sub">Trámite Finalizado</p>
            </div>
          </div>
          <div className="hero-city-circle">
            <div className="city-icon">🏔️</div>
            <p>La Paz</p>
            <p className="city-sub">Bolivia</p>
          </div>
        </div>
      </section>

      {/* ── INFO BANDA DUAL ── */}
      <div className="info-banda">
        <div className="info-banda-inner">
          <div className="info-institucion">
            <span className="info-inst-badge" style={{ background: '#002A5C' }}>U</span>
            <div>
              <strong>Universidad Mayor de San Andrés</strong>
              <p>Av. Villazón N° 1966 · Tel: +591 2 2441570</p>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-institucion">
            <span className="info-inst-badge" style={{ background: '#C4A35A' }}>M</span>
            <div>
              <strong>Gobierno Autónomo Municipal de La Paz</strong>
              <p>Av. Mariscal Santa Cruz · Tel: +591 2 2202111</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTROS DE INSTITUCIÓN ── */}
      <section className="tramites-section">
        <div className="seccion-inner">
          <div className="seccion-header">
            <p className="seccion-eyebrow">Servicios disponibles</p>
            <h2 className="seccion-titulo">Trámites Interinstitucionales</h2>
            <p className="seccion-desc">
              Gestiona trámites que involucran a ambas instituciones. Cada trámite muestra
              el flujo entre UMSA y la Municipalidad.
            </p>
          </div>

          <div className="filtro-instituciones">
            {[
              { id: 'todos', label: 'Todos', icon: '📋' },
              { id: 'umsa', label: 'UMSA', icon: '🎓' },
              { id: 'municipal', label: 'Municipalidad', icon: '🏛️' },
              { id: 'convenio', label: 'Convenios', icon: '🤝' },
            ].map(f => (
              <button key={f.id}
                className={`filtro-btn ${filtro === f.id ? 'activo' : ''}`}
                onClick={() => setFiltro(f.id)}>
                <span>{f.icon}</span> {f.label}
                <span className="filtro-count">
                  {f.id === 'todos' ? tramites.length : tramites.filter(t => t.tipo_tramite === f.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="tramites-grid">
            {tramitesFiltrados.map(t => (
              <div key={t.idTramite} className="tramite-card" style={{ borderTop: `3px solid ${colorTramite(t.tipo_tramite)}` }}>
                <div className="tramite-icono">{iconoTramite(t.tipo_tramite)}</div>
                <span className="tramite-tipo-badge" style={{ background: colorTramite(t.tipo_tramite) + '20', color: colorTramite(t.tipo_tramite) }}>
                  {t.tipo_tramite === 'umsa' ? 'UMSA' : t.tipo_tramite === 'convenio' ? 'Convenio' : 'Municipal'}
                </span>
                <h3 className="tramite-nombre">{t.nombre}</h3>
                <p className="tramite-desc">{t.descripcion || 'Trámite interinstitucional UMSA-Municipalidad.'}</p>
                <div className="tramite-flujo-preview">
                  {t.tipo_tramite === 'umsa' && (
                    <>
                      <span className="flujo-paso flujo-umsa">🎓 UMSA</span>
                      <span className="flujo-arrow">→</span>
                      <span className="flujo-paso flujo-muni">🏛️ Municipio</span>
                    </>
                  )}
                  {t.tipo_tramite === 'convenio' && (
                    <>
                      <span className="flujo-paso flujo-muni">🏛️ Municipio</span>
                      <span className="flujo-arrow">⇄</span>
                      <span className="flujo-paso flujo-umsa">🎓 UMSA</span>
                    </>
                  )}
                  {t.tipo_tramite === 'municipal' && (
                    <span className="flujo-paso flujo-muni">🏛️ Municipalidad</span>
                  )}
                </div>
                <div className="tramite-costo">
                  {t.costo === 0 ? '🆓 Gratuito' : `💰 Bs ${t.costo}`}
                </div>
                <Link to="/requisitos" className="tramite-link">Ver requisitos →</Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/requisitos" className="btn-dorado" style={{ display: 'inline-block' }}>
              Ver todos los requisitos
            </Link>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA EL FLUJO INTERINSTITUCIONAL ── */}
      <section className="pasos-section" style={{ background: '#f0f4f8' }}>
        <div className="seccion-inner">
          <div className="seccion-header">
            <p className="seccion-eyebrow">¿Cómo funciona?</p>
            <h2 className="seccion-titulo">Flujo Interinstitucional</h2>
            <p className="seccion-desc">
              Los trámites pasan por ambas instituciones. Cada una valida su parte antes de continuar.
            </p>
          </div>
          <div className="flujo-diagrama">
            <div className="flujo-institucion flujo-umsa-box">
              <div className="flujo-inst-icon">🎓</div>
              <h3>UMSA</h3>
              <ul>
                <li>Valida inscripción estudiantil</li>
                <li>Certifica documentos académicos</li>
                <li>Aprueba convenios universitarios</li>
              </ul>
            </div>
            <div className="flujo-conector">
              <div className="flujo-conector-line" />
              <span className="flujo-conector-label">Flujo</span>
              <div className="flujo-conector-line" />
            </div>
            <div className="flujo-institucion flujo-muni-box">
              <div className="flujo-inst-icon">🏛️</div>
              <h3>Municipalidad</h3>
              <ul>
                <li>Revisa documentación municipal</li>
                <li>Emite certificados y carnets</li>
                <li>Legaliza documentos</li>
              </ul>
            </div>
          </div>

          <div className="pasos-grid" style={{ marginTop: 40 }}>
            {[
              { n: '01', t: 'Regístrate', d: 'Crea tu cuenta con tu CI y datos de contacto. Si eres estudiante UMSA, selecciona tu carrera.' },
              { n: '02', t: 'Elige el trámite', d: 'Selecciona entre trámites UMSA, municipales o convenios interinstitucionales.' },
              { n: '03', t: 'Sube documentos', d: 'Adjunta los archivos requeridos. El sistema te guía según el tipo de trámite.' },
              { n: '04', t: 'Seguimiento dual', d: 'Monitorea el progreso en ambas instituciones: UMSA y Municipalidad.' },
            ].map(p => (
              <div key={p.n} className="paso-card">
                <div className="paso-numero">{p.n}</div>
                <h3 className="paso-titulo">{p.t}</h3>
                <p className="paso-desc">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>¿Listo para gestionar tu trámite?</h2>
          <p>Regístrate y accede a todos los servicios de UMSA y la Municipalidad de La Paz.</p>
          <Link to="/registro" className="btn-dorado btn-lg" style={{ display: 'inline-block' }}>
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-dual">
          <div className="footer-inst">
            <strong>Universidad Mayor de San Andrés</strong>
            <p>Av. Villazón N° 1966, La Paz</p>
          </div>
          <div className="footer-divider" />
          <div className="footer-inst">
            <strong>Gobierno Autónomo Municipal de La Paz</strong>
            <p>Av. Mariscal Santa Cruz, La Paz</p>
          </div>
        </div>
        <p className="footer-copy">© 2025 UMSA · Municipalidad de La Paz · Bolivia. Ventanilla Única Interinstitucional.</p>
      </footer>
    </div>
  );
}

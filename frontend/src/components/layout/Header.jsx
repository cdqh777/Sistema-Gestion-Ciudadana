import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const activo = (path) => location.pathname === path ? 'nav-link nav-link-activo' : 'nav-link';

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <div className="header-logo-icon" style={{ background: 'linear-gradient(135deg, #002A5C 50%, #C4A35A 50%)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 9h20L12 2z"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <span className="header-logo-title">UMSA · Municipalidad</span>
            <span className="header-logo-sub">Ventanilla Única · La Paz</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className={activo('/')}>Inicio</Link>
          <Link to="/requisitos" className={activo('/requisitos')}>Requisitos</Link>

          {/* ── Sin sesión ── */}
          {!usuario && <>
            <Link to="/login"    className={activo('/login')}>Iniciar Sesión</Link>
            <Link to="/registro" className="btn btn-primary btn-sm" style={{ marginLeft: 4 }}>Registrarse</Link>
          </>}

          {/* ── ROL: ciudadano ── */}
          {usuario?.rol === 'ciudadano' && <>
            <Link to="/mis-tramites"      className={activo('/mis-tramites')}>📋 Mis Trámites</Link>
            <Link to="/mis-tramites-umsa" className={activo('/mis-tramites-umsa')}>🎓 Trámites UMSA</Link>
            <Link to="/nuevo-tramite"     className="nav-link nav-link-accent">+ Nueva Solicitud</Link>
          </>}

          {/* ── ROL: funcionario ── */}
          {usuario?.rol === 'funcionario' && <>
            <Link to="/funcionario"          className={activo('/funcionario')}>📥 Solicitudes</Link>
            <Link to="/funcionario/tramites" className={activo('/funcionario/tramites')}>⚙️ Trámites</Link>
            <Link to="/gestor-umsa/convenios" className={activo('/gestor-umsa/convenios')}>🤝 Convenios</Link>
            <Link to="/funcionario/reporte"  className={activo('/funcionario/reporte')}>📊 Reporte</Link>
          </>}

          {/* ── ROL: gestor_umsa ── */}
          {usuario?.rol === 'gestor_umsa' && <>
            <Link to="/gestor-umsa"          className={activo('/gestor-umsa')}>📥 Validar Trámites</Link>
            <Link to="/gestor-umsa/convenios" className={activo('/gestor-umsa/convenios')}>🤝 Convenios</Link>
            <Link to="/gestor-umsa/reporte"  className={activo('/gestor-umsa/reporte')}>📊 Reporte UMSA</Link>
          </>}

          {/* ── ROL: autoridad ── */}
          {usuario?.rol === 'autoridad' && <>
            <Link to="/autoridad"         className={activo('/autoridad')}>🏛️ Revisión Final</Link>
            <Link to="/autoridad/reporte" className={activo('/autoridad/reporte')}>📊 Reporte</Link>
          </>}

          {usuario && (
            <div className="header-user">
              <div className="header-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
              <div className="header-info">
                <span className="header-nombre">{usuario.nombre?.split(' ')[0]}</span>
                <span className="header-rol">{usuario.rol}</span>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-logout">Salir</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm]       = useState({ ci: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (!form.ci || !form.password) { toast.error('Complete los campos'); return; }
    setCargando(true);
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      login(res.data.token, res.data.usuario);
      toast.success(`Bienvenido, ${res.data.usuario.nombre.split(' ')[0]}`);
      const rol = res.data.usuario.rol;
      navigate(
        rol === 'funcionario' ? '/funcionario' :
        rol === 'autoridad'   ? '/autoridad'   :
        '/mis-tramites'
      );
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Credenciales incorrectas');
    } finally { setCargando(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 9h20L12 2z"
                stroke="#F0B940" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1>Municipalidad<br /><span>La Paz</span></h1>
          </div>
          <p className="auth-left-desc">Sistema de gestión de trámites municipales en línea.</p>
          <div className="auth-demo-box">
            <p className="auth-demo-titulo">Cuentas de demo</p>
            <div className="auth-demo-item"><span>Ciudadano:</span> CI <code>7234501</code> / pass <code>abc123</code></div>
            <div className="auth-demo-item"><span>Funcionario:</span> CI <code>3102987</code> / pass <code>func456</code></div>
            <div className="auth-demo-item"><span>Director:</span> CI <code>1983047</code> / pass <code>dir789</code></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-titulo">Iniciar Sesión</h2>
          <p className="auth-sub">Ingrese su CI y contraseña</p>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Cédula de Identidad (CI)</label>
              <input type="text" placeholder="Ej. 7234501"
                value={form.ci} onChange={e => setForm(p => ({...p, ci: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={cargando}>
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <p className="auth-footer-link">
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import SelectorCarrera from '../components/umsa/SelectorCarrera';
import './Auth.css';
import './Registro.css';

export default function Registro() {
  const [form, setForm] = useState({
    ci: '', nombre: '', apellido: '', email: '', password: '', password2: '',
    telefono: '', direccion: '',
    estudia: false, institucion_estudio: '', dir_estudio: '',
    trabaja: false, empresa_trabajo: '',  dir_trabajo: '',
    idCarrera: '',
  });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const ch = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: val }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.ci || !form.nombre || !form.apellido || !form.email || !form.password)
      return toast.error('Complete los campos obligatorios');
    if (form.password !== form.password2)
      return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 6)
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    setCargando(true);
    try {
      await axios.post(`${API}/auth/registro`, form);
      toast.success('¡Cuenta creada! Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrarse');
    } finally { setCargando(false); }
  };

  return (
    <>
      <Header />
      <div className="registro-page">
        <div className="registro-box">
          <h1 className="auth-titulo">Registro de Usuario</h1>
          <p className="auth-sub">Completa tus datos para crear tu cuenta ciudadana</p>

          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label>CI *</label>
                <input name="ci" placeholder="12345678" value={form.ci} onChange={ch} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" placeholder="71234567" value={form.telefono} onChange={ch} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input name="nombre" placeholder="Juan" value={form.nombre} onChange={ch} />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input name="apellido" placeholder="Mamani" value={form.apellido} onChange={ch} />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input name="direccion" placeholder="Av. Buenos Aires 345, El Alto" value={form.direccion} onChange={ch} />
            </div>

            <div className="form-group">
              <label>Correo electrónico *</label>
              <input name="email" type="email" placeholder="correo@gmail.com" value={form.email} onChange={ch} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña *</label>
                <input name="password" type="password" placeholder="Mín. 6 caracteres" value={form.password} onChange={ch} />
              </div>
              <div className="form-group">
                <label>Repetir Contraseña *</label>
                <input name="password2" type="password" placeholder="Repita la contraseña" value={form.password2} onChange={ch} />
              </div>
            </div>

            {/* Estudia */}
            <div className="opcion-check">
              <label className="check-label">
                <input type="checkbox" name="estudia" checked={form.estudia} onChange={ch} />
                <span>¿Actualmente estudia?</span>
              </label>
            </div>
            {form.estudia && (
              <div className="bloque-extra">
                <div className="form-group">
                  <label>Institución educativa</label>
                  <input name="institucion_estudio" placeholder="Nombre de la institución" value={form.institucion_estudio} onChange={ch} />
                </div>
                <div className="form-group">
                  <label>Dirección de la institución</label>
                  <input name="dir_estudio" placeholder="Dirección" value={form.dir_estudio} onChange={ch} />
                </div>
                <SelectorCarrera
                  value={form.idCarrera}
                  onChange={val => setForm(p => ({ ...p, idCarrera: val }))}
                />
              </div>
            )}

            {/* Trabaja */}
            <div className="opcion-check">
              <label className="check-label">
                <input type="checkbox" name="trabaja" checked={form.trabaja} onChange={ch} />
                <span>¿Actualmente trabaja?</span>
              </label>
            </div>
            {form.trabaja && (
              <div className="bloque-extra">
                <div className="form-group">
                  <label>Empresa o institución</label>
                  <input name="empresa_trabajo" placeholder="Nombre de la empresa" value={form.empresa_trabajo} onChange={ch} />
                </div>
                <div className="form-group">
                  <label>Dirección del trabajo</label>
                  <input name="dir_trabajo" placeholder="Dirección" value={form.dir_trabajo} onChange={ch} />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-btn" disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="auth-footer-link">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar Sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

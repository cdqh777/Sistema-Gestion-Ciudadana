import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './GestionTramites.css';

const EMPTY = { nombre: '', descripcion: '', requisitos: '', costo: 0, estado: 'activo' };

export default function GestionTramites() {
  const [tramites, setTramites] = useState([]);
  const [cargando, setCarg]     = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = useCallback(async () => {
    setCarg(true);
    try { const r = await axios.get(`${API}/tramites`); setTramites(r.data); }
    catch { toast.error('Error al cargar trámites'); }
    finally { setCarg(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const guardar = async e => {
    e.preventDefault();
    if (!form.nombre || form.costo === '') return toast.error('Nombre y costo requeridos');
    try {
      if (editId) {
        await axios.put(`${API}/tramites/${editId}`, form);
        toast.success('Trámite actualizado');
      } else {
        await axios.post(`${API}/tramites`, form);
        toast.success('Trámite creado');
      }
      setForm(EMPTY); setEditId(null); setMostrarForm(false); cargar();
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error'); }
  };

  const editar = t => {
    setForm({ nombre: t.nombre, descripcion: t.descripcion || '', requisitos: t.requisitos || '', costo: t.costo, estado: t.estado });
    setEditId(t.idTramite); setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar este trámite?')) return;
    try { await axios.delete(`${API}/tramites/${id}`); toast.success('Eliminado'); cargar(); }
    catch (err) { toast.error(err.response?.data?.mensaje || 'Error al eliminar'); }
  };

  return (
    <div className="gt-page">
      <Header />
      <div className="gt-container">
        <div className="gt-header">
          <div>
            <h1 className="gt-titulo">Gestión de Trámites</h1>
            <p className="gt-sub">Catálogo oficial de trámites de la Municipalidad</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/funcionario" className="btn btn-ghost">← Panel</Link>
            <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setMostrarForm(true); }}>
              + Nuevo Trámite
            </button>
          </div>
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <div className="gt-form-card">
            <h2 className="gt-form-titulo">{editId ? '✏️ Editar Trámite' : '➕ Nuevo Trámite'}</h2>
            <form onSubmit={guardar}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Trámite *</label>
                  <input name="nombre" value={form.nombre} onChange={ch} placeholder="Ej. Certificado de Residencia" />
                </div>
                <div className="form-group">
                  <label>Costo (Bs) *</label>
                  <input name="costo" type="number" min="0" step="0.01" value={form.costo} onChange={ch} placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" rows={2} value={form.descripcion} onChange={ch}
                  placeholder="Descripción del trámite..." style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1.5px solid var(--gris-borde)', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} />
              </div>
              <div className="form-group">
                <label>Requisitos (separados por comas)</label>
                <textarea name="requisitos" rows={2} value={form.requisitos} onChange={ch}
                  placeholder="CI vigente, factura de agua, formulario municipal..."
                  style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1.5px solid var(--gris-borde)', fontFamily:'DM Sans, sans-serif', resize:'vertical' }} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={form.estado} onChange={ch}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button type="submit" className="btn btn-primary">{editId ? 'Actualizar' : 'Crear Trámite'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setMostrarForm(false); setEditId(null); }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        <div className="gt-card">
          {cargando ? <div className="spinner" /> : (
            <div className="tabla-container">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Costo</th>
                    <th>Funcionario</th>
                    <th>Fecha Creación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tramites.map(t => (
                    <tr key={t.idTramite}>
                      <td className="td-id">#{t.idTramite}</td>
                      <td className="td-nombre">{t.nombre}</td>
                      <td style={{ fontSize:13, color:'var(--gris-texto)', maxWidth:200 }}>
                        {t.descripcion?.substring(0,80)}{t.descripcion?.length > 80 ? '...' : ''}
                      </td>
                      <td><strong>{t.costo === 0 ? 'Gratuito' : `Bs ${t.costo}`}</strong></td>
                      <td style={{ fontSize:13 }}>{t.funcionario_nombre}</td>
                      <td style={{ fontSize:13 }}>{new Date(t.fechaCreacion).toLocaleDateString('es-BO')}</td>
                      <td>
                        <span className={`badge ${t.estado === 'activo' ? 'aceptado' : 'rechazado'}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-btns">
                          <button className="btn btn-ghost btn-sm" onClick={() => editar(t)}>✏️ Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => eliminar(t.idTramite)}>🗑️ Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

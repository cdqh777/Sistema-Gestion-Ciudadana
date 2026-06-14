import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './GestionTramites.css';

export default function GestionConvenios() {
  const [convenios, setConvenios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    titulo: '', tipo: 'especifico', descripcion: '',
    fechaInicio: '', fechaFin: '',
    partes: [{ entidad: 'UMSA', representante: '', cargo: '' }],
  });

  useEffect(() => {
    axios.get(`${API}/umsa/convenios`)
      .then(r => setConvenios(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const chForm = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addParte = () => {
    const entidadNueva = form.partes.length % 2 === 0 ? 'UMSA' : 'Municipio';
    setForm(p => ({ ...p, partes: [...p.partes, { entidad: entidadNueva, representante: '', cargo: '' }] }));
  };

  const chParte = (i, campo, val) => {
    const partes = [...form.partes];
    partes[i][campo] = val;
    setForm(p => ({ ...p, partes }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.titulo || !form.fechaInicio) return toast.error('Título y fecha requeridos');
    try {
      await axios.post(`${API}/umsa/convenios`, form);
      toast.success('Convenio creado');
      setMostrarForm(false);
      setForm({ titulo: '', tipo: 'especifico', descripcion: '', fechaInicio: '', fechaFin: '', partes: [{ entidad: 'UMSA', representante: '', cargo: '' }] });
      const r = await axios.get(`${API}/umsa/convenios`);
      setConvenios(r.data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error');
    }
  };

  return (
    <>
      <Header />
      <div className="tramites-page">
        <div className="tramites-header">
          <div>
            <h1>🤝 Convenios UMSA - Municipalidad</h1>
            <p>Gestión de convenios marco y específicos</p>
          </div>
          <button className="btn btn-primary" onClick={() => setMostrarForm(p => !p)}>
            {mostrarForm ? '✕ Cancelar' : '+ Nuevo Convenio'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={submit} className="tramite-form">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Título *</label>
                <input name="titulo" value={form.titulo} onChange={chForm} placeholder="Título del convenio" />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={chForm}>
                  <option value="marco">Marco</option>
                  <option value="especifico">Específico</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={chForm} rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio *</label>
                <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={chForm} />
              </div>
              <div className="form-group">
                <label>Fecha de Fin</label>
                <input name="fechaFin" type="date" value={form.fechaFin} onChange={chForm} />
              </div>
            </div>

            <div className="form-group">
              <label>Partes firmantes</label>
              {form.partes.map((p, i) => (
                <div key={i} className="form-row" style={{ marginBottom: 8, alignItems: 'end' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select value={p.entidad} onChange={e => chParte(i, 'entidad', e.target.value)}>
                      <option value="UMSA">UMSA</option>
                      <option value="Municipio">Municipio</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input placeholder="Representante" value={p.representante} onChange={e => chParte(i, 'representante', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input placeholder="Cargo" value={p.cargo} onChange={e => chParte(i, 'cargo', e.target.value)} />
                  </div>
                  {form.partes.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(p => ({ ...p, partes: p.partes.filter((_, j) => j !== i) }))}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addParte}>+ Agregar parte</button>
            </div>

            <button type="submit" className="btn btn-primary">Crear Convenio</button>
          </form>
        )}

        {cargando ? <div className="spinner" /> : convenios.length === 0 ? (
          <div className="empty-state"><p>No hay convenios registrados.</p></div>
        ) : (
          <div className="tramites-table-wrapper">
            <table className="tramites-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>Partes</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {convenios.map(c => (
                  <tr key={c.idConvenio}>
                    <td><strong>{c.titulo}</strong></td>
                    <td><span className={`badge ${c.tipo === 'marco' ? 'aceptado' : 'en_revision'}`}>{c.tipo}</span></td>
                    <td>{new Date(c.fechaInicio).toLocaleDateString('es-BO')}</td>
                    <td>{c.fechaFin ? new Date(c.fechaFin).toLocaleDateString('es-BO') : '—'}</td>
                    <td><span className={`badge ${c.estado === 'activo' ? 'aceptado' : 'rechazado'}`}>{c.estado}</span></td>
                    <td>{c.partes?.map(p => `${p.entidad}: ${p.representante}`).join(', ') || '—'}</td>
                    <td>{new Date(c.fechaCreacion).toLocaleDateString('es-BO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

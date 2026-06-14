import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../context/AuthContext';

export default function SelectorCarrera({ value, onChange, facultadFilter }) {
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [facultadId, setFacultadId] = useState('');

  useEffect(() => {
    axios.get(`${API}/umsa/facultades`).then(r => setFacultades(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (facultadId) {
      axios.get(`${API}/umsa/carreras?facultad=${facultadId}`)
        .then(r => setCarreras(r.data))
        .catch(() => setCarreras([]));
    } else {
      setCarreras([]);
    }
  }, [facultadId]);

  return (
    <div className="bloque-extra">
      <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#002A5C', fontSize: 14 }}>
        🎓 Datos universitarios (UMSA)
      </p>
      <div className="form-group">
        <label>Facultad</label>
        <select value={facultadId} onChange={e => { setFacultadId(e.target.value); onChange(''); }}>
          <option value="">-- Seleccione facultad --</option>
          {facultades.map(f => (
            <option key={f.idFacultad} value={f.idFacultad}>
              {f.sigla} — {f.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Carrera</label>
        <select value={value} onChange={e => onChange(e.target.value)} disabled={!facultadId}>
          <option value="">-- Seleccione carrera --</option>
          {carreras.map(c => (
            <option key={c.idCarrera} value={c.idCarrera}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

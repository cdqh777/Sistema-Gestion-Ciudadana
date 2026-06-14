import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './NuevoTramite.css';

// ── Genera un código CAPTCHA de 5 caracteres ─────────────────────────────
function generarCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function NuevoTramite() {
  const [tramites, setTramites]         = useState([]);
  const [tipoFiltro, setTipoFiltro]     = useState('municipal');
  const [selec, setSelec]               = useState('');
  const [flujo, setFlujo]               = useState([]);
  const [archivos, setArchivos]         = useState([]);
  const [comprobante, setComprobante]   = useState(null);
  const [cargando, setCargando]         = useState(false);
  const [paso, setPaso]                 = useState(1); // 1=datos, 2=captcha+identidad, 3=pago
  const navigate                        = useNavigate();

  // CAPTCHA
  const [captchaCode, setCaptchaCode]   = useState(generarCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaOk, setCaptchaOk]       = useState(false);

  // Verificador de identidad (firma)
  const canvasRef = useRef(null);
  const [firmando, setFirmando]         = useState(false);
  const [firmaOk, setFirmaOk]           = useState(false);
  const [lastPos, setLastPos]           = useState(null);

  useEffect(() => {
    axios.get(`${API}/tramites/catalogo`).then(r => setTramites(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selec) {
      axios.get(`${API}/tramites/${selec}/flujo`).then(r => setFlujo(r.data)).catch(() => setFlujo([]));
    } else {
      setFlujo([]);
    }
  }, [selec]);

  const tramitesFiltrados = tramites.filter(t => t.tipo_tramite === tipoFiltro);
  const tramiteInfo = tramitesFiltrados.find(t => String(t.idTramite) === String(selec));
  const necesitaPago = tramiteInfo && tramiteInfo.costo > 0;

  // ── Canvas firma ──────────────────────────────────────────────────────
  const startDraw = e => {
    setFirmando(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    setLastPos({ x, y });
  };
  const draw = e => {
    if (!firmando) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const rect   = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.strokeStyle = '#002A5C';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPos({ x, y });
  };
  const endDraw = () => { setFirmando(false); setFirmaOk(true); };
  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setFirmaOk(false);
  };

  // ── Validar captcha ───────────────────────────────────────────────────
  const validarCaptcha = () => {
    if (captchaInput.toUpperCase() === captchaCode) {
      setCaptchaOk(true);
      toast.success('Verificación completada');
    } else {
      toast.error('Código incorrecto, intente de nuevo');
      setCaptchaCode(generarCaptcha());
      setCaptchaInput('');
    }
  };

  // ── Avanzar pasos ─────────────────────────────────────────────────────
  const avanzarPaso1 = e => {
    e.preventDefault();
    if (!selec)            return toast.error('Seleccione un tipo de trámite');
    if (!archivos.length)  return toast.error('Adjunte al menos un documento');
    setPaso(2);
  };

  const avanzarPaso2 = () => {
    if (!captchaOk)  return toast.error('Complete la verificación de seguridad');
    if (!firmaOk)    return toast.error('Registre su firma en el recuadro');
    if (necesitaPago) { setPaso(3); } else { enviar(); }
  };

  // ── Enviar solicitud ──────────────────────────────────────────────────
  const enviar = async () => {
    setCargando(true);
    try {
      const fd = new FormData();
      fd.append('idTramite', selec);
      archivos.forEach(f => fd.append('documentos', f));
      if (comprobante) fd.append('documentos', comprobante);
      await axios.post(`${API}/tramites/solicitudes`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('¡Solicitud enviada exitosamente!');
      navigate('/mis-tramites');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al enviar solicitud');
    } finally { setCargando(false); }
  };

  return (
    <>
      <Header />
      <div className="nt-page">
        <div className="nt-box">
          <h1 className="nt-titulo">Nueva Solicitud de Trámite</h1>
          <p className="nt-sub">Completa los pasos para enviar tu solicitud.</p>

          {/* ── STEPPER ── */}
          <div className="nt-stepper">
            {['Datos y documentos', 'Verificación', 'Pago'].map((s, i) => (
              <div key={s} className={`nt-step ${paso === i + 1 ? 'activo' : ''} ${paso > i + 1 ? 'done' : ''}`}>
                <div className="nt-step-circle">{paso > i + 1 ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {/* ══ PASO 1: Trámite + documentos ══════════════════════════════ */}
          {paso === 1 && (
            <form onSubmit={avanzarPaso1}>
              <div className="form-group">
                <label>Categoría *</label>
                <div className="nt-tipo-selector">
                  {[
                    { id: 'municipal', icono: '🏛️', label: 'Municipal' },
                    { id: 'umsa', icono: '🎓', label: 'UMSA' },
                    { id: 'convenio', icono: '🤝', label: 'Convenio' },
                  ].map(t => (
                    <button key={t.id} type="button"
                      className={`nt-tipo-btn ${tipoFiltro === t.id ? 'activo' : ''}`}
                      onClick={() => { setTipoFiltro(t.id); setSelec(''); }}>
                      <span>{t.icono}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Tipo de Trámite *</label>
                <select value={selec} onChange={e => setSelec(e.target.value)}>
                  <option value="">-- Seleccione --</option>
                  {tramitesFiltrados.map(t => (
                    <option key={t.idTramite} value={t.idTramite}>
                      {t.nombre} {t.costo > 0 ? `— Bs ${t.costo}` : '— Gratuito'}
                    </option>
                  ))}
                </select>
              </div>

              {tramiteInfo && (
                <div className="nt-info-card">
                  <h3>{tramiteInfo.nombre}</h3>
                  {tramiteInfo.descripcion && <p className="nt-desc">{tramiteInfo.descripcion}</p>}

                  {flujo.length > 0 && (
                    <div className="nt-flujo-preview">
                      <p className="nt-flujo-titulo">🔄 Flujo interinstitucional:</p>
                      <div className="nt-flujo-pasos">
                        {flujo.map((f, i) => (
                          <div key={i} className="nt-flujo-paso-wrap">
                            <div className={`nt-flujo-paso nt-flujo-${f.institucion}`}>
                              <span className="nt-flujo-icon">
                                {f.institucion === 'umsa' ? '🎓' : f.institucion === 'municipio' ? '🏛️' : f.institucion === 'autoridad' ? '⚖️' : '👤'}
                              </span>
                              <div>
                                <span className="nt-flujo-inst">{f.institucion === 'ciudadano' ? 'Tú' : f.institucion === 'umsa' ? 'UMSA' : f.institucion === 'municipio' ? 'Municipio' : 'Autoridad'}</span>
                                <span className="nt-flujo-accion">{f.accion}</span>
                              </div>
                            </div>
                            {i < flujo.length - 1 && <span className="nt-flujo-arrow">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tramiteInfo.requisitos && (
                    <>
                      <p className="nt-req-titulo">📋 Documentos requeridos:</p>
                      <ul className="nt-req-lista">
                        {tramiteInfo.requisitos.split(',').map((r, i) => <li key={i}>{r.trim()}</li>)}
                      </ul>
                    </>
                  )}
                  <div className="nt-costo">
                    <span>Costo:</span>
                    <strong>{tramiteInfo.costo === 0 ? 'Gratuito' : `Bs ${tramiteInfo.costo}`}</strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Adjuntar Documentos *</label>
                <div className="nt-upload-area"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setArchivos(p => [...p, ...Array.from(e.dataTransfer.files)]); }}>
                  <div className="nt-upload-icon">📁</div>
                  <p>Arrastra archivos aquí o</p>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', marginTop: 8 }}>
                    Seleccionar archivos
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => setArchivos(p => [...p, ...Array.from(e.target.files)])} />
                  </label>
                  <p className="nt-upload-hint">PDF, JPG, PNG, DOC — máx. 10MB</p>
                </div>
              </div>

              {archivos.length > 0 && (
                <div className="nt-archivos-lista">
                  {archivos.map((f, i) => (
                    <div key={i} className="nt-archivo-item">
                      <span>📄 {f.name}</span>
                      <button type="button" className="nt-archivo-quitar"
                        onClick={() => setArchivos(p => p.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Continuar →
              </button>
            </form>
          )}

          {/* ══ PASO 2: CAPTCHA + Firma ════════════════════════════════════ */}
          {paso === 2 && (
            <div>
              {/* CAPTCHA */}
              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">🤖 Verificación de seguridad</h3>
                <p className="nt-seccion-desc">Confirme que no es un robot ingresando el código.</p>
                <div className="nt-captcha-box">
                  <div className="nt-captcha-codigo">
                    {captchaCode.split('').map((c, i) => (
                      <span key={i} style={{ transform: `rotate(${(Math.random() * 20 - 10).toFixed(0)}deg)` }}>
                        {c}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="nt-captcha-refresh"
                    onClick={() => { setCaptchaCode(generarCaptcha()); setCaptchaInput(''); setCaptchaOk(false); }}>
                    🔄
                  </button>
                </div>
                {!captchaOk ? (
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <input className="nt-captcha-input" placeholder="Ingrese el código"
                      value={captchaInput} maxLength={5}
                      onChange={e => setCaptchaInput(e.target.value.toUpperCase())} />
                    <button type="button" className="btn btn-primary btn-sm" onClick={validarCaptcha}>
                      Verificar
                    </button>
                  </div>
                ) : (
                  <p className="nt-ok">✅ Verificación aprobada</p>
                )}
              </div>

              {/* Verificador de identidad / firma */}
              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">✍️ Verificador de identidad</h3>
                <p className="nt-seccion-desc">Dibuje su firma en el recuadro como aparece en su CI.</p>
                <div className="nt-firma-container">
                  <canvas ref={canvasRef} width={460} height={130} className="nt-firma-canvas"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                  <div className="nt-firma-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFirma}>
                      🗑️ Limpiar
                    </button>
                    {firmaOk && <span className="nt-ok">✅ Firma registrada</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPaso(1)}>← Atrás</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={avanzarPaso2}>
                  {necesitaPago ? 'Continuar al pago →' : '📤 Enviar Solicitud'}
                </button>
              </div>
            </div>
          )}

          {/* ══ PASO 3: QR de pago + comprobante ══════════════════════════ */}
          {paso === 3 && tramiteInfo && (
            <div>
              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">💳 Pago del Trámite</h3>
                <p className="nt-seccion-desc">
                  Este trámite requiere un pago de <strong>Bs {tramiteInfo.costo}</strong>.
                  Escanea el QR o realiza la transferencia y sube el comprobante.
                </p>

                <div className="nt-qr-block">
                  {/* QR generado como SVG estático representativo */}
                  <div className="nt-qr-wrapper">
                    <svg viewBox="0 0 100 100" width="160" height="160"
                      style={{ border: '8px solid white', borderRadius: 8, background: 'white' }}>
                      {/* patrón QR representativo */}
                      {[
                        [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
                        [0,1],[6,1],[0,2],[2,2],[3,2],[4,2],[6,2],
                        [0,3],[2,3],[4,3],[6,3],[0,4],[2,4],[3,4],[4,4],[6,4],
                        [0,5],[6,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
                        [8,0],[10,0],[11,0],[9,1],[8,2],[10,2],[8,4],[11,4],
                        [0,8],[2,8],[3,8],[1,9],[3,9],[0,10],[2,10],[3,10],[1,11],
                        [8,8],[9,8],[10,8],[8,9],[10,9],[9,10],[11,10],[8,11],[11,11],
                        [5,5],[6,7],[7,6],[5,8],[6,9],[7,10],[5,11],[4,7],[3,7],
                      ].map(([cx, cy], i) => (
                        <rect key={i} x={cx * 8 + 2} y={cy * 8 + 2} width="7" height="7" fill="#002A5C" />
                      ))}
                    </svg>
                    <p className="nt-qr-monto">Bs {tramiteInfo.costo}</p>
                  </div>
                  <div className="nt-qr-info">
                    <p className="nt-qr-concepto"><strong>Concepto:</strong> {tramiteInfo.nombre}</p>
                    <p className="nt-qr-cuenta"><strong>Cuenta:</strong> Municipalidad La Paz</p>
                    <p className="nt-qr-banco"><strong>Banco:</strong> Banco Unión S.A.</p>
                    <p className="nt-qr-nro"><strong>Nro. Cuenta:</strong> 1-6123456-0-1</p>
                  </div>
                </div>
              </div>

              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">📎 Subir Comprobante de Pago *</h3>
                <div className="nt-upload-area" style={{ marginTop: 8 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setComprobante(e.dataTransfer.files[0]); }}>
                  <div className="nt-upload-icon">🧾</div>
                  {comprobante
                    ? <p style={{ color: '#16A34A', fontWeight: 600 }}>✅ {comprobante.name}</p>
                    : <p>Arrastra o selecciona el comprobante de pago</p>
                  }
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', marginTop: 8 }}>
                    Seleccionar archivo
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={e => setComprobante(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPaso(2)}>← Atrás</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={!comprobante || cargando} onClick={enviar}>
                  {cargando ? 'Enviando...' : '📤 Enviar Solicitud'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

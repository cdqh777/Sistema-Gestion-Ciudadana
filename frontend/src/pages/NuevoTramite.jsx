import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import qrMercantil from '../assets/qr-mercantil.jpeg';
import './NuevoTramite.css';

function generarCaptcha() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
}

function limpiarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function separarRequisitos(texto) {
  if (!texto) return [];

  return String(texto)
    .split(/,|;|\n|•/)
    .map(item => item.trim())
    .filter(Boolean);
}

function formatearCosto(costo) {
  const monto = Number(costo || 0);
  return monto === 0 ? 'Gratuito' : `Bs ${monto.toFixed(2)}`;
}

function obtenerListaTramites(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.tramites)) return datos.tramites;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.resultado)) return datos.resultado;
  return [];
}

function normalizarTipoTramite(tramite) {
  const texto = limpiarTexto(`
    ${tramite?.tipo_tramite || ''}
    ${tramite?.tipoTramite || ''}
    ${tramite?.tipo || ''}
    ${tramite?.categoria || ''}
    ${tramite?.origen || ''}
    ${tramite?.nombre || ''}
    ${tramite?.descripcion || ''}
  `);

  if (texto.includes('convenio') || texto.includes('interinstitucional') || texto.includes('cooperacion')) {
    return 'convenio';
  }

  if (
    texto.includes('umsa') ||
    texto.includes('universidad') ||
    texto.includes('universitario') ||
    texto.includes('academico') ||
    texto.includes('legalizacion') ||
    texto.includes('certificado de notas') ||
    texto.includes('matricula') ||
    texto.includes('kardex') ||
    texto.includes('diploma') ||
    texto.includes('titulo') ||
    texto.includes('practica') ||
    texto.includes('carnet municipal universitario')
  ) {
    return 'umsa';
  }

  return 'municipal';
}

function obtenerEtiquetaTipo(tipo) {
  const etiquetas = {
    municipal: 'Municipal',
    umsa: 'UMSA',
    convenio: 'Convenio',
  };
  return etiquetas[tipo] || 'Municipal';
}

function obtenerIconoTipo(tipo) {
  const iconos = {
    municipal: '🏛️',
    umsa: '🎓',
    convenio: '🤝',
  };
  return iconos[tipo] || '🏛️';
}

function obtenerClasePaso(pasoActual, numeroPaso) {
  if (pasoActual === numeroPaso) return 'activo';
  if (pasoActual > numeroPaso) return 'done';
  return '';
}

function validarArchivoPermitido(archivo, aceptaComprobante = false) {
  const limiteMb = 10;
  const extensionesBase = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const extensionesComprobante = ['pdf'];
  const extension = archivo.name.split('.').pop().toLowerCase();
  const permitidas = aceptaComprobante ? extensionesComprobante : extensionesBase;

  if (!permitidas.includes(extension)) {
    return `El archivo ${archivo.name} no tiene un formato permitido.`;
  }

  if (archivo.size > limiteMb * 1024 * 1024) {
    return `El archivo ${archivo.name} supera el límite de ${limiteMb} MB.`;
  }

  return null;
}

export default function NuevoTramite() {
  const [tramites, setTramites] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState('municipal');
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState('');
  const [flujo, setFlujo] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [comprobante, setComprobante] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const [codigoCaptcha, setCodigoCaptcha] = useState(generarCaptcha);
  const [textoCaptcha, setTextoCaptcha] = useState('');
  const [captchaAprobado, setCaptchaAprobado] = useState(false);

  const canvasFirma = useRef(null);
  const [firmando, setFirmando] = useState(false);
  const [firmaAprobada, setFirmaAprobada] = useState(false);
  const [ultimaPosicion, setUltimaPosicion] = useState(null);

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const respuesta = await axios.get(`${API}/tramites/catalogo`);
        const lista = obtenerListaTramites(respuesta.data);
        setTramites(lista);
      } catch (error) {
        console.error('Error al cargar trámites:', error);
        setTramites([]);
        toast.error('No se pudo cargar el catálogo de trámites');
      }
    }

    cargarCatalogo();
  }, []);

  useEffect(() => {
    const parametros = new URLSearchParams(location.search);
    const idTramite = parametros.get('tramite');

    if (!idTramite || !tramites.length) return;

    const tramite = tramites.find(item => String(item.idTramite) === String(idTramite));
    if (!tramite) return;

    const tipo = normalizarTipoTramite(tramite);
    setTipoFiltro(tipo);
    setTramiteSeleccionado(String(tramite.idTramite));
  }, [location.search, tramites]);

  useEffect(() => {
    async function cargarFlujoTramite() {
      if (!tramiteSeleccionado) {
        setFlujo([]);
        return;
      }

      try {
        const respuesta = await axios.get(`${API}/tramites/${tramiteSeleccionado}/flujo`);
        setFlujo(respuesta.data || []);
      } catch (error) {
        setFlujo([]);
      }
    }

    cargarFlujoTramite();
  }, [tramiteSeleccionado]);

  const tramitesFiltrados = useMemo(() => {
    return tramites.filter(tramite => normalizarTipoTramite(tramite) === tipoFiltro);
  }, [tramites, tipoFiltro]);

  const tramiteInfo = useMemo(() => {
    return tramites.find(tramite => String(tramite.idTramite) === String(tramiteSeleccionado));
  }, [tramites, tramiteSeleccionado]);

  const requisitos = separarRequisitos(tramiteInfo?.requisitos);
  const necesitaPago = Number(tramiteInfo?.costo || 0) > 0;

  function cambiarCategoria(nuevaCategoria) {
    setTipoFiltro(nuevaCategoria);
    setTramiteSeleccionado('');
    setFlujo([]);
    setArchivos([]);
    setComprobante(null);
    setPaso(1);
  }

  function obtenerPosicionFirma(evento) {
    const canvas = canvasFirma.current;
    const rect = canvas.getBoundingClientRect();
    const punto = evento.touches ? evento.touches[0] : evento;
    return {
      x: punto.clientX - rect.left,
      y: punto.clientY - rect.top,
    };
  }

  function iniciarFirma(evento) {
    setFirmando(true);
    setUltimaPosicion(obtenerPosicionFirma(evento));
  }

  function dibujarFirma(evento) {
    if (!firmando || !ultimaPosicion) return;

    evento.preventDefault();
    const canvas = canvasFirma.current;
    const contexto = canvas.getContext('2d');
    const posicionActual = obtenerPosicionFirma(evento);

    contexto.strokeStyle = '#002A5C';
    contexto.lineWidth = 2.5;
    contexto.lineCap = 'round';
    contexto.beginPath();
    contexto.moveTo(ultimaPosicion.x, ultimaPosicion.y);
    contexto.lineTo(posicionActual.x, posicionActual.y);
    contexto.stroke();

    setUltimaPosicion(posicionActual);
  }

  function finalizarFirma() {
    if (firmando) setFirmaAprobada(true);
    setFirmando(false);
    setUltimaPosicion(null);
  }

  function limpiarFirma() {
    const canvas = canvasFirma.current;
    if (!canvas) return;

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setFirmaAprobada(false);
  }

  function reiniciarCaptcha() {
    setCodigoCaptcha(generarCaptcha());
    setTextoCaptcha('');
    setCaptchaAprobado(false);
  }

  function validarCaptcha() {
    if (textoCaptcha.trim().toUpperCase() === codigoCaptcha) {
      setCaptchaAprobado(true);
      toast.success('Verificación completada');
      return;
    }

    toast.error('Código incorrecto, intente nuevamente');
    reiniciarCaptcha();
  }

  function agregarArchivos(listaArchivos) {
    const nuevos = Array.from(listaArchivos || []);
    const validos = [];

    nuevos.forEach(archivo => {
      const error = validarArchivoPermitido(archivo);
      if (error) toast.error(error);
      else validos.push(archivo);
    });

    if (validos.length) setArchivos(previos => [...previos, ...validos]);
  }

  function quitarArchivo(indiceArchivo) {
    setArchivos(previos => previos.filter((_, indice) => indice !== indiceArchivo));
  }

  function seleccionarComprobante(archivo) {
    if (!archivo) return;

    const error = validarArchivoPermitido(archivo, true);
    if (error) {
      toast.error(error);
      return;
    }

    setComprobante(archivo);
  }

  function avanzarDatos(evento) {
    evento.preventDefault();

    if (!tramiteSeleccionado) {
      toast.error('Seleccione un tipo de trámite');
      return;
    }

    if (!archivos.length) {
      toast.error('Adjunte al menos un documento de respaldo');
      return;
    }

    setPaso(2);
  }

  function avanzarVerificacion() {
    if (!captchaAprobado) {
      toast.error('Complete la verificación de seguridad');
      return;
    }

    if (!firmaAprobada) {
      toast.error('Registre su firma en el recuadro');
      return;
    }

    if (necesitaPago) setPaso(3);
    else enviarSolicitud();
  }

  async function enviarSolicitud() {
    if (!tramiteSeleccionado) return;

    if (necesitaPago && !comprobante) {
      toast.error('Debe adjuntar el comprobante de pago');
      return;
    }

    setCargando(true);

    try {
      const datos = new FormData();
      datos.append('idTramite', tramiteSeleccionado);
      archivos.forEach(archivo => datos.append('documentos', archivo));
      if (comprobante) {
        const nombreComprobante = comprobante.name.toLowerCase().includes('comprobante')
          ? comprobante.name
          : `comprobante_pago_${comprobante.name}`;

        const archivoComprobante = new File([comprobante], nombreComprobante, {
          type: comprobante.type || 'application/pdf',
        });

        datos.append('documentos', archivoComprobante);
      }

      await axios.post(`${API}/tramites/solicitudes`, datos, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Solicitud enviada exitosamente');
      navigate('/mis-tramites');
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al enviar la solicitud');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Header />
      <main className="nt-page">
        <section className="nt-box">
          <div className="nt-header-box">
            <p className="nt-pretitle">Ventanilla Única</p>
            <h1 className="nt-titulo">Nueva solicitud de trámite</h1>
            <p className="nt-sub">Seleccione el trámite, adjunte sus documentos y complete la verificación para enviar la solicitud.</p>
          </div>

          <div className="nt-stepper">
            {['Datos y documentos', 'Verificación', 'Pago'].map((titulo, indice) => {
              const numeroPaso = indice + 1;
              return (
                <div key={titulo} className={`nt-step ${obtenerClasePaso(paso, numeroPaso)}`}>
                  <div className="nt-step-circle">{paso > numeroPaso ? '✓' : numeroPaso}</div>
                  <span>{titulo}</span>
                </div>
              );
            })}
          </div>

          {paso === 1 && (
            <form onSubmit={avanzarDatos}>
              <div className="form-group">
                <label>Categoría *</label>
                <div className="nt-tipo-selector">
                  {[
                    { id: 'municipal', icono: '🏛️', label: 'Municipal' },
                    { id: 'umsa', icono: '🎓', label: 'UMSA' },
                    { id: 'convenio', icono: '🤝', label: 'Convenio' },
                  ].map(categoria => (
                    <button
                      key={categoria.id}
                      type="button"
                      className={`nt-tipo-btn ${tipoFiltro === categoria.id ? 'activo' : ''}`}
                      onClick={() => cambiarCategoria(categoria.id)}
                    >
                      <span>{categoria.icono}</span>
                      <span>{categoria.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de trámite *</label>
                <select value={tramiteSeleccionado} onChange={e => setTramiteSeleccionado(e.target.value)}>
                  <option value="">-- Seleccione --</option>
                  {tramitesFiltrados.map(tramite => (
                    <option key={tramite.idTramite} value={tramite.idTramite}>
                      {tramite.nombre} — {formatearCosto(tramite.costo)}
                    </option>
                  ))}
                </select>
                {tramitesFiltrados.length === 0 && (
                  <p className="nt-texto-suave" style={{ marginTop: 8 }}>
                    No hay trámites activos para esta categoría.
                  </p>
                )}
              </div>

              {tramiteInfo && (
                <div className="nt-info-card">
                  <div className="nt-info-top">
                    <span className="nt-info-badge">
                      {obtenerIconoTipo(normalizarTipoTramite(tramiteInfo))} {obtenerEtiquetaTipo(normalizarTipoTramite(tramiteInfo))}
                    </span>
                    <span className="nt-info-costo">{formatearCosto(tramiteInfo.costo)}</span>
                  </div>

                  <h3>{tramiteInfo.nombre}</h3>
                  {tramiteInfo.descripcion && <p className="nt-desc">{tramiteInfo.descripcion}</p>}

                  {flujo.length > 0 && (
                    <div className="nt-flujo-preview">
                      <p className="nt-flujo-titulo">Flujo de revisión</p>
                      <div className="nt-flujo-pasos">
                        {flujo.map((item, indice) => (
                          <div key={`${item.institucion}-${indice}`} className="nt-flujo-paso-wrap">
                            <div className={`nt-flujo-paso nt-flujo-${item.institucion}`}>
                              <span className="nt-flujo-icon">
                                {item.institucion === 'umsa' ? '🎓' : item.institucion === 'municipio' ? '🏛️' : item.institucion === 'autoridad' ? '⚖️' : '👤'}
                              </span>
                              <div>
                                <span className="nt-flujo-inst">
                                  {item.institucion === 'ciudadano' ? 'Ciudadano' : item.institucion === 'umsa' ? 'UMSA' : item.institucion === 'municipio' ? 'Municipio' : 'Autoridad'}
                                </span>
                                <span className="nt-flujo-accion">{item.accion}</span>
                              </div>
                            </div>
                            {indice < flujo.length - 1 && <span className="nt-flujo-arrow">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="nt-requisitos-panel">
                    <p className="nt-req-titulo">Documentos requeridos</p>
                    {requisitos.length ? (
                      <ul className="nt-req-lista">
                        {requisitos.map((requisito, indice) => <li key={`${requisito}-${indice}`}>{requisito}</li>)}
                      </ul>
                    ) : (
                      <p className="nt-texto-suave">Este trámite no tiene requisitos cargados en el catálogo.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Adjuntar documentos *</label>
                <div
                  className="nt-upload-area"
                  onDragOver={evento => evento.preventDefault()}
                  onDrop={evento => {
                    evento.preventDefault();
                    agregarArchivos(evento.dataTransfer.files);
                  }}
                >
                  <div className="nt-upload-icon">📁</div>
                  <p>Arrastre los documentos aquí o selecciónelos desde su equipo.</p>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', marginTop: 8 }}>
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={evento => agregarArchivos(evento.target.files)}
                    />
                  </label>
                  <p className="nt-upload-hint">Formatos permitidos: PDF, JPG, PNG, DOC y DOCX. Tamaño máximo: 10 MB por archivo.</p>
                </div>
              </div>

              {archivos.length > 0 && (
                <div className="nt-archivos-lista">
                  {archivos.map((archivo, indice) => (
                    <div key={`${archivo.name}-${indice}`} className="nt-archivo-item">
                      <span>📄 {archivo.name}</span>
                      <button type="button" className="nt-archivo-quitar" onClick={() => quitarArchivo(indice)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Continuar →
              </button>
            </form>
          )}

          {paso === 2 && (
            <div>
              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">Verificación de seguridad</h3>
                <p className="nt-seccion-desc">Ingrese el código mostrado para continuar con la solicitud.</p>

                <div className="nt-captcha-box">
                  <div className="nt-captcha-codigo">
                    {codigoCaptcha.split('').map((caracter, indice) => (
                      <span key={`${caracter}-${indice}`}>{caracter}</span>
                    ))}
                  </div>
                  <button type="button" className="nt-captcha-refresh" onClick={reiniciarCaptcha}>🔄</button>
                </div>

                {!captchaAprobado ? (
                  <div className="nt-captcha-form">
                    <input
                      className="nt-captcha-input"
                      placeholder="Código"
                      value={textoCaptcha}
                      maxLength={5}
                      onChange={evento => setTextoCaptcha(evento.target.value.toUpperCase())}
                    />
                    <button type="button" className="btn btn-primary btn-sm" onClick={validarCaptcha}>Verificar</button>
                  </div>
                ) : (
                  <p className="nt-ok">✅ Verificación aprobada</p>
                )}
              </div>

              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">Verificador de identidad</h3>
                <p className="nt-seccion-desc">Dibuje su firma en el recuadro como respaldo de la solicitud.</p>

                <div className="nt-firma-container">
                  <canvas
                    ref={canvasFirma}
                    width={460}
                    height={130}
                    className="nt-firma-canvas"
                    onMouseDown={iniciarFirma}
                    onMouseMove={dibujarFirma}
                    onMouseUp={finalizarFirma}
                    onMouseLeave={finalizarFirma}
                    onTouchStart={iniciarFirma}
                    onTouchMove={dibujarFirma}
                    onTouchEnd={finalizarFirma}
                  />
                  <div className="nt-firma-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFirma}>Limpiar</button>
                    {firmaAprobada && <span className="nt-ok">✅ Firma registrada</span>}
                  </div>
                </div>
              </div>

              <div className="nt-botones-paso">
                <button type="button" className="btn btn-ghost" onClick={() => setPaso(1)}>← Atrás</button>
                <button type="button" className="btn btn-primary" onClick={avanzarVerificacion}>
                  {necesitaPago ? 'Continuar al pago →' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
          )}

          {paso === 3 && tramiteInfo && (
            <div>
              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">Pago del trámite</h3>
                <p className="nt-seccion-desc">
                  Este trámite requiere un pago de <strong>Bs {Number(tramiteInfo.costo || 0).toFixed(2)}</strong>. Adjunte el comprobante para completar el envío.
                </p>

                <div className="nt-qr-block">
                  <div className="nt-qr-wrapper">
                    <img
                      src={qrMercantil}
                      alt="QR de pago Mercantil Santa Cruz"
                      className="nt-qr-real"
                    />
                    <p className="nt-qr-monto">{formatearCosto(tramiteInfo.costo)}</p>
                  </div>

                  <div className="nt-qr-info">
                    <p><strong>Concepto:</strong> {tramiteInfo.nombre}</p>
                    <p><strong>Entidad:</strong> Ventanilla Única La Paz</p>
                    <p><strong>Método:</strong> QR / transferencia</p>
                    <p><strong>Referencia:</strong> Adjunte comprobante legible.</p>
                  </div>
                </div>
              </div>

              <div className="nt-seccion">
                <h3 className="nt-seccion-titulo">Subir comprobante de pago *</h3>
                <div
                  className="nt-upload-area"
                  onDragOver={evento => evento.preventDefault()}
                  onDrop={evento => {
                    evento.preventDefault();
                    seleccionarComprobante(evento.dataTransfer.files[0]);
                  }}
                >
                  <div className="nt-upload-icon">🧾</div>
                  {comprobante ? (
                    <p className="nt-ok">✅ {comprobante.name}</p>
                  ) : (
                    <p>Arrastre o seleccione el comprobante de pago en PDF.</p>
                  )}
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', marginTop: 8 }}>
                    Seleccionar comprobante
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={evento => seleccionarComprobante(evento.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="nt-botones-paso">
                <button type="button" className="btn btn-ghost" onClick={() => setPaso(2)}>← Atrás</button>
                <button type="button" className="btn btn-primary" disabled={!comprobante || cargando} onClick={enviarSolicitud}>
                  {cargando ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

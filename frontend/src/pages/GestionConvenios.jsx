import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './GestionConvenios.css';

const formularioInicial = {
  titulo: '',
  tipo: 'especifico',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  partes: [
    { entidad: 'UMSA', representante: '', cargo: '' },
    { entidad: 'Municipio', representante: '', cargo: '' },
  ],
};

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  const fechaConvertida = new Date(fecha);
  if (Number.isNaN(fechaConvertida.getTime())) return 'Sin fecha';
  return fechaConvertida.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function obtenerEstadoVigencia(convenio) {
  if (convenio.estado !== 'activo') return convenio.estado || 'sin estado';
  if (!convenio.fechaFin) return 'activo';

  const hoy = new Date();
  const fin = new Date(convenio.fechaFin);
  return fin >= hoy ? 'activo' : 'vencido';
}

function obtenerClaseEstado(estado) {
  if (estado === 'activo') return 'activo';
  if (estado === 'vencido') return 'vencido';
  return 'inactivo';
}

function contarPorEstado(convenios) {
  return convenios.reduce(
    (acumulador, convenio) => {
      const estado = obtenerEstadoVigencia(convenio);
      if (estado === 'activo') acumulador.activos += 1;
      else if (estado === 'vencido') acumulador.vencidos += 1;
      else acumulador.inactivos += 1;
      return acumulador;
    },
    { activos: 0, vencidos: 0, inactivos: 0 }
  );
}

export default function GestionConvenios() {
  const [convenios, setConvenios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [convenioSeleccionado, setConvenioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [formulario, setFormulario] = useState(formularioInicial);

  async function cargarConvenios() {
    try {
      setCargando(true);
      const respuesta = await axios.get(`${API}/umsa/convenios`);
      setConvenios(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'No se pudieron cargar los convenios');
      setConvenios([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarConvenios();
  }, []);

  const estadisticas = useMemo(() => {
    const estados = contarPorEstado(convenios);
    return {
      total: convenios.length,
      marco: convenios.filter(convenio => convenio.tipo === 'marco').length,
      especificos: convenios.filter(convenio => convenio.tipo === 'especifico').length,
      activos: estados.activos,
      vencidos: estados.vencidos,
    };
  }, [convenios]);

  const conveniosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return convenios.filter(convenio => {
      const coincideTipo = filtroTipo === 'todos' || convenio.tipo === filtroTipo;
      const contenido = `${convenio.titulo || ''} ${convenio.descripcion || ''} ${convenio.estado || ''}`.toLowerCase();
      const coincideBusqueda = !texto || contenido.includes(texto);
      return coincideTipo && coincideBusqueda;
    });
  }, [convenios, busqueda, filtroTipo]);

  function cambiarFormulario(evento) {
    const { name, value } = evento.target;
    setFormulario(actual => ({ ...actual, [name]: value }));
  }

  function agregarParte() {
    const siguienteEntidad = formulario.partes.length % 2 === 0 ? 'UMSA' : 'Municipio';
    setFormulario(actual => ({
      ...actual,
      partes: [...actual.partes, { entidad: siguienteEntidad, representante: '', cargo: '' }],
    }));
  }

  function modificarParte(indice, campo, valor) {
    const partes = formulario.partes.map((parte, posicion) => (
      posicion === indice ? { ...parte, [campo]: valor } : parte
    ));
    setFormulario(actual => ({ ...actual, partes }));
  }

  function eliminarParte(indice) {
    setFormulario(actual => ({
      ...actual,
      partes: actual.partes.filter((_, posicion) => posicion !== indice),
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setMostrarFormulario(false);
  }

  async function registrarConvenio(evento) {
    evento.preventDefault();

    if (!formulario.titulo.trim()) {
      toast.error('Ingrese el título del convenio');
      return;
    }

    if (!formulario.fechaInicio) {
      toast.error('Seleccione la fecha de inicio');
      return;
    }

    const partesValidas = formulario.partes.filter(parte => (
      parte.entidad && parte.representante.trim() && parte.cargo.trim()
    ));

    if (partesValidas.length < 2) {
      toast.error('Registre al menos una parte UMSA y una parte Municipio');
      return;
    }

    try {
      await axios.post(`${API}/umsa/convenios`, {
        ...formulario,
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        fechaFin: formulario.fechaFin || null,
        partes: partesValidas,
      });

      toast.success('Convenio creado correctamente');
      limpiarFormulario();
      cargarConvenios();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al crear el convenio');
    }
  }

  function alternarDetalle(convenio) {
    setConvenioSeleccionado(actual => (
      actual?.idConvenio === convenio.idConvenio ? null : convenio
    ));
  }

  return (
    <>
      <Header />

      <main className="convenios-page">
        <section className="convenios-hero">
          <div className="convenios-hero-info">
            <span className="convenios-etiqueta">Gestión interinstitucional</span>
            <h1>Convenios UMSA - Municipalidad</h1>
            <p>
              Registro y seguimiento de convenios marco, convenios específicos y partes firmantes
              entre la Universidad Mayor de San Andrés y el Gobierno Autónomo Municipal de La Paz.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary convenios-btn-nuevo"
            onClick={() => setMostrarFormulario(actual => !actual)}
          >
            {mostrarFormulario ? '✕ Cancelar registro' : '+ Nuevo convenio'}
          </button>
        </section>

        <section className="convenios-resumen">
          <article className="convenio-stat">
            <span>Total</span>
            <strong>{estadisticas.total}</strong>
            <small>convenios registrados</small>
          </article>
          <article className="convenio-stat">
            <span>Marco</span>
            <strong>{estadisticas.marco}</strong>
            <small>cooperación general</small>
          </article>
          <article className="convenio-stat">
            <span>Específicos</span>
            <strong>{estadisticas.especificos}</strong>
            <small>acciones concretas</small>
          </article>
          <article className="convenio-stat">
            <span>Activos</span>
            <strong>{estadisticas.activos}</strong>
            <small>vigentes actualmente</small>
          </article>
        </section>

        {mostrarFormulario && (
          <form onSubmit={registrarConvenio} className="convenios-formulario">
            <div className="convenios-form-header">
              <div>
                <span>Nuevo registro</span>
                <h2>Datos del convenio</h2>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFormulario}>
                Limpiar
              </button>
            </div>

            <div className="convenios-grid-form">
              <label className="campo ancho-doble">
                <span>Título *</span>
                <input
                  name="titulo"
                  value={formulario.titulo}
                  onChange={cambiarFormulario}
                  placeholder="Ej. Convenio de prácticas preprofesionales"
                />
              </label>

              <label className="campo">
                <span>Tipo</span>
                <select name="tipo" value={formulario.tipo} onChange={cambiarFormulario}>
                  <option value="marco">Convenio marco</option>
                  <option value="especifico">Convenio específico</option>
                </select>
              </label>

              <label className="campo">
                <span>Fecha de inicio *</span>
                <input name="fechaInicio" type="date" value={formulario.fechaInicio} onChange={cambiarFormulario} />
              </label>

              <label className="campo">
                <span>Fecha de finalización</span>
                <input name="fechaFin" type="date" value={formulario.fechaFin} onChange={cambiarFormulario} />
              </label>

              <label className="campo ancho-completo">
                <span>Descripción</span>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={cambiarFormulario}
                  rows={4}
                  placeholder="Describa el alcance, finalidad y actividades principales del convenio"
                />
              </label>
            </div>

            <div className="partes-card">
              <div className="partes-head">
                <div>
                  <span>Partes firmantes</span>
                  <h3>Representantes institucionales</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={agregarParte}>
                  + Agregar parte
                </button>
              </div>

              <div className="partes-lista">
                {formulario.partes.map((parte, indice) => (
                  <div key={`${parte.entidad}-${indice}`} className="parte-fila">
                    <select value={parte.entidad} onChange={evento => modificarParte(indice, 'entidad', evento.target.value)}>
                      <option value="UMSA">UMSA</option>
                      <option value="Municipio">Municipio</option>
                    </select>
                    <input
                      placeholder="Representante"
                      value={parte.representante}
                      onChange={evento => modificarParte(indice, 'representante', evento.target.value)}
                    />
                    <input
                      placeholder="Cargo"
                      value={parte.cargo}
                      onChange={evento => modificarParte(indice, 'cargo', evento.target.value)}
                    />
                    {formulario.partes.length > 2 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => eliminarParte(indice)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="convenios-form-actions">
              <button type="submit" className="btn btn-primary">Crear convenio</button>
              <button type="button" className="btn btn-ghost" onClick={limpiarFormulario}>Cancelar</button>
            </div>
          </form>
        )}

        <section className="convenios-panel">
          <div className="convenios-panel-head">
            <div>
              <span>Listado</span>
              <h2>Convenios registrados</h2>
            </div>

            <div className="convenios-filtros">
              <input
                value={busqueda}
                onChange={evento => setBusqueda(evento.target.value)}
                placeholder="Buscar por título, descripción o estado..."
              />
              <select value={filtroTipo} onChange={evento => setFiltroTipo(evento.target.value)}>
                <option value="todos">Todos los tipos</option>
                <option value="marco">Marco</option>
                <option value="especifico">Específico</option>
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="spinner" />
          ) : conveniosFiltrados.length === 0 ? (
            <div className="convenios-vacio">
              <strong>No hay convenios para mostrar</strong>
              <p>Registre un nuevo convenio o cambie los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="convenios-lista">
              {conveniosFiltrados.map(convenio => {
                const estadoVigencia = obtenerEstadoVigencia(convenio);
                const seleccionado = convenioSeleccionado?.idConvenio === convenio.idConvenio;

                return (
                  <article key={convenio.idConvenio} className={`convenio-card ${seleccionado ? 'seleccionado' : ''}`}>
                    <button type="button" className="convenio-card-main" onClick={() => alternarDetalle(convenio)}>
                      <div className="convenio-icono">🤝</div>

                      <div className="convenio-info">
                        <div className="convenio-topline">
                          <span className={`convenio-tipo tipo-${convenio.tipo}`}>{convenio.tipo}</span>
                          <span className={`convenio-estado ${obtenerClaseEstado(estadoVigencia)}`}>{estadoVigencia}</span>
                        </div>
                        <h3>{convenio.titulo}</h3>
                        <p>{convenio.descripcion || 'Sin descripción registrada.'}</p>
                      </div>

                      <div className="convenio-fechas">
                        <span>Inicio</span>
                        <strong>{formatearFecha(convenio.fechaInicio)}</strong>
                        <span>Fin</span>
                        <strong>{formatearFecha(convenio.fechaFin)}</strong>
                      </div>
                    </button>

                    {seleccionado && (
                      <div className="convenio-detalle">
                        <div>
                          <span className="detalle-label">Partes firmantes</span>
                          <div className="partes-detalle">
                            {convenio.partes?.length ? convenio.partes.map(parte => (
                              <div key={parte.idParte || `${parte.entidad}-${parte.representante}`} className="parte-detalle-card">
                                <strong>{parte.entidad}</strong>
                                <span>{parte.representante || 'Sin representante'}</span>
                                <small>{parte.cargo || 'Sin cargo'}</small>
                              </div>
                            )) : <p>No se registraron partes firmantes.</p>}
                          </div>
                        </div>

                        <div className="detalle-meta">
                          <p><strong>Creado:</strong> {formatearFecha(convenio.fechaCreacion)}</p>
                          <p><strong>Registrado por:</strong> {convenio.creador_nombre || 'Funcionario municipal'}</p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

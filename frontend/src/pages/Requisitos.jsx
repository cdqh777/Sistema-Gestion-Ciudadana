import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './Requisitos.css';

const categorias = [
  {
    id: 'municipal',
    nombre: 'Municipal',
    icono: '🏛️',
    descripcion: 'Trámites ciudadanos del Gobierno Autónomo Municipal de La Paz.',
  },
  {
    id: 'umsa',
    nombre: 'UMSA',
    icono: '🎓',
    descripcion: 'Trámites académicos, legalizaciones, certificados y gestiones institucionales.',
  },
  {
    id: 'convenio',
    nombre: 'Convenio',
    icono: '🤝',
    descripcion: 'Trámites interinstitucionales entre UMSA y Municipio.',
  },
];

function limpiarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obtenerListaTramites(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.tramites)) return datos.tramites;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.resultado)) return datos.resultado;
  return [];
}

function separarRequisitos(texto) {
  if (!texto) return [];

  return String(texto)
    .split(/,|;|\n|•/)
    .map(requisito => requisito.trim())
    .filter(Boolean);
}

function formatearCosto(costo) {
  const monto = Number(costo || 0);
  return monto === 0 ? 'Gratuito' : `Bs ${monto.toFixed(2)}`;
}

function obtenerCategoriaPorId(id) {
  return categorias.find(categoria => categoria.id === id) || categorias[0];
}

function obtenerTipoTramite(tramite) {
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

function obtenerResumenCategoria(tipo) {
  if (tipo === 'municipal') {
    return 'Seleccione un trámite municipal para consultar documentos, costo y requisitos.';
  }

  if (tipo === 'umsa') {
    return 'Seleccione un trámite UMSA relacionado con certificados, legalizaciones o gestiones académicas.';
  }

  return 'Seleccione un trámite de convenio o cooperación interinstitucional.';
}

export default function Requisitos() {
  const [tramites, setTramites] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    async function cargarTramites() {
      try {
        setCargando(true);
        setMensajeError('');

        const respuesta = await axios.get(`${API}/tramites/catalogo`);
        const lista = obtenerListaTramites(respuesta.data);

        setTramites(lista);
      } catch (error) {
        console.error('Error al cargar trámites:', error);
        setTramites([]);
        setMensajeError('No se pudo cargar el catálogo de trámites. Revise que el backend esté activo.');
      } finally {
        setCargando(false);
      }
    }

    cargarTramites();
  }, []);

  const conteoPorCategoria = useMemo(() => {
    return categorias.reduce((acumulador, categoria) => {
      acumulador[categoria.id] = tramites.filter(tramite => obtenerTipoTramite(tramite) === categoria.id).length;
      return acumulador;
    }, {});
  }, [tramites]);

  const tramitesFiltrados = useMemo(() => {
    const texto = limpiarTexto(busqueda);

    return tramites.filter(tramite => {
      const tipo = obtenerTipoTramite(tramite);
      const coincideCategoria = categoriaSeleccionada && tipo === categoriaSeleccionada;
      const contenido = limpiarTexto(`${tramite.nombre || ''} ${tramite.descripcion || ''} ${tramite.requisitos || ''}`);
      const coincideBusqueda = !texto || contenido.includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [tramites, categoriaSeleccionada, busqueda]);

  const categoriaActual = categoriaSeleccionada ? obtenerCategoriaPorId(categoriaSeleccionada) : null;
  const requisitos = separarRequisitos(tramiteSeleccionado?.requisitos);

  function elegirCategoria(categoria) {
    setCategoriaSeleccionada(categoria);
    setTramiteSeleccionado(null);
    setBusqueda('');
  }

  function volverACategorias() {
    setCategoriaSeleccionada('');
    setTramiteSeleccionado(null);
    setBusqueda('');
  }

  function volverATramites() {
    setTramiteSeleccionado(null);
  }

  return (
    <>
      <Header />

      <div className="req-page">
        <aside className="req-menu">
          <p className="req-menu-subtitulo">Menú de requisitos</p>
          <h2 className="req-menu-titulo">Categorías</h2>

          <div className="req-categorias-menu">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                type="button"
                className={`req-categoria-menu ${categoriaSeleccionada === categoria.id ? 'activo' : ''}`}
                onClick={() => elegirCategoria(categoria.id)}
              >
                <span>{categoria.icono}</span>
                <strong>{categoria.nombre}</strong>
                <small>{conteoPorCategoria[categoria.id] || 0}</small>
              </button>
            ))}
          </div>

          {categoriaSeleccionada && (
            <button type="button" className="req-btn-limpiar" onClick={volverACategorias}>
              Cambiar categoría
            </button>
          )}
        </aside>

        <main className="req-contenido">
          <div className="req-encabezado">
            <p className="req-pretitle">Consulta de requisitos</p>
            <h1 className="req-titulo">Trámites disponibles</h1>
            <p className="req-descripcion">
              Elija una categoría, seleccione un trámite y revise únicamente los requisitos necesarios.
            </p>
          </div>

          {!categoriaSeleccionada && (
            <section className="req-panel">
              <h2>Seleccione el tipo de trámite</h2>
              <p className="req-texto-suave">
                El sistema organiza los trámites en tres grupos: Municipal, UMSA y Convenio.
              </p>

              {cargando && <p className="req-estado">Cargando trámites...</p>}
              {mensajeError && <p className="req-alerta">{mensajeError}</p>}

              <div className="req-categorias-grid">
                {categorias.map(categoria => (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`req-categoria-card req-categoria-${categoria.id}`}
                    onClick={() => elegirCategoria(categoria.id)}
                  >
                    <span className="req-categoria-icono">{categoria.icono}</span>
                    <strong>{categoria.nombre}</strong>
                    <small>{categoria.descripcion}</small>
                    <em>{conteoPorCategoria[categoria.id] || 0} trámites disponibles</em>
                  </button>
                ))}
              </div>
            </section>
          )}

          {categoriaSeleccionada && !tramiteSeleccionado && (
            <section className="req-panel">
              <div className="req-panel-head">
                <div>
                  <p className="req-pretitle">{categoriaActual.icono} {categoriaActual.nombre}</p>
                  <h2>Seleccione un trámite</h2>
                  <p className="req-texto-suave">{obtenerResumenCategoria(categoriaSeleccionada)}</p>
                </div>
              </div>

              <input
                className="req-buscador"
                placeholder="Buscar trámite dentro de esta categoría..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />

              {cargando && <p className="req-estado">Cargando trámites...</p>}
              {mensajeError && <p className="req-alerta">{mensajeError}</p>}

              {!cargando && tramitesFiltrados.length === 0 && (
                <div className="req-vacio">
                  <h3>No hay trámites disponibles</h3>
                  <p>No se encontraron trámites activos para esta categoría o búsqueda.</p>
                </div>
              )}

              <div className="req-tramites-grid">
                {tramitesFiltrados.map(tramite => (
                  <button
                    key={tramite.idTramite}
                    type="button"
                    className="req-tramite-card"
                    onClick={() => setTramiteSeleccionado(tramite)}
                  >
                    <span className="req-tramite-tipo">{categoriaActual.icono} {categoriaActual.nombre}</span>
                    <strong>{tramite.nombre}</strong>
                    {tramite.descripcion && <small>{tramite.descripcion}</small>}
                    <em>{formatearCosto(tramite.costo)}</em>
                  </button>
                ))}
              </div>
            </section>
          )}

          {tramiteSeleccionado && (
            <section className="req-panel req-detalle-simple">
              <div className="req-detalle-head">
                <button type="button" className="req-volver" onClick={volverATramites}>
                  ← Volver a trámites
                </button>
                <span className="req-badge">{categoriaActual.icono} {categoriaActual.nombre}</span>
              </div>

              <h2>{tramiteSeleccionado.nombre}</h2>
              {tramiteSeleccionado.descripcion && <p className="req-detalle-desc">{tramiteSeleccionado.descripcion}</p>}

              <div className="req-meta-grid">
                <div>
                  <span>Costo</span>
                  <strong>{formatearCosto(tramiteSeleccionado.costo)}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <strong>{tramiteSeleccionado.estado || 'activo'}</strong>
                </div>
              </div>

              <div className="req-requisitos-box">
                <h3>Requisitos</h3>

                {requisitos.length ? (
                  <ul className="req-lista">
                    {requisitos.map((requisito, indice) => (
                      <li key={`${requisito}-${indice}`}>{requisito}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="req-texto-suave">Este trámite no tiene requisitos cargados en el catálogo.</p>
                )}
              </div>

              <div className="req-acciones-finales">
                <a className="btn btn-primary" href={`/nuevo-tramite?tramite=${tramiteSeleccionado.idTramite}`}>
                  Crear nueva solicitud
                </a>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

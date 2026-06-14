import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import Header from '../components/layout/Header';
import './ReporteFuncionario.css';

export default function ReporteFuncionario() {
  const { usuario }             = useAuth();
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get(`${API}/tramites/reporte`)
      .then(r => setDatos(r.data))
      .catch(() => toast.error('Error al generar reporte'))
      .finally(() => setCargando(false));
  }, []);

  const volver = usuario?.rol === 'autoridad' ? '/autoridad' : '/funcionario';

  const imprimir = () => window.print();

  if (cargando) return <><Header /><div className="spinner" style={{ marginTop: 80 }} /></>;
  if (!datos)   return <><Header /><p style={{ padding: 40 }}>No se pudo cargar el reporte.</p></>;

  const { totales, resumen, recientes, generadoEn } = datos;
  const total = Number(totales?.total || 0);

  const pct = (n) => total > 0 ? ((Number(n) / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="rep-page">
      <Header />

      <div className="rep-container">

        {/* ── CABECERA DEL REPORTE ── */}
        <div className="rep-header no-print">
          <Link to={volver} className="btn btn-ghost btn-sm">← Volver al panel</Link>
          <button className="btn btn-primary btn-sm" onClick={imprimir}>
            🖨️ Imprimir / Exportar PDF
          </button>
        </div>

        {/* ── HOJA DE REPORTE (imprimible) ── */}
        <div className="rep-hoja" id="reporte-print">

          {/* Membrete institucional */}
          <div className="rep-membrete">
            <div className="rep-membrete-logo">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 9h20L12 2z"
                  stroke="#002A5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="rep-membrete-texto">
              <h1>Municipalidad de La Paz</h1>
              <p>Sistema de Gestión de Trámites Municipales</p>
              <p>Av. Mariscal Santa Cruz, La Paz — Bolivia</p>
            </div>
            <div className="rep-membrete-sello">
              <div className="rep-sello-circulo">
                <span>OFICIAL</span>
              </div>
            </div>
          </div>

          <div className="rep-separador" />

          {/* Título del documento */}
          <div className="rep-titulo-doc">
            <h2>REPORTE DE GESTIÓN DE TRÁMITES</h2>
            <div className="rep-meta-doc">
              <span>Generado por: <strong>{usuario?.nombre}</strong></span>
              <span>Rol: <strong style={{ textTransform: 'capitalize' }}>{usuario?.rol}</strong></span>
              <span>Fecha: <strong>{new Date(generadoEn).toLocaleString('es-BO', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}</strong></span>
            </div>
          </div>

          {/* ── RESUMEN EJECUTIVO ── */}
          <div className="rep-seccion">
            <h3 className="rep-seccion-titulo">1. Resumen Ejecutivo</h3>
            <div className="rep-kpis">
              <div className="rep-kpi rep-kpi-total">
                <span className="rep-kpi-num">{total}</span>
                <span className="rep-kpi-label">Total de solicitudes</span>
              </div>
              <div className="rep-kpi rep-kpi-pendiente">
                <span className="rep-kpi-num">{totales?.pendientes ?? 0}</span>
                <span className="rep-kpi-label">Pendientes</span>
                <span className="rep-kpi-pct">{pct(totales?.pendientes)}%</span>
              </div>
              <div className="rep-kpi rep-kpi-revision">
                <span className="rep-kpi-num">{totales?.en_revision ?? 0}</span>
                <span className="rep-kpi-label">En revisión</span>
                <span className="rep-kpi-pct">{pct(totales?.en_revision)}%</span>
              </div>
              <div className="rep-kpi rep-kpi-aprobada">
                <span className="rep-kpi-num">{totales?.aprobadas ?? 0}</span>
                <span className="rep-kpi-label">Aprobadas</span>
                <span className="rep-kpi-pct">{pct(totales?.aprobadas)}%</span>
              </div>
              <div className="rep-kpi rep-kpi-rechazada">
                <span className="rep-kpi-num">{totales?.rechazadas ?? 0}</span>
                <span className="rep-kpi-label">Rechazadas</span>
                <span className="rep-kpi-pct">{pct(totales?.rechazadas)}%</span>
              </div>
            </div>

            {/* Barra visual de distribución */}
            <div className="rep-barra-dist">
              <div className="rep-barra-label">Distribución global</div>
              <div className="rep-barra-track">
                {Number(totales?.pendientes) > 0 && (
                  <div className="rep-barra-seg rep-barra-pendiente"
                    style={{ width: `${pct(totales?.pendientes)}%` }}
                    title={`Pendientes: ${pct(totales?.pendientes)}%`} />
                )}
                {Number(totales?.en_revision) > 0 && (
                  <div className="rep-barra-seg rep-barra-revision"
                    style={{ width: `${pct(totales?.en_revision)}%` }}
                    title={`En revisión: ${pct(totales?.en_revision)}%`} />
                )}
                {Number(totales?.aprobadas) > 0 && (
                  <div className="rep-barra-seg rep-barra-aprobada"
                    style={{ width: `${pct(totales?.aprobadas)}%` }}
                    title={`Aprobadas: ${pct(totales?.aprobadas)}%`} />
                )}
                {Number(totales?.rechazadas) > 0 && (
                  <div className="rep-barra-seg rep-barra-rechazada"
                    style={{ width: `${pct(totales?.rechazadas)}%` }}
                    title={`Rechazadas: ${pct(totales?.rechazadas)}%`} />
                )}
              </div>
              <div className="rep-barra-leyenda">
                <span><i className="rep-dot rep-dot-pendiente" />Pendientes</span>
                <span><i className="rep-dot rep-dot-revision" />En revisión</span>
                <span><i className="rep-dot rep-dot-aprobada" />Aprobadas</span>
                <span><i className="rep-dot rep-dot-rechazada" />Rechazadas</span>
              </div>
            </div>
          </div>

          {/* ── DETALLE POR TIPO DE TRÁMITE ── */}
          <div className="rep-seccion">
            <h3 className="rep-seccion-titulo">2. Detalle por Tipo de Trámite</h3>
            {resumen && resumen.length > 0 ? (
              <table className="rep-tabla">
                <thead>
                  <tr>
                    <th>Tipo de Trámite</th>
                    <th className="th-num">Total</th>
                    <th className="th-num">Pendientes</th>
                    <th className="th-num">En Revisión</th>
                    <th className="th-num">Aprobadas</th>
                    <th className="th-num">Rechazadas</th>
                    <th className="th-num">Monto Recaudado</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'rep-fila-par' : ''}>
                      <td className="td-tramite">{r.tramite}</td>
                      <td className="th-num"><strong>{r.total}</strong></td>
                      <td className="th-num rep-col-pendiente">{r.pendientes}</td>
                      <td className="th-num rep-col-revision">{r.en_revision}</td>
                      <td className="th-num rep-col-aprobada">{r.aprobadas}</td>
                      <td className="th-num rep-col-rechazada">{r.rechazadas}</td>
                      <td className="th-num">
                        {Number(r.monto_total) > 0
                          ? <strong>Bs {Number(r.monto_total).toFixed(2)}</strong>
                          : <span style={{ color: 'var(--gris-texto)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="rep-fila-total">
                    <td><strong>TOTAL GENERAL</strong></td>
                    <td className="th-num"><strong>{total}</strong></td>
                    <td className="th-num"><strong>{totales?.pendientes ?? 0}</strong></td>
                    <td className="th-num"><strong>{totales?.en_revision ?? 0}</strong></td>
                    <td className="th-num"><strong>{totales?.aprobadas ?? 0}</strong></td>
                    <td className="th-num"><strong>{totales?.rechazadas ?? 0}</strong></td>
                    <td className="th-num">
                      <strong>Bs {resumen.reduce((acc, r) => acc + Number(r.monto_total || 0), 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="rep-vacio">No hay datos de trámites registrados.</p>
            )}
          </div>

          {/* ── ÚLTIMAS 20 SOLICITUDES ── */}
          <div className="rep-seccion rep-salto-pagina">
            <h3 className="rep-seccion-titulo">3. Registro Cronológico (últimas 20 solicitudes)</h3>
            {recientes && recientes.length > 0 ? (
              <table className="rep-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo de Trámite</th>
                    <th>Fecha Solicitud</th>
                    <th className="th-num">Costo (Bs)</th>
                    <th>Estado</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((s, i) => (
                    <tr key={s.idSolicitud} className={i % 2 === 0 ? 'rep-fila-par' : ''}>
                      <td style={{ color: 'var(--gris-texto)', fontFamily: 'monospace', fontSize: 12 }}>
                        #{s.idSolicitud}
                      </td>
                      <td className="td-tramite">{s.tramite}</td>
                      <td>{new Date(s.fechaSolicitud).toLocaleDateString('es-BO')}</td>
                      <td className="th-num">{s.costo === 0 ? 'Gratuito' : `Bs ${s.costo}`}</td>
                      <td>
                        <span className={`rep-badge ${
                          s.estado === 'aprobada'    ? 'rep-badge-aprobada'  :
                          s.estado === 'rechazada'   ? 'rep-badge-rechazada' :
                          s.estado === 'en_revision' ? 'rep-badge-revision'  :
                          'rep-badge-pendiente'
                        }`}>
                          {s.estado}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gris-texto)', maxWidth: 180 }}>
                        {s.observacion || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="rep-vacio">No hay solicitudes registradas aún.</p>
            )}
          </div>

          {/* ── INDICADORES DE GESTIÓN ── */}
          <div className="rep-seccion">
            <h3 className="rep-seccion-titulo">4. Indicadores de Gestión</h3>
            <div className="rep-indicadores">
              <div className="rep-indicador">
                <span className="rep-ind-titulo">Tasa de Aprobación</span>
                <span className="rep-ind-valor rep-ind-verde">
                  {total > 0
                    ? `${(((totales?.aprobadas ?? 0) / total) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="rep-indicador">
                <span className="rep-ind-titulo">Tasa de Rechazo</span>
                <span className="rep-ind-valor rep-ind-rojo">
                  {total > 0
                    ? `${(((totales?.rechazadas ?? 0) / total) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="rep-indicador">
                <span className="rep-ind-titulo">Solicitudes Resueltas</span>
                <span className="rep-ind-valor rep-ind-azul">
                  {total > 0
                    ? `${((( (totales?.aprobadas ?? 0) + (totales?.rechazadas ?? 0) ) / total) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="rep-indicador">
                <span className="rep-ind-titulo">Tipos de Trámite Activos</span>
                <span className="rep-ind-valor rep-ind-azul">
                  {resumen?.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* ── PIE DE REPORTE ── */}
          <div className="rep-pie">
            <div className="rep-pie-firmas">
              <div className="rep-firma">
                <div className="rep-firma-linea" />
                <p>Elaborado por</p>
                <p><strong>{usuario?.nombre}</strong></p>
                <p style={{ textTransform: 'capitalize' }}>{usuario?.rol} Municipal</p>
              </div>
              <div className="rep-firma">
                <div className="rep-firma-linea" />
                <p>Revisado por</p>
                <p><strong>Autoridad Competente</strong></p>
                <p>Municipalidad La Paz</p>
              </div>
              <div className="rep-firma">
                <div className="rep-firma-linea" />
                <p>Aprobado por</p>
                <p><strong>Dirección Municipal</strong></p>
                <p>La Paz — Bolivia</p>
              </div>
            </div>
            <p className="rep-pie-nota">
              Documento generado automáticamente por el Sistema de Gestión de Trámites de la Municipalidad de La Paz.
              Fecha de emisión: {new Date(generadoEn).toLocaleString('es-BO')}.
              Este reporte es de carácter oficial y confidencial.
            </p>
          </div>

        </div>{/* fin rep-hoja */}
      </div>
    </div>
  );
}

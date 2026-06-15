const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verificarToken, soloFuncionario, soloAutoridad } = require('../middleware/auth');
const upload  = require('../middleware/upload');


const columnasCache = new Map();

async function obtenerColumnas(nombreTabla) {
  const tabla = String(nombreTabla || '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!tabla) return new Set();
  if (columnasCache.has(tabla)) return columnasCache.get(tabla);

  try {
    const [rows] = await db.execute(`SHOW COLUMNS FROM \`${tabla}\``);
    const columnas = new Set(rows.map(columna => columna.Field));
    columnasCache.set(tabla, columnas);
    return columnas;
  } catch (error) {
    console.warn(`No se pudieron leer columnas de ${tabla}:`, error.message);
    const columnas = new Set();
    columnasCache.set(tabla, columnas);
    return columnas;
  }
}

async function existeTabla(nombreTabla) {
  const tabla = String(nombreTabla || '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!tabla) return false;

  try {
    const [rows] = await db.execute('SHOW TABLES LIKE ?', [tabla]);
    return rows.length > 0;
  } catch (error) {
    return false;
  }
}

function normalizarTipoTramite(tramite) {
  const texto = `${tramite.tipo_tramite || ''} ${tramite.nombre || ''} ${tramite.descripcion || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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

function construirInsertDinamico(tabla, campos) {
  const columnas = [];
  const marcas = [];
  const valores = [];

  for (const campo of campos) {
    columnas.push(campo.nombre);
    marcas.push(campo.sql || '?');
    if (!campo.sql) valores.push(campo.valor);
  }

  return {
    sql: `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${marcas.join(', ')})`,
    valores,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO PÚBLICO
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tramites/catalogo
router.get('/catalogo', async (req, res) => {
  try {
    const columnasTramite = await obtenerColumnas('TRAMITE');
    const tieneTipoTramite = columnasTramite.has('tipo_tramite');

    const campoTipo = tieneTipoTramite ? 't.tipo_tramite' : "'municipal' AS tipo_tramite";

    const [rows] = await db.execute(
      `SELECT t.idTramite, t.nombre, t.descripcion, t.requisitos, t.costo, t.estado,
              t.fechaCreacion, ${campoTipo},
              CONCAT(COALESCE(c.nombre,''),' ',COALESCE(c.apellido,'')) AS funcionario_nombre,
              f.cargo, f.departamento
       FROM TRAMITE t
       LEFT JOIN FUNCIONARIO f ON t.ci_funcionario = f.ci
       LEFT JOIN CIUDADANO   c ON f.ci = c.ci
       WHERE LOWER(t.estado) = 'activo'
       ORDER BY t.nombre`
    );

    const tramites = rows.map(tramite => ({
      ...tramite,
      tipo_tramite: normalizarTipoTramite(tramite),
    }));

    res.json(tramites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener catálogo' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CRUD TRÁMITES (solo funcionario)
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tramites — todos (incluye inactivos)
router.get('/', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.idTramite, t.nombre, t.descripcion, t.requisitos,
              t.costo, t.estado, t.fechaCreacion, t.ci_funcionario, t.tipo_tramite,
              CONCAT(c.nombre,' ',c.apellido) AS funcionario_nombre,
              f.cargo, f.departamento
       FROM TRAMITE t
       JOIN FUNCIONARIO f ON t.ci_funcionario = f.ci
       JOIN CIUDADANO   c ON f.ci = c.ci
       ORDER BY t.fechaCreacion DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener trámites' });
  }
});

// POST /api/tramites — crear trámite
router.post('/', verificarToken, soloFuncionario, async (req, res) => {
  const { nombre, descripcion, requisitos, costo, tipo_tramite } = req.body;
  const ci = req.usuario.ci;

  if (!nombre || costo === undefined || costo === '')
    return res.status(400).json({ mensaje: 'Nombre y costo son requeridos' });

  try {
    const [r] = await db.execute(
      `INSERT INTO TRAMITE (nombre, descripcion, requisitos, tipo_tramite, costo, estado, fechaCreacion, ci_funcionario)
       VALUES (?, ?, ?, ?, ?, 'activo', CURDATE(), ?)`,
      [nombre, descripcion || null, requisitos || null, tipo_tramite || 'municipal', parseFloat(costo), ci]
    );
    res.status(201).json({ mensaje: 'Trámite creado', idTramite: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear trámite' });
  }
});

// PUT /api/tramites/:id — editar trámite
router.put('/:id', verificarToken, soloFuncionario, async (req, res) => {
  const { nombre, descripcion, requisitos, costo, estado, tipo_tramite } = req.body;
  try {
    await db.execute(
      `UPDATE TRAMITE SET nombre=?, descripcion=?, requisitos=?, tipo_tramite=?, costo=?, estado=?
       WHERE idTramite=?`,
      [nombre, descripcion || null, requisitos || null, tipo_tramite || 'municipal', parseFloat(costo), estado, req.params.id]
    );
    res.json({ mensaje: 'Trámite actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar trámite' });
  }
});

// DELETE /api/tramites/:id — eliminar (solo si no tiene solicitudes)
router.delete('/:id', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [[{ n }]] = await db.execute(
      'SELECT COUNT(*) AS n FROM SOLICITUD WHERE idTramite=?', [req.params.id]
    );
    if (n > 0)
      return res.status(409).json({ mensaje: 'No se puede eliminar: tiene solicitudes asociadas' });

    await db.execute('DELETE FROM TRAMITE WHERE idTramite=?', [req.params.id]);
    res.json({ mensaje: 'Trámite eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar trámite' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO DE TRÁMITE
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tramites/:id/flujo — obtener flujo de un trámite
router.get('/:id/flujo', async (req, res) => {
  try {
    const existeFlujo = await existeTabla('FLUJO_TRAMITE');
    if (!existeFlujo) return res.json([]);

    const [rows] = await db.execute(
      'SELECT orden, institucion, accion, descripcion FROM FLUJO_TRAMITE WHERE idTramite=? ORDER BY orden',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SOLICITUDES — consultas por estado (funcionario)
// ─────────────────────────────────────────────────────────────────────────────
const consultaSolicitud = `
  SELECT s.idSolicitud, s.fechaSolicitud, s.estado, s.observacion, s.ci_ciudadano,
         s.institucion_origen, s.institucion_actual, s.estado_umsa, s.estado_municipio,
         t.idTramite, t.nombre AS tramite, t.costo, t.tipo_tramite,
         CONCAT(c.nombre, ' ', c.apellido) AS ciudadano_nombre,
         c.telefono AS ciudadano_telefono, u.email AS ciudadano_email
  FROM SOLICITUD s
  JOIN TRAMITE t ON s.idTramite = t.idTramite
  LEFT JOIN CIUDADANO c ON s.ci_ciudadano = c.ci
  LEFT JOIN USUARIO u ON c.ci = u.ci
`;

// GET /api/tramites/mis-solicitudes — del ciudadano autenticado
router.get('/mis-solicitudes', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'ciudadano')
    return res.status(403).json({ mensaje: 'Solo para ciudadanos' });

  try {
    const columnasSolicitud = await obtenerColumnas('SOLICITUD');
    const columnasTramite = await obtenerColumnas('TRAMITE');

    const tieneCiudadano = columnasSolicitud.has('ci_ciudadano');
    const tieneInstitucion = columnasSolicitud.has('institucion_actual');
    const tieneEstadoUmsa = columnasSolicitud.has('estado_umsa');
    const tieneEstadoMunicipio = columnasSolicitud.has('estado_municipio');
    const tieneTipoTramite = columnasTramite.has('tipo_tramite');

    const selectInstitucion = tieneInstitucion ? 's.institucion_actual' : "'municipio' AS institucion_actual";
    const selectEstadoUmsa = tieneEstadoUmsa ? 's.estado_umsa' : "'pendiente' AS estado_umsa";
    const selectEstadoMunicipio = tieneEstadoMunicipio ? 's.estado_municipio' : "'pendiente' AS estado_municipio";
    const selectTipo = tieneTipoTramite ? 't.tipo_tramite' : "'municipal' AS tipo_tramite";
    const where = tieneCiudadano ? 'WHERE s.ci_ciudadano = ?' : '';
    const params = tieneCiudadano ? [req.usuario.ci] : [];

    const [rows] = await db.execute(
      `SELECT s.idSolicitud, s.fechaSolicitud, s.estado, s.observacion,
              ${selectInstitucion}, ${selectEstadoUmsa}, ${selectEstadoMunicipio},
              t.idTramite, t.nombre AS tramite, t.costo, ${selectTipo}
       FROM SOLICITUD s
       JOIN TRAMITE t ON s.idTramite = t.idTramite
       ${where}
       ORDER BY s.fechaSolicitud DESC`,
      params
    );

    res.json(rows.map(solicitud => ({
      ...solicitud,
      tipo_tramite: normalizarTipoTramite({
        tipo_tramite: solicitud.tipo_tramite,
        nombre: solicitud.tramite,
      }),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
  }
});

// GET /api/tramites/solicitudes — todas
router.get('/solicitudes', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const query = req.usuario.rol === 'gestor_umsa'
      ? consultaSolicitud + " WHERE t.tipo_tramite IN ('umsa','convenio') ORDER BY s.fechaSolicitud DESC"
      : consultaSolicitud + ' ORDER BY s.fechaSolicitud DESC';
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// GET /api/tramites/solicitudes/pendientes
router.get('/solicitudes/pendientes', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const query = req.usuario.rol === 'gestor_umsa'
      ? consultaSolicitud + " WHERE s.estado='pendiente' AND t.tipo_tramite IN ('umsa','convenio') ORDER BY s.fechaSolicitud ASC"
      : consultaSolicitud + " WHERE s.estado='pendiente' ORDER BY s.fechaSolicitud ASC";
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// GET /api/tramites/solicitudes/aceptadas
router.get('/solicitudes/aceptadas', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const query = req.usuario.rol === 'gestor_umsa'
      ? consultaSolicitud + " WHERE s.estado='aprobada' AND t.tipo_tramite IN ('umsa','convenio') ORDER BY s.fechaSolicitud DESC"
      : consultaSolicitud + " WHERE s.estado='aprobada' ORDER BY s.fechaSolicitud DESC";
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// GET /api/tramites/solicitudes/rechazadas
router.get('/solicitudes/rechazadas', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const query = req.usuario.rol === 'gestor_umsa'
      ? consultaSolicitud + " WHERE s.estado='rechazada' AND t.tipo_tramite IN ('umsa','convenio') ORDER BY s.fechaSolicitud DESC"
      : consultaSolicitud + " WHERE s.estado='rechazada' ORDER BY s.fechaSolicitud DESC";
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// GET /api/tramites/solicitudes/:id — detalle con pago, documentos y ciudadano
router.get('/solicitudes/:id', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [[sol]] = await db.execute(
      `SELECT s.idSolicitud, s.fechaSolicitud, s.estado, s.observacion, s.ci_ciudadano,
              t.idTramite, t.nombre AS tramite_nombre, t.descripcion AS tramite_desc,
              t.requisitos, t.costo, t.tipo_tramite,
              CONCAT(c.nombre, ' ', c.apellido) AS ciudadano_nombre,
              c.telefono AS ciudadano_telefono, c.direccion AS ciudadano_direccion,
              u.email AS ciudadano_email,
              p.idPago, p.monto, p.fecha AS fecha_pago, p.metodo, p.estado AS estado_pago,
              comp.numero AS comp_numero, comp.fecha AS comp_fecha, comp.url AS comp_url
       FROM SOLICITUD s
       JOIN TRAMITE      t    ON s.idTramite     = t.idTramite
       LEFT JOIN CIUDADANO c  ON s.ci_ciudadano  = c.ci
       LEFT JOIN USUARIO u    ON c.ci            = u.ci
       LEFT JOIN PAGO    p    ON p.idSolicitud   = s.idSolicitud
       LEFT JOIN COMPROBANTE comp ON comp.idPago = p.idPago
       WHERE s.idSolicitud = ?`,
      [req.params.id]
    );
    if (!sol) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });

    const [documentos] = await db.execute(
      `SELECT d.idDoc, d.nombre, d.tipo, d.fechaEmision, d.estado
       FROM DOCUMENTO d
       JOIN PRODUCE pr ON pr.idDoc = d.idDoc
       WHERE pr.idSolicitud = ?`,
      [req.params.id]
    );

    res.json({ ...sol, documentos });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al obtener detalle' }); }
});

// PATCH /api/tramites/solicitudes/:id/estado
// Flujo interinstitucional: UMSA → Municipio → Autoridad
router.patch('/solicitudes/:id/estado', verificarToken, soloFuncionario, async (req, res) => {
  const { estado, observacion } = req.body;
  const rol = req.usuario.rol;

  const permitidosFuncionario = ['en_revision', 'rechazada'];
  const permitidosAutoridad   = ['aprobada', 'rechazada'];
  const permitidosGestor      = ['en_revision'];

  if (rol === 'funcionario' && !permitidosFuncionario.includes(estado))
    return res.status(403).json({ mensaje: 'El funcionario solo puede enviar a revisión o rechazar' });

  if (rol === 'autoridad' && !permitidosAutoridad.includes(estado))
    return res.status(403).json({ mensaje: 'La autoridad solo puede aprobar o rechazar definitivamente' });

  if (rol === 'gestor_umsa' && !permitidosGestor.includes(estado))
    return res.status(403).json({ mensaje: 'El gestor UMSA solo puede validar y enviar a revisión' });

  if (!['en_revision', 'aprobada', 'rechazada'].includes(estado))
    return res.status(400).json({ mensaje: 'Estado inválido' });

  try {
    const [[solActual]] = await db.execute(
      'SELECT estado, institucion_actual, estado_umsa, estado_municipio FROM SOLICITUD WHERE idSolicitud=?',
      [req.params.id]
    );
    if (!solActual) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });

    // Determinar nueva institucion_actual según rol
    let nuevaInstitucion = solActual.institucion_actual;
    let nuevoEstadoUmsa = solActual.estado_umsa;
    let nuevoEstadoMunicipio = solActual.estado_municipio;

    if (rol === 'gestor_umsa' && estado === 'en_revision') {
      nuevoEstadoUmsa = 'validado';
      nuevaInstitucion = 'municipio';
    } else if (rol === 'funcionario' && estado === 'en_revision') {
      nuevoEstadoMunicipio = 'en_revision';
      nuevaInstitucion = 'autoridad';
    } else if (rol === 'autoridad' && estado === 'aprobada') {
      nuevoEstadoMunicipio = 'aprobado';
      nuevaInstitucion = 'finalizado';
    } else if (estado === 'rechazada') {
      nuevaInstitucion = 'finalizado';
      if (rol === 'gestor_umsa') nuevoEstadoUmsa = 'rechazado';
      if (rol === 'funcionario' || rol === 'autoridad') nuevoEstadoMunicipio = 'rechazado';
    }

    await db.execute(
      `UPDATE SOLICITUD SET estado=?, observacion=?, institucion_actual=?, estado_umsa=?, estado_municipio=?
       WHERE idSolicitud=?`,
      [estado, observacion || null, nuevaInstitucion, nuevoEstadoUmsa, nuevoEstadoMunicipio, req.params.id]
    );

    const institucionActor = rol === 'gestor_umsa' ? 'umsa' : rol === 'autoridad' ? 'autoridad' : 'municipio';
    await db.execute(
      `INSERT INTO HISTORIAL_ESTADO (idSolicitud, estadoAnterior, estadoNuevo, institucion, ciActor, observacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, solActual.estado, estado, institucionActor, req.usuario.ci, observacion || null]
    );

    res.json({ mensaje: `Solicitud actualizada a "${estado}"`, institucion_actual: nuevaInstitucion });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al actualizar' }); }
});

// DELETE /api/tramites/solicitudes/:id
router.delete('/solicitudes/:id', verificarToken, soloFuncionario, async (req, res) => {
  try {
    await db.execute('DELETE FROM SOLICITUD WHERE idSolicitud=?', [req.params.id]);
    res.json({ mensaje: 'Solicitud eliminada' });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al eliminar' }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// NUEVA SOLICITUD (ciudadano)
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tramites/solicitudes — con adjunto de archivos
router.post('/solicitudes', verificarToken, upload.array('documentos', 10), async (req, res) => {
  const { idTramite } = req.body;
  if (!idTramite) return res.status(400).json({ mensaje: 'Tipo de trámite requerido' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const columnasTramite = await obtenerColumnas('TRAMITE');
    const columnasSolicitud = await obtenerColumnas('SOLICITUD');
    const tieneTipoTramite = columnasTramite.has('tipo_tramite');

    const [[tram]] = await conn.execute(
      `SELECT *, ${tieneTipoTramite ? 'tipo_tramite' : "'municipal' AS tipo_tramite"}
       FROM TRAMITE WHERE idTramite=? AND LOWER(estado)='activo'`,
      [idTramite]
    );

    if (!tram) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Trámite no encontrado o inactivo' });
    }

    tram.tipo_tramite = normalizarTipoTramite(tram);
    const instActual = tram.tipo_tramite === 'umsa' || tram.tipo_tramite === 'convenio' ? 'umsa' : 'municipio';

    const camposSolicitud = [
      { nombre: 'fechaSolicitud', sql: 'CURDATE()' },
      { nombre: 'estado', valor: 'pendiente' },
      { nombre: 'observacion', valor: null },
      { nombre: 'idTramite', valor: idTramite },
    ];

    if (columnasSolicitud.has('ci_ciudadano')) {
      camposSolicitud.push({ nombre: 'ci_ciudadano', valor: req.usuario.ci });
    }

    if (columnasSolicitud.has('institucion_origen')) {
      camposSolicitud.push({ nombre: 'institucion_origen', valor: 'ciudadano' });
    }

    if (columnasSolicitud.has('institucion_actual')) {
      camposSolicitud.push({ nombre: 'institucion_actual', valor: instActual });
    }

    if (columnasSolicitud.has('estado_umsa')) {
      camposSolicitud.push({ nombre: 'estado_umsa', valor: 'pendiente' });
    }

    if (columnasSolicitud.has('estado_municipio')) {
      camposSolicitud.push({ nombre: 'estado_municipio', valor: 'pendiente' });
    }

    const insertSolicitud = construirInsertDinamico('SOLICITUD', camposSolicitud);
    const [sRes] = await conn.execute(insertSolicitud.sql, insertSolicitud.valores);
    const idSolicitud = sRes.insertId;

    for (const archivo of (req.files || [])) {
      const [dRes] = await conn.execute(
        `INSERT INTO DOCUMENTO (nombre, tipo, fechaEmision, estado)
         VALUES (?, ?, CURDATE(), 'generado')`,
        [archivo.filename, archivo.mimetype]
      );
      await conn.execute(
        'INSERT INTO PRODUCE (idSolicitud, idDoc) VALUES (?,?)',
        [idSolicitud, dRes.insertId]
      );
    }

    await conn.execute(
      `INSERT INTO PAGO (monto, fecha, metodo, estado, idSolicitud)
       VALUES (?, CURDATE(), 'pendiente', 'pendiente', ?)`,
      [tram.costo || 0, idSolicitud]
    );

    await conn.commit();
    res.status(201).json({ mensaje: 'Solicitud enviada exitosamente', idSolicitud });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear solicitud', detalle: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/tramites/reporte — reporte de gestión para funcionario/autoridad
router.get('/reporte', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [resumen] = await db.execute(
      `SELECT t.nombre AS tramite,
              COUNT(s.idSolicitud)                                         AS total,
              SUM(s.estado = 'pendiente')                                  AS pendientes,
              SUM(s.estado = 'en_revision')                                AS en_revision,
              SUM(s.estado = 'aprobada')                                   AS aprobadas,
              SUM(s.estado = 'rechazada')                                  AS rechazadas,
              COALESCE(SUM(p.monto), 0)                                    AS monto_total
       FROM TRAMITE t
       LEFT JOIN SOLICITUD s ON s.idTramite = t.idTramite
       LEFT JOIN PAGO      p ON p.idSolicitud = s.idSolicitud AND p.estado = 'pagado'
       GROUP BY t.idTramite, t.nombre
       ORDER BY total DESC`
    );

    const [recientes] = await db.execute(
      `SELECT s.idSolicitud, s.fechaSolicitud, s.estado, s.observacion,
              t.nombre AS tramite, t.costo
       FROM SOLICITUD s
       JOIN TRAMITE t ON s.idTramite = t.idTramite
       ORDER BY s.fechaSolicitud DESC
       LIMIT 20`
    );

    const [[totales]] = await db.execute(
      `SELECT COUNT(*)                          AS total,
              SUM(estado='pendiente')           AS pendientes,
              SUM(estado='en_revision')         AS en_revision,
              SUM(estado='aprobada')            AS aprobadas,
              SUM(estado='rechazada')           AS rechazadas
       FROM SOLICITUD`
    );

    res.json({ resumen, recientes, totales, generadoEn: new Date().toISOString() });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al generar reporte' }); }
});

module.exports = router;

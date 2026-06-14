const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verificarToken, soloFuncionario, soloGestorUmsa } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// FACULTADES Y CARRERAS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/umsa/facultades
router.get('/facultades', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT idFacultad, nombre, sigla FROM FACULTAD_UMSA ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// GET /api/umsa/carreras?facultad=:id
router.get('/carreras', async (req, res) => {
  try {
    let query = `SELECT c.idCarrera, c.nombre, c.codigo, c.idFacultad, f.nombre AS facultad,
                        f.sigla AS facultad_sigla
                 FROM CARRERA_UMSA c
                 JOIN FACULTAD_UMSA f ON c.idFacultad = f.idFacultad`;
    const params = [];
    if (req.query.facultad) {
      query += ' WHERE c.idFacultad = ?';
      params.push(req.query.facultad);
    }
    query += ' ORDER BY f.nombre, c.nombre';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIOS UMSA-MUNICIPIO
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/umsa/convenios
router.get('/convenios', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT cv.idConvenio, cv.titulo, cv.tipo, cv.descripcion,
              cv.fechaInicio, cv.fechaFin, cv.estado,
              cv.fechaCreacion,
              CONCAT(c.nombre, ' ', c.apellido) AS creador_nombre
       FROM CONVENIO cv
       LEFT JOIN FUNCIONARIO f ON cv.ciCreador = f.ci
       LEFT JOIN CIUDADANO   c ON f.ci = c.ci
       ORDER BY cv.fechaCreacion DESC`
    );

    for (const conv of rows) {
      const [partes] = await db.execute(
        'SELECT idParte, entidad, representante, cargo FROM PARTE_CONVENIO WHERE idConvenio=?',
        [conv.idConvenio]
      );
      conv.partes = partes;
    }

    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al obtener convenios' }); }
});

// GET /api/umsa/convenios/activos
router.get('/convenios/activos', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT idConvenio, titulo, tipo, descripcion, fechaInicio, fechaFin
       FROM CONVENIO WHERE estado = 'activo' ORDER BY fechaInicio DESC`
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// POST /api/umsa/convenios
router.post('/convenios', verificarToken, soloFuncionario, async (req, res) => {
  const { titulo, tipo, descripcion, fechaInicio, fechaFin, partes } = req.body;
  if (!titulo || !tipo || !fechaInicio)
    return res.status(400).json({ mensaje: 'Título, tipo y fecha de inicio requeridos' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.execute(
      `INSERT INTO CONVENIO (titulo, tipo, descripcion, fechaInicio, fechaFin, estado, ciCreador)
       VALUES (?, ?, ?, ?, ?, 'activo', ?)`,
      [titulo, tipo, descripcion || null, fechaInicio, fechaFin || null, req.usuario.ci]
    );
    const idConvenio = r.insertId;

    if (partes && partes.length > 0) {
      for (const p of partes) {
        await conn.execute(
          'INSERT INTO PARTE_CONVENIO (idConvenio, entidad, representante, cargo) VALUES (?,?,?,?)',
          [idConvenio, p.entidad, p.representante, p.cargo]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Convenio creado', idConvenio });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear convenio' });
  } finally { conn.release(); }
});

// PUT /api/umsa/convenios/:id
router.put('/convenios/:id', verificarToken, soloFuncionario, async (req, res) => {
  const { titulo, descripcion, fechaInicio, fechaFin, estado } = req.body;
  try {
    await db.execute(
      'UPDATE CONVENIO SET titulo=?, descripcion=?, fechaInicio=?, fechaFin=?, estado=? WHERE idConvenio=?',
      [titulo, descripcion, fechaInicio, fechaFin || null, estado, req.params.id]
    );
    res.json({ mensaje: 'Convenio actualizado' });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al actualizar' }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRÁCTICAS PRE-PROFESIONALES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/umsa/practicas
router.get('/practicas', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const filtro = req.usuario.rol === 'gestor_umsa'
      ? '' : ' WHERE 1=1';
    const [rows] = await db.execute(
      `SELECT p.idPractica, p.ciEstudiante, p.carrera, p.duracion,
              p.fechaInicio, p.fechaFin, p.estado, p.observacion,
              cv.titulo AS convenio_titulo,
              CONCAT(c.nombre, ' ', c.apellido) AS estudiante_nombre,
              c.telefono AS estudiante_telefono
       FROM PRACTICA p
       LEFT JOIN CONVENIO cv ON p.idConvenio = cv.idConvenio
       LEFT JOIN CIUDADANO c ON p.ciEstudiante = c.ci
       ORDER BY p.fechaInicio DESC`
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

// POST /api/umsa/practicas
router.post('/practicas', verificarToken, async (req, res) => {
  const { idConvenio, carrera, duracion, fechaInicio } = req.body;
  if (!carrera || !duracion || !fechaInicio)
    return res.status(400).json({ mensaje: 'Carrera, duración y fecha requeridos' });

  try {
    const [r] = await db.execute(
      `INSERT INTO PRACTICA (idConvenio, ciEstudiante, carrera, duracion, fechaInicio, estado)
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
      [idConvenio || null, req.usuario.ci, carrera, duracion, fechaInicio]
    );
    res.status(201).json({ mensaje: 'Práctica registrada', idPractica: r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error al registrar' }); }
});

// PATCH /api/umsa/practicas/:id/estado
router.patch('/practicas/:id/estado', verificarToken, soloFuncionario, async (req, res) => {
  const { estado, observacion } = req.body;
  if (!['aceptada', 'rechazada', 'finalizada'].includes(estado))
    return res.status(400).json({ mensaje: 'Estado inválido' });

  try {
    await db.execute(
      'UPDATE PRACTICA SET estado=?, observacion=? WHERE idPractica=?',
      [estado, observacion || null, req.params.id]
    );
    res.json({ mensaje: `Práctica actualizada a "${estado}"` });
  } catch (err) { console.error(err); res.status(500).json({ mensaje: 'Error' }); }
});

module.exports = router;

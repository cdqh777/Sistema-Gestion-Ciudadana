const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');

// ─── POST /api/auth/registro ───────────────────────────────────────────────
router.post('/registro', async (req, res) => {
  const { ci, nombre, apellido, email, password, telefono, direccion,
          estudia, institucion_estudio, dir_estudio,
          trabaja, empresa_trabajo, dir_trabajo, idCarrera } = req.body;

  if (!ci || !nombre || !apellido || !email || !password)
    return res.status(400).json({ mensaje: 'Campos obligatorios incompletos' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.execute(
      'SELECT ci FROM USUARIO WHERE ci = ? OR email = ?', [ci, email]
    );
    if (existe.length)
      return res.status(409).json({ mensaje: 'El CI o email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    await conn.execute(
      'INSERT INTO USUARIO (ci, email, password, estado) VALUES (?,?,?,1)',
      [ci, email, hash]
    );

    await conn.execute(
      `INSERT INTO CIUDADANO (ci, nombre, apellido, telefono, direccion,
        estudia, institucion_estudio, dir_estudio,
        trabaja, empresa_trabajo, dir_trabajo, idCarrera)
       VALUES (?,?,?,?,?, ?,?,?, ?,?,?, ?)`,
      [ci, nombre, apellido, telefono || null, direccion || null,
       estudia ? 1 : 0, institucion_estudio || null, dir_estudio || null,
       trabaja ? 1 : 0, empresa_trabajo || null, dir_trabajo || null,
       idCarrera || null]
    );

    await conn.commit();
    res.status(201).json({ mensaje: 'Registro exitoso' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno' });
  } finally { conn.release(); }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { ci, password } = req.body;
  if (!ci || !password)
    return res.status(400).json({ mensaje: 'CI y contraseña requeridos' });

  try {
    const [rows] = await db.execute(
      'SELECT ci, email, password, estado FROM USUARIO WHERE ci = ?', [ci]
    );
    if (!rows.length || rows[0].estado === 0)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas o usuario inactivo' });

    const u = rows[0];
    const match = await bcrypt.compare(password, u.password);
    if (!match)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    // Determinar rol
    const [[ciudadano]]   = await db.execute('SELECT ci,nombre,apellido FROM CIUDADANO WHERE ci=?', [ci]);
    const [[funcionario]] = await db.execute('SELECT ci,cargo,departamento FROM FUNCIONARIO WHERE ci=?', [ci]);
    const [[autoridad]]   = await db.execute('SELECT ci,cargo FROM AUTORIDAD WHERE ci=?', [ci]);
    const [[gestor]]      = await db.execute('SELECT ci,cargo FROM GESTOR_UMSA WHERE ci=?', [ci]);

    let rol = 'ciudadano';
    let nombre = '';
    if (gestor)      { rol = 'gestor_umsa'; nombre = `Gestor UMSA: ${gestor.cargo}`; }
    if (funcionario) { rol = 'funcionario';  nombre = `Func. ${funcionario.cargo}`; }
    if (autoridad)   { rol = 'autoridad';    nombre = autoridad.cargo; }
    if (ciudadano)   { nombre = ciudadano.nombre + ' ' + ciudadano.apellido; }

    const token = jwt.sign(
      { ci: u.ci, email: u.email, rol, nombre },
      process.env.JWT_SECRET || 'municipalidad_secret_2025',
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { ci: u.ci, email: u.email, rol, nombre } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno' });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verificarToken, soloFuncionario } = require('../middleware/auth');

// GET /api/usuarios/me — perfil del usuario autenticado
router.get('/me', verificarToken, async (req, res) => {
  try {
    const [[u]] = await db.execute(
      'SELECT ci, email, estado FROM USUARIO WHERE ci=?', [req.usuario.ci]
    );
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const [[ciudadano]]   = await db.execute('SELECT * FROM CIUDADANO WHERE ci=?',   [req.usuario.ci]);
    const [[funcionario]] = await db.execute('SELECT * FROM FUNCIONARIO WHERE ci=?', [req.usuario.ci]);
    const [[autoridad]]   = await db.execute('SELECT * FROM AUTORIDAD WHERE ci=?',   [req.usuario.ci]);

    res.json({
      ...u,
      rol: req.usuario.rol,
      ciudadano:   ciudadano   || null,
      funcionario: funcionario || null,
      autoridad:   autoridad   || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

// GET /api/usuarios — lista todos los ciudadanos (solo funcionario)
router.get('/', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.ci, u.email, u.estado,
              c.nombre, c.apellido, c.telefono, c.direccion
       FROM USUARIO u
       JOIN CIUDADANO c ON u.ci = c.ci
       ORDER BY c.apellido, c.nombre`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// GET /api/usuarios/funcionarios — lista funcionarios
router.get('/funcionarios', verificarToken, soloFuncionario, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.ci, u.email, u.estado,
              c.nombre, c.apellido,
              f.cargo, f.departamento
       FROM USUARIO u
       JOIN CIUDADANO  c ON u.ci = c.ci
       JOIN FUNCIONARIO f ON u.ci = f.ci
       ORDER BY f.departamento, c.apellido`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener funcionarios' });
  }
});

// PATCH /api/usuarios/:ci/estado — activar / desactivar usuario
router.patch('/:ci/estado', verificarToken, soloFuncionario, async (req, res) => {
  const { estado } = req.body;
  if (estado === undefined)
    return res.status(400).json({ mensaje: 'Campo "estado" requerido' });
  try {
    await db.execute(
      'UPDATE USUARIO SET estado=? WHERE ci=?',
      [estado ? 1 : 0, req.params.ci]
    );
    res.json({ mensaje: `Usuario ${estado ? 'activado' : 'desactivado'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar estado' });
  }
});

module.exports = router;

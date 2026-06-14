const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const db      = require('../config/db');
const { verificarToken } = require('../middleware/auth');

// GET /api/documentos/solicitud/:id — listar docs de una solicitud
router.get('/solicitud/:id', verificarToken, async (req, res) => {
  try {
    const [docs] = await db.execute(
      `SELECT d.idDoc, d.nombre, d.tipo, d.fechaEmision, d.estado
       FROM DOCUMENTO d
       JOIN PRODUCE pr ON pr.idDoc = d.idDoc
       WHERE pr.idSolicitud = ?
       ORDER BY d.fechaEmision ASC`,
      [req.params.id]
    );
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener documentos' });
  }
});

// GET /api/documentos/ver/:id — servir/descargar un documento
router.get('/ver/:id', verificarToken, async (req, res) => {
  try {
    const [[doc]] = await db.execute(
      'SELECT * FROM DOCUMENTO WHERE idDoc=?', [req.params.id]
    );
    if (!doc) return res.status(404).json({ mensaje: 'Documento no encontrado' });

    const filePath = path.join(__dirname, '../uploads', doc.nombre);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ mensaje: 'Archivo físico no encontrado en servidor' });

    res.setHeader('Content-Type', doc.tipo);
    res.setHeader('Content-Disposition', `inline; filename="${doc.nombre}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener documento' });
  }
});

// DELETE /api/documentos/:id — eliminar documento y archivo físico
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const [[doc]] = await db.execute(
      'SELECT * FROM DOCUMENTO WHERE idDoc=?', [req.params.id]
    );
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });

    // Eliminar relación en PRODUCE
    await db.execute('DELETE FROM PRODUCE WHERE idDoc=?', [req.params.id]);

    // Eliminar archivo físico si existe
    const filePath = path.join(__dirname, '../uploads', doc.nombre);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.execute('DELETE FROM DOCUMENTO WHERE idDoc=?', [req.params.id]);
    res.json({ mensaje: 'Documento eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar documento' });
  }
});

module.exports = router;

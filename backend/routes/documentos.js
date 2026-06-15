const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { verificarToken } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'municipalidad_secret_2025';
const CARPETA_UPLOADS = path.join(__dirname, '../uploads');

function nombreSeguro(nombre) {
  return String(nombre || '').replace(/[\\/]/g, '').trim();
}

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.-]/g, '');
}

function buscarArchivoFisico(nombreGuardado) {
  const nombre = nombreSeguro(nombreGuardado);
  const rutaExacta = path.join(CARPETA_UPLOADS, nombre);

  if (nombre && fs.existsSync(rutaExacta)) {
    return rutaExacta;
  }

  if (!fs.existsSync(CARPETA_UPLOADS)) {
    return null;
  }

  const nombreNormalizado = normalizarTexto(nombre);
  const extension = path.extname(nombreNormalizado);
  const base = path.basename(nombreNormalizado, extension);

  const candidatos = fs.readdirSync(CARPETA_UPLOADS)
    .filter(archivo => {
      const archivoNormalizado = normalizarTexto(archivo);

      return (
        archivoNormalizado === nombreNormalizado ||
        archivoNormalizado.endsWith(`_${nombreNormalizado}`) ||
        Boolean(extension && archivoNormalizado.endsWith(extension) && archivoNormalizado.includes(base))
      );
    })
    .map(archivo => {
      const ruta = path.join(CARPETA_UPLOADS, archivo);
      return {
        archivo,
        ruta,
        modificado: fs.statSync(ruta).mtimeMs,
      };
    })
    .sort((a, b) => b.modificado - a.modificado);

  return candidatos[0]?.ruta || null;
}

function verificarTokenParaArchivo(req, res, next) {
  const header = req.headers.authorization;
  const tokenHeader = header && header.split(' ')[1];
  const tokenQuery = req.query.token;
  const token = tokenHeader || tokenQuery;

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido para ver el documento' });
  }

  try {
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
}

// GET /api/documentos/solicitud/:id — listar documentos de una solicitud
router.get('/solicitud/:id', verificarToken, async (req, res) => {
  try {
    const [docs] = await db.execute(
      `SELECT d.idDoc, d.nombre, d.tipo, d.fechaEmision, d.estado
       FROM DOCUMENTO d
       JOIN PRODUCE pr ON pr.idDoc = d.idDoc
       WHERE pr.idSolicitud = ?
       ORDER BY d.fechaEmision ASC, d.idDoc ASC`,
      [req.params.id]
    );

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener documentos' });
  }
});

// GET /api/documentos/ver/:id — visualizar/descargar un documento por su ID
router.get('/ver/:id', verificarTokenParaArchivo, async (req, res) => {
  try {
    const [[doc]] = await db.execute(
      'SELECT * FROM DOCUMENTO WHERE idDoc = ?',
      [req.params.id]
    );

    if (!doc) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    const rutaArchivo = buscarArchivoFisico(doc.nombre);

    if (!rutaArchivo) {
      return res.status(404).json({
        mensaje: 'Archivo físico no encontrado en servidor',
        archivo_guardado: doc.nombre,
      });
    }

    const nombreDescarga = nombreSeguro(doc.nombre) || path.basename(rutaArchivo);
    const tipo = doc.tipo || 'application/octet-stream';

    res.setHeader('Content-Type', tipo);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(nombreDescarga)}"`);
    res.sendFile(rutaArchivo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener documento' });
  }
});

// DELETE /api/documentos/:id — eliminar documento y archivo físico
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const [[doc]] = await db.execute(
      'SELECT * FROM DOCUMENTO WHERE idDoc = ?',
      [req.params.id]
    );

    if (!doc) {
      return res.status(404).json({ mensaje: 'No encontrado' });
    }

    await db.execute('DELETE FROM PRODUCE WHERE idDoc = ?', [req.params.id]);

    const rutaArchivo = buscarArchivoFisico(doc.nombre);
    if (rutaArchivo && fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    await db.execute('DELETE FROM DOCUMENTO WHERE idDoc = ?', [req.params.id]);
    res.json({ mensaje: 'Documento eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar documento' });
  }
});

module.exports = router;

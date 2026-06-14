const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'municipalidad_secret_2025';

const verificarToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });
  try {
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch { return res.status(403).json({ mensaje: 'Token inválido' }); }
};

const soloFuncionario = (req, res, next) => {
  if (!['funcionario', 'autoridad', 'gestor_umsa'].includes(req.usuario.rol))
    return res.status(403).json({ mensaje: 'Acceso solo para funcionarios' });
  next();
};

const soloAutoridad = (req, res, next) => {
  if (req.usuario.rol !== 'autoridad')
    return res.status(403).json({ mensaje: 'Acceso solo para autoridades' });
  next();
};

const soloGestorUmsa = (req, res, next) => {
  if (req.usuario.rol !== 'gestor_umsa')
    return res.status(403).json({ mensaje: 'Acceso solo para gestores UMSA' });
  next();
};

module.exports = { verificarToken, soloFuncionario, soloAutoridad, soloGestorUmsa };

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes       = require('./routes/auth');
const tramitesRoutes   = require('./routes/tramites');
const documentosRoutes = require('./routes/documentos');
const usuariosRoutes   = require('./routes/usuarios');
const umsaRoutes       = require('./routes/umsa');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       authRoutes);
app.use('/api/tramites',   tramitesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/usuarios',   usuariosRoutes);
app.use('/api/umsa',       umsaRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend en http://localhost:${PORT}`));

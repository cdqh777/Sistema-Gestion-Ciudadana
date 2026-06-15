# 🏛️ Municipalidad La Paz — Sistema de Gestión de Trámites

Sistema web completo (Node.js + React + MySQL) para la Municipalidad de La Paz. Permite a ciudadanos registrar solicitudes de trámites y a funcionarios gestionarlas con visor de documentos integrado.

---

## 🗃️ Base de Datos — MySQL

> **Nombre de la BD:** `GestionTramitesMunicipales`  
> El archivo `db.sql` contiene el script completo para crear todas las tablas e insertar datos de prueba.

### Esquema de tablas

| Tabla | Descripción |
|-------|-------------|
| `USUARIO` | Autenticación: CI, email, password, estado (activo/inactivo) |
| `CIUDADANO` | Perfil extendido del ciudadano (FK → USUARIO) |
| `FUNCIONARIO` | Cargo y departamento del funcionario (FK → USUARIO) |
| `AUTORIDAD` | Autoridades que pueden firmar documentos (FK → USUARIO) |
| `TRAMITE` | Catálogo de trámites disponibles (gestionado por funcionarios) |
| `SOLICITUD` | Solicitudes enviadas por ciudadanos, con estado y observación |
| `PAGO` | Registro de pagos por solicitud |
| `COMPROBANTE` | Comprobante generado al pagar |
| `DOCUMENTO` | Documentos generados o adjuntos a una solicitud |
| `PRODUCE` | Relación SOLICITUD ↔ DOCUMENTO |
| `DESCARGA` | Registro de descargas de documentos por ciudadanos |
| `FIRMA` | Registro de firmas de documentos por autoridades |

### Roles y cuentas de demo

| Rol | CI | Password | Acceso |
|-----|-----|----------|--------|
| Ciudadano | `7234501` | `abc123` | Portal ciudadano |
| Ciudadano | `8156302` | `abc123` | Portal ciudadano |
| Funcionario | `3102987` | `func456` | Panel funcionario |
| Jefa / Autoridad | `2845610` | `func456` | Panel funcionario + firma |
| Director | `1983047` | `dir789` | Panel funcionario (autoridad) |

---

## 🛠️ Guía de Instalación

### Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js | v18+ |
| npm | v9+ |
| MySQL Server | v8.0+ |

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/municipalidad-lapaz.git
cd municipalidad-lapaz
```

---

### 2. Crear la Base de Datos

Abre MySQL Workbench o tu terminal MySQL y ejecuta:

```sql
-- Opción A: ejecutar el archivo completo
SOURCE /ruta/a/db.sql;

-- Opción B: copiar y pegar el contenido de db.sql en tu cliente MySQL
```

Esto crea automáticamente la base de datos `GestionTramitesMunicipales` con todas las tablas y datos de prueba.

---

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=GestionTramitesMunicipales
JWT_SECRET=municipalidad_lapaz_secret_2025
JWT_EXPIRES_IN=8h
```

Iniciar el backend:

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

✅ Backend en: `http://localhost:5000`

---

### 4. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend en: `http://localhost:5173`

> El proxy de Vite redirige automáticamente `/api` → `http://localhost:5000/api`

---

### 5. Verificar instalación

1. Abre `http://localhost:5173`
2. Haz clic en **Iniciar Sesión**
3. Prueba con CI `3102987` / contraseña `func456` (funcionario)
4. Deberías ver el **Panel del Funcionario** con las solicitudes de la BD

---

## 📦 Estructura del Proyecto

```
municipalidad-lapaz/
│
├── db.sql                          ← Script completo de la base de datos
│
├── backend/
│   ├── .env                        ← Variables de entorno (crear manualmente)
│   ├── server.js                   ← Punto de entrada Express
│   ├── config/
│   │   └── db.js                   ← Conexión MySQL (pool)
│   ├── middleware/
│   │   ├── auth.js                 ← Verificación JWT y roles
│   │   └── upload.js               ← Multer para archivos
│   └── routes/
│       ├── auth.js                 ← Login y registro
│       ├── tramites.js             ← CRUD trámites + CRUD solicitudes
│       ├── documentos.js           ← Gestión de documentos adjuntos
│       └── usuarios.js             ← Gestión de usuarios
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                 ← Router principal
        ├── index.css               ← Estilos globales
        ├── context/
        │   └── AuthContext.jsx     ← Estado global de autenticación
        ├── components/
        │   ├── layout/
        │   │   └── Header.jsx      ← Navegación adaptativa por rol
        │   └── funcionario/
        │       ├── ModalEstado.jsx ← Modal aprobar/rechazar solicitud
        │       └── VisorDocumentos.jsx ← Visor de docs adjuntos
        └── pages/
            ├── Inicio.jsx          ← Landing page
            ├── Login.jsx           ← Autenticación
            ├── Registro.jsx        ← Registro ciudadano
            ├── Requisitos.jsx      ← Catálogo público de trámites
            ├── NuevoTramite.jsx    ← Enviar solicitud con archivos
            ├── MisTramites.jsx     ← Panel del ciudadano
            ├── DashboardFuncionario.jsx ← Panel central del funcionario
            ├── DetalleSolicitud.jsx ← Detalle + visor + aprobar/rechazar
            └── GestionTramites.jsx ← CRUD del catálogo de trámites
```

---

## 🔐 Flujo por Rol

### Ciudadano
1. Se registra con CI, nombre, apellido, email, contraseña
2. Inicia sesión → redirige a **Mis Trámites**
3. Crea **Nueva Solicitud**: elige tipo, adjunta documentos (PDF/JPG/PNG/DOC)
4. Hace seguimiento del estado: pendiente → en revisión → aprobada/rechazada

### Funcionario
1. Inicia sesión → redirige a **Panel del Funcionario**
2. Ve solicitudes en 4 pestañas: Pendientes / En Revisión / Aceptadas / Rechazadas
3. Puede **ver documentos adjuntos** con visor integrado (PDF e imágenes)
4. Puede **aprobar** o **rechazar** con observación obligatoria al rechazar
5. Accede al **detalle completo**: datos del trámite, pago, comprobante, documentos
6. Gestiona el **catálogo de trámites**: crear, editar, activar/desactivar, eliminar

---

## 🌐 API Endpoints principales

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/registro` | Crear cuenta ciudadano | Público |
| GET | `/api/tramites/catalogo` | Listar trámites activos | Público |
| POST | `/api/tramites/solicitudes` | Enviar solicitud + docs | Ciudadano |
| GET | `/api/tramites/solicitudes` | Todas las solicitudes | Funcionario |
| PATCH | `/api/tramites/solicitudes/:id/estado` | Aprobar/rechazar | Funcionario |
| GET | `/api/tramites/solicitudes/:id` | Detalle completo | Funcionario |
| GET | `/api/tramites` | CRUD catálogo | Funcionario |
| POST | `/api/tramites` | Crear trámite | Funcionario |
| PUT | `/api/tramites/:id` | Editar trámite | Funcionario |
| DELETE | `/api/tramites/:id` | Eliminar trámite | Funcionario |
| GET | `/api/documentos/solicitud/:id` | Docs de una solicitud | Autenticado |
"# ProyAnalisis" 

-- ==========================================================================
-- MIGRACIÓN: Especialización UMSA + Gestión Ciudadana
-- ==========================================================================
-- Fase 0: Correcciones críticas
-- Fase 1: Tablas y columnas UMSA
-- ==========================================================================

USE GestionTramitesMunicipales;

-- ==========================================================================
-- FASE 0: CORRECCIONES CRÍTICAS
-- ==========================================================================

-- 0.1: Hash de contraseñas de demostración
UPDATE USUARIO SET password = '$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu' WHERE ci IN ('7234501','8156302','9301245','6712834','5489023');
UPDATE USUARIO SET password = '$2a$10$KfP57h06moUJmMqZKUJDUeRtulx9W50voUTBN5zQcEtJuMJG2to8u' WHERE ci IN ('3102987','2845610');
UPDATE USUARIO SET password = '$2a$10$7z1yt9QZwqTgPpuT.qsxO./T.hbNneLgTjisCrjf/8Q5YqkYa3rES' WHERE ci = '1983047';

-- 0.2: Agregar ci_ciudadano a SOLICITUD
ALTER TABLE SOLICITUD
  ADD COLUMN ci_ciudadano VARCHAR(20) NULL AFTER idTramite,
  ADD CONSTRAINT FK_SOLICITUD_CIUDADANO FOREIGN KEY (ci_ciudadano) REFERENCES CIUDADANO(ci);

-- Asignar solicitudes existentes a ciudadanos de prueba (relación manual)
UPDATE SOLICITUD SET ci_ciudadano = '7234501' WHERE idSolicitud IN (1, 7);
UPDATE SOLICITUD SET ci_ciudadano = '8156302' WHERE idSolicitud IN (2, 6);
UPDATE SOLICITUD SET ci_ciudadano = '9301245' WHERE idSolicitud IN (3, 4);
UPDATE SOLICITUD SET ci_ciudadano = '6712834' WHERE idSolicitud IN (5, 8);

-- 0.3: Campos estudio/trabajo en CIUDADANO
ALTER TABLE CIUDADANO
  ADD COLUMN estudia              TINYINT(1)   DEFAULT 0  AFTER direccion,
  ADD COLUMN institucion_estudio  VARCHAR(200) DEFAULT NULL AFTER estudia,
  ADD COLUMN dir_estudio          VARCHAR(200) DEFAULT NULL AFTER institucion_estudio,
  ADD COLUMN trabaja              TINYINT(1)   DEFAULT 0  AFTER dir_estudio,
  ADD COLUMN empresa_trabajo      VARCHAR(200) DEFAULT NULL AFTER trabaja,
  ADD COLUMN dir_trabajo          VARCHAR(200) DEFAULT NULL AFTER empresa_trabajo;

-- 0.4: Tabla HISTORIAL_ESTADO para trazabilidad
CREATE TABLE HISTORIAL_ESTADO (
    idHistorial     INT             NOT NULL AUTO_INCREMENT,
    idSolicitud     INT             NOT NULL,
    estadoAnterior  VARCHAR(50)     DEFAULT NULL,
    estadoNuevo     VARCHAR(50)     NOT NULL,
    ciActor         VARCHAR(20)     DEFAULT NULL,
    fecha           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion     VARCHAR(500)    DEFAULT NULL,
    CONSTRAINT PK_HISTORIAL PRIMARY KEY (idHistorial),
    CONSTRAINT FK_HISTORIAL_SOLICITUD FOREIGN KEY (idSolicitud) REFERENCES SOLICITUD(idSolicitud)
);

-- ==========================================================================
-- FASE 1: ESPECIALIZACIÓN UMSA
-- ==========================================================================

-- 1.1: Facultades UMSA
CREATE TABLE FACULTAD_UMSA (
    idFacultad  INT             NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(200)    NOT NULL,
    sigla       VARCHAR(20)     NOT NULL,
    CONSTRAINT PK_FACULTAD PRIMARY KEY (idFacultad),
    CONSTRAINT UQ_FACULTAD_SIGLA UNIQUE (sigla)
);

-- 1.2: Carreras UMSA
CREATE TABLE CARRERA_UMSA (
    idCarrera   INT             NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(200)    NOT NULL,
    codigo      VARCHAR(20)     NOT NULL,
    idFacultad  INT             NOT NULL,
    CONSTRAINT PK_CARRERA PRIMARY KEY (idCarrera),
    CONSTRAINT UQ_CARRERA_CODIGO UNIQUE (codigo),
    CONSTRAINT FK_CARRERA_FACULTAD FOREIGN KEY (idFacultad) REFERENCES FACULTAD_UMSA(idFacultad)
);

-- 1.3: Convenios UMSA-Municipio
CREATE TABLE CONVENIO (
    idConvenio      INT             NOT NULL AUTO_INCREMENT,
    titulo          VARCHAR(300)    NOT NULL,
    tipo            ENUM('marco','especifico') NOT NULL DEFAULT 'especifico',
    descripcion     TEXT,
    fechaInicio     DATE            NOT NULL,
    fechaFin        DATE            DEFAULT NULL,
    estado          VARCHAR(50)     NOT NULL DEFAULT 'activo',
    archivoUrl      VARCHAR(300)    DEFAULT NULL,
    fechaCreacion   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ciCreador       VARCHAR(20)     NOT NULL,
    CONSTRAINT PK_CONVENIO PRIMARY KEY (idConvenio),
    CONSTRAINT FK_CONVENIO_USUARIO FOREIGN KEY (ciCreador) REFERENCES USUARIO(ci)
);

-- 1.4: Partes firmantes del convenio
CREATE TABLE PARTE_CONVENIO (
    idParte         INT             NOT NULL AUTO_INCREMENT,
    idConvenio      INT             NOT NULL,
    entidad         ENUM('UMSA','Municipio') NOT NULL,
    representante   VARCHAR(200)    NOT NULL,
    cargo           VARCHAR(200)    NOT NULL,
    CONSTRAINT PK_PARTE PRIMARY KEY (idParte),
    CONSTRAINT FK_PARTE_CONVENIO FOREIGN KEY (idConvenio) REFERENCES CONVENIO(idConvenio)
);

-- 1.5: Prácticas pre-profesionales
CREATE TABLE PRACTICA (
    idPractica      INT             NOT NULL AUTO_INCREMENT,
    idConvenio      INT             DEFAULT NULL,
    ciEstudiante    VARCHAR(20)     NOT NULL,
    carrera         VARCHAR(200)    NOT NULL,
    duracion        VARCHAR(50)     NOT NULL,
    fechaInicio     DATE            NOT NULL,
    fechaFin        DATE            DEFAULT NULL,
    estado          VARCHAR(50)     NOT NULL DEFAULT 'pendiente',
    observacion     VARCHAR(500)    DEFAULT NULL,
    CONSTRAINT PK_PRACTICA PRIMARY KEY (idPractica),
    CONSTRAINT FK_PRACTICA_CONVENIO FOREIGN KEY (idConvenio) REFERENCES CONVENIO(idConvenio),
    CONSTRAINT FK_PRACTICA_USUARIO FOREIGN KEY (ciEstudiante) REFERENCES USUARIO(ci)
);

-- 1.6: Tipo de trámite en TRAMITE
ALTER TABLE TRAMITE
  ADD COLUMN tipo_tramite ENUM('municipal','umsa','convenio') NOT NULL DEFAULT 'municipal' AFTER requisitos;

-- 1.7: Convenio opcional en solicitud
ALTER TABLE SOLICITUD
  ADD COLUMN idConvenio INT DEFAULT NULL AFTER ci_ciudadano,
  ADD CONSTRAINT FK_SOLICITUD_CONVENIO FOREIGN KEY (idConvenio) REFERENCES CONVENIO(idConvenio);

-- 1.8: Carrera UMSA en CIUDADANO
ALTER TABLE CIUDADANO
  ADD COLUMN idCarrera INT DEFAULT NULL AFTER dir_trabajo,
  ADD CONSTRAINT FK_CIUDADANO_CARRERA FOREIGN KEY (idCarrera) REFERENCES CARRERA_UMSA(idCarrera);

-- 1.9: Rol Gestor UMSA
CREATE TABLE GESTOR_UMSA (
    ci          VARCHAR(20) NOT NULL,
    cargo       VARCHAR(100) NOT NULL,
    idFacultad  INT NOT NULL,
    CONSTRAINT PK_GESTOR_UMSA PRIMARY KEY (ci),
    CONSTRAINT FK_GESTOR_UMSA_USUARIO FOREIGN KEY (ci) REFERENCES USUARIO(ci),
    CONSTRAINT FK_GESTOR_FACULTAD FOREIGN KEY (idFacultad) REFERENCES FACULTAD_UMSA(idFacultad)
);

-- ==========================================================================
-- FASE 2: FLUJO INTERINSTITUCIONAL (Punto Medio)
-- ==========================================================================

-- 2.1: Campos institucionales en SOLICITUD
ALTER TABLE SOLICITUD
  ADD COLUMN institucion_origen ENUM('ciudadano','umsa','municipio') NOT NULL DEFAULT 'ciudadano' AFTER idConvenio,
  ADD COLUMN institucion_actual ENUM('ciudadano','umsa','municipio','autoridad','finalizado') NOT NULL DEFAULT 'ciudadano' AFTER institucion_origen,
  ADD COLUMN estado_umsa ENUM('pendiente','validado','rechazado') DEFAULT 'pendiente' AFTER institucion_actual,
  ADD COLUMN estado_municipio ENUM('pendiente','en_revision','aprobado','rechazado') DEFAULT 'pendiente' AFTER estado_umsa;

-- 2.2: Tabla FLUJO_TRAMITE - define la ruta de cada trámite
CREATE TABLE FLUJO_TRAMITE (
    idFlujo         INT             NOT NULL AUTO_INCREMENT,
    idTramite       INT             NOT NULL,
    orden           INT             NOT NULL,
    institucion     ENUM('ciudadano','umsa','municipio','autoridad') NOT NULL,
    accion          VARCHAR(100)    NOT NULL,
    descripcion     VARCHAR(300),
    CONSTRAINT PK_FLUJO PRIMARY KEY (idFlujo),
    CONSTRAINT FK_FLUJO_TRAMITE FOREIGN KEY (idTramite) REFERENCES TRAMITE(idTramite)
);

-- 2.3: Agregar institucion al historial
ALTER TABLE HISTORIAL_ESTADO
  ADD COLUMN institucion ENUM('ciudadano','umsa','municipio','autoridad') DEFAULT NULL AFTER estadoNuevo;

-- ==========================================================================
-- DATOS DE PRUEBA: FACULTADES Y CARRERAS UMSA
-- ==========================================================================

INSERT INTO FACULTAD_UMSA (nombre, sigla) VALUES
('Facultad de Derecho y Ciencias Políticas', 'FDCP'),
('Facultad de Medicina, Enfermería, Nutrición y Tecnología Médica', 'FMENyTM'),
('Facultad de Ingeniería', 'FI'),
('Facultad de Ciencias Económicas y Financieras', 'FCEF'),
('Facultad de Humanidades y Ciencias de la Educación', 'FHCE'),
('Facultad de Ciencias Puras y Naturales', 'FCPN'),
('Facultad de Arquitectura, Artes, Diseño y Urbanismo', 'FAADU'),
('Facultad de Ciencias Sociales', 'FCS'),
('Facultad de Agronomía', 'FAgro'),
('Facultad de Odontología', 'FO');

INSERT INTO CARRERA_UMSA (nombre, codigo, idFacultad) VALUES
-- Derecho
('Derecho', 'DER-001', 1),
('Ciencia Política y Gestión Pública', 'CPGP-001', 1),
-- Medicina
('Medicina', 'MED-001', 2),
('Enfermería', 'ENF-001', 2),
('Nutrición y Dietética', 'NUT-001', 2),
-- Ingeniería
('Ingeniería Civil', 'ICIV-001', 3),
('Ingeniería Industrial', 'IIND-001', 3),
('Ingeniería de Sistemas', 'ISIS-001', 3),
('Ingeniería Electrónica', 'IELC-001', 3),
('Ingeniería Petrolera', 'IPET-001', 3),
-- Económicas
('Economía', 'ECO-001', 4),
('Administración de Empresas', 'ADM-001', 4),
('Contaduría Pública', 'CONT-001', 4),
('Ingeniería Financiera', 'IFIN-001', 4),
-- Humanidades
('Turismo', 'TUR-001', 5),
('Bibliotecología y Ciencias de la Información', 'BIBL-001', 5),
('Psicología', 'PSIC-001', 5),
('Ciencias de la Educación', 'CEDU-001', 5),
-- Ciencias Puras
('Informática', 'INFO-001', 6),
('Matemática', 'MATE-001', 6),
('Estadística', 'EST-001', 6),
('Física', 'FIS-001', 6),
-- Arquitectura
('Arquitectura', 'ARQ-001', 7),
('Artes Plásticas', 'ART-001', 7),
('Diseño Gráfico', 'DGRAF-001', 7),
-- Sociales
('Trabajo Social', 'TSOC-001', 8),
('Sociología', 'SOC-001', 8),
('Antropología y Arqueología', 'ANTRO-001', 8),
-- Agronomía
('Ingeniería Agronómica', 'IAGRO-001', 9),
('Ingeniería en Producción y Comercialización Agropecuaria', 'IPCA-001', 9),
-- Odontología
('Odontología', 'ODON-001', 10);

-- ==========================================================================
-- TRÁMITES UMSA (ejemplos)
-- ==========================================================================

INSERT INTO TRAMITE (nombre, descripcion, requisitos, tipo_tramite, costo, estado, fechaCreacion, ci_funcionario) VALUES
('Certificado de Residencia Estudiantil',
 'Certificado oficial de domicilio para estudiantes UMSA que requieren acreditar residencia en La Paz para trámites universitarios.',
 'CI vigente, Factura de agua/luz del domicilio, Certificado de inscripción UMSA',
 'umsa', 45.00, 'activo', CURDATE(), '3102987'),

('Legalización de Documentos Académicos',
 'Legalización municipal de títulos, diplomas y certificados académicos emitidos por la UMSA.',
 'Documento original a legalizar, CI vigente, Certificado de conclusión UMSA',
 'umsa', 120.00, 'activo', CURDATE(), '2845610'),

('Convenio Marco UMSA-Municipio',
 'Registro de convenio marco de cooperación interinstitucional entre la UMSA y la Municipalidad de La Paz.',
 'Resolución del H. Consejo Universitario, Resolución Municipal, Minuta de convenio',
 'convenio', 0.00, 'activo', CURDATE(), '2845610'),

('Solicitud de Prácticas Pre-Profesionales',
 'Postulación para realizar prácticas pre-profesionales en dependencias municipales.',
 'CI vigente, Certificado de inscripción UMSA, Carta de presentación de facultad, Hoja de vida',
 'umsa', 0.00, 'activo', CURDATE(), '3102987'),

('Carnet Municipal Universitario',
 'Emisión del carnet que acredita al estudiante UMSA para acceder a beneficios municipales.',
 'CI vigente, Certificado de inscripción UMSA, Fotografía 4x4 fondo azul',
 'umsa', 35.00, 'activo', CURDATE(), '3102987'),

('Convenio Específico de Prácticas',
 'Convenio específico para la realización de prácticas pre-profesionales entre una facultad UMSA y una dependencia municipal.',
 'Convenio marco vigente, Plan de prácticas, Designación de tutores',
 'convenio', 0.00, 'activo', CURDATE(), '2845610');

-- ==========================================================================
-- FLUJOS DE TRÁMITES INTERINSTITUCIONALES
-- ==========================================================================

-- Flujo: Certificado de Residencia Estudiantil (UMSA → Municipio → Autoridad)
INSERT INTO FLUJO_TRAMITE (idTramite, orden, institucion, accion, descripcion) VALUES
(6, 1, 'ciudadano', 'solicitar', 'Ciudadano envía solicitud con documentos'),
(6, 2, 'umsa', 'validar', 'Gestor UMSA valida inscripción universitaria'),
(6, 3, 'municipio', 'revisar', 'Funcionario municipal revisa documentos'),
(6, 4, 'autoridad', 'aprobar', 'Autoridad aprueba el certificado');

-- Flujo: Legalización de Documentos Académicos (UMSA → Municipio)
INSERT INTO FLUJO_TRAMITE (idTramite, orden, institucion, accion, descripcion) VALUES
(7, 1, 'ciudadano', 'solicitar', 'Ciudadano envía documento académico'),
(7, 2, 'umsa', 'validar', 'UMSA certifica autenticidad del documento'),
(7, 3, 'municipio', 'legalizar', 'Municipio legaliza con sello oficial'),
(7, 4, 'autoridad', 'aprobar', 'Autoridad firma la legalización');

-- Flujo: Solicitud de Prácticas Pre-Profesionales (UMSA → Municipio)
INSERT INTO FLUJO_TRAMITE (idTramite, orden, institucion, accion, descripcion) VALUES
(9, 1, 'ciudadano', 'solicitar', 'Estudiante postula a prácticas'),
(9, 2, 'umsa', 'validar', 'UMSA valida requisitos académicos'),
(9, 3, 'municipio', 'asignar', 'Municipio asigna dependencia'),
(9, 4, 'autoridad', 'aprobar', 'Autoridad aprueba la asignación');

-- Flujo: Carnet Municipal Universitario (UMSA → Municipio)
INSERT INTO FLUJO_TRAMITE (idTramite, orden, institucion, accion, descripcion) VALUES
(10, 1, 'ciudadano', 'solicitar', 'Estudiante solicita carnet'),
(10, 2, 'umsa', 'validar', 'UMSA verifica matrícula activa'),
(10, 3, 'municipio', 'emitir', 'Municipio emite carnet'),
(10, 4, 'autoridad', 'aprobar', 'Autoridad firma el carnet');

-- ==========================================================================
-- VERIFICACIÓN
-- ==========================================================================

SELECT 'MIGRACIÓN COMPLETADA' AS mensaje;
SELECT CONCAT('Facultades: ', COUNT(*)) AS info FROM FACULTAD_UMSA
UNION ALL
SELECT CONCAT('Carreras: ', COUNT(*)) FROM CARRERA_UMSA
UNION ALL
SELECT CONCAT('Trámites UMSA: ', COUNT(*)) FROM TRAMITE WHERE tipo_tramite = 'umsa'
UNION ALL
SELECT CONCAT('Convenios: ', COUNT(*)) FROM TRAMITE WHERE tipo_tramite = 'convenio'
UNION ALL
SELECT CONCAT('Flujos definidos: ', COUNT(*)) FROM FLUJO_TRAMITE;

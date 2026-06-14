-- =================== CREAR BASE DE DATOS =======================
CREATE DATABASE GestionTramitesMunicipales;
USE GestionTramitesMunicipales;

-- =================== TABLAS =======================

CREATE TABLE USUARIO (
    ci          VARCHAR(20)     NOT NULL,
    email       VARCHAR(100)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    estado      TINYINT(1)      NOT NULL DEFAULT 1,
    CONSTRAINT PK_USUARIO PRIMARY KEY (ci),
    CONSTRAINT UQ_USUARIO_email UNIQUE (email)
);

CREATE TABLE CIUDADANO (
    ci          VARCHAR(20)     NOT NULL,
    nombre      VARCHAR(100)    NOT NULL,
    apellido    VARCHAR(100)    NOT NULL,
    telefono    VARCHAR(20),
    direccion   VARCHAR(200),
    CONSTRAINT PK_CIUDADANO PRIMARY KEY (ci),
    CONSTRAINT FK_CIUDADANO_USUARIO FOREIGN KEY (ci) REFERENCES USUARIO(ci)
);

CREATE TABLE FUNCIONARIO (
    ci              VARCHAR(20)     NOT NULL,
    cargo           VARCHAR(100)    NOT NULL,
    departamento    VARCHAR(100)    NOT NULL,
    CONSTRAINT PK_FUNCIONARIO PRIMARY KEY (ci),
    CONSTRAINT FK_FUNCIONARIO_USUARIO FOREIGN KEY (ci) REFERENCES USUARIO(ci)
);

CREATE TABLE AUTORIDAD (
    ci      VARCHAR(20)     NOT NULL,
    cargo   VARCHAR(100)    NOT NULL,
    CONSTRAINT PK_AUTORIDAD PRIMARY KEY (ci),
    CONSTRAINT FK_AUTORIDAD_USUARIO FOREIGN KEY (ci) REFERENCES USUARIO(ci)
);

CREATE TABLE TRAMITE (
    idTramite       INT             NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     VARCHAR(500),
    requisitos      VARCHAR(500),
    costo           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado          VARCHAR(50)     NOT NULL DEFAULT 'activo',
    fechaCreacion   DATE            NOT NULL DEFAULT (CURDATE()),
    ci_funcionario  VARCHAR(20)     NOT NULL,
    CONSTRAINT PK_TRAMITE PRIMARY KEY (idTramite),
    CONSTRAINT FK_TRAMITE_FUNCIONARIO FOREIGN KEY (ci_funcionario) REFERENCES FUNCIONARIO(ci)
);

CREATE TABLE SOLICITUD (
    idSolicitud     INT             NOT NULL AUTO_INCREMENT,
    fechaSolicitud  DATE            NOT NULL DEFAULT (CURDATE()),
    estado          VARCHAR(50)     NOT NULL DEFAULT 'pendiente',
    observacion     VARCHAR(500),
    idTramite       INT             NOT NULL,
    CONSTRAINT PK_SOLICITUD PRIMARY KEY (idSolicitud),
    CONSTRAINT FK_SOLICITUD_TRAMITE FOREIGN KEY (idTramite) REFERENCES TRAMITE(idTramite)
);

CREATE TABLE PAGO (
    idPago      INT             NOT NULL AUTO_INCREMENT,
    monto       DECIMAL(10,2)   NOT NULL,
    fecha       DATE            NOT NULL DEFAULT (CURDATE()),
    metodo      VARCHAR(50)     NOT NULL,
    estado      VARCHAR(50)     NOT NULL DEFAULT 'pendiente',
    idSolicitud INT             NOT NULL,
    CONSTRAINT PK_PAGO PRIMARY KEY (idPago),
    CONSTRAINT FK_PAGO_SOLICITUD FOREIGN KEY (idSolicitud) REFERENCES SOLICITUD(idSolicitud)
);

CREATE TABLE COMPROBANTE (
    idComprobante   INT             NOT NULL AUTO_INCREMENT,
    numero          VARCHAR(50)     NOT NULL,
    fecha           DATE            NOT NULL DEFAULT (CURDATE()),
    url             VARCHAR(300),
    idPago          INT             NOT NULL,
    CONSTRAINT PK_COMPROBANTE PRIMARY KEY (idComprobante),
    CONSTRAINT FK_COMPROBANTE_PAGO FOREIGN KEY (idPago) REFERENCES PAGO(idPago),
    CONSTRAINT UQ_COMPROBANTE_PAGO UNIQUE (idPago)
);

CREATE TABLE DOCUMENTO (
    idDoc           INT             NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(150)    NOT NULL,
    tipo            VARCHAR(50)     NOT NULL,
    fechaEmision    DATE            NOT NULL DEFAULT (CURDATE()),
    estado          VARCHAR(50)     NOT NULL DEFAULT 'generado',
    CONSTRAINT PK_DOCUMENTO PRIMARY KEY (idDoc)
);

CREATE TABLE PRODUCE (
    idSolicitud INT NOT NULL,
    idDoc       INT NOT NULL,
    CONSTRAINT PK_PRODUCE PRIMARY KEY (idSolicitud, idDoc),
    CONSTRAINT FK_PRODUCE_SOLICITUD FOREIGN KEY (idSolicitud) REFERENCES SOLICITUD(idSolicitud),
    CONSTRAINT FK_PRODUCE_DOCUMENTO FOREIGN KEY (idDoc) REFERENCES DOCUMENTO(idDoc)
);

CREATE TABLE DESCARGA (
    ci      VARCHAR(20) NOT NULL,
    idDoc   INT         NOT NULL,
    CONSTRAINT PK_DESCARGA PRIMARY KEY (ci, idDoc),
    CONSTRAINT FK_DESCARGA_CIUDADANO FOREIGN KEY (ci) REFERENCES CIUDADANO(ci),
    CONSTRAINT FK_DESCARGA_DOCUMENTO FOREIGN KEY (idDoc) REFERENCES DOCUMENTO(idDoc)
);

CREATE TABLE FIRMA (
    ci      VARCHAR(20) NOT NULL,
    idDoc   INT         NOT NULL,
    CONSTRAINT PK_FIRMA PRIMARY KEY (ci, idDoc),
    CONSTRAINT FK_FIRMA_AUTORIDAD FOREIGN KEY (ci) REFERENCES AUTORIDAD(ci),
    CONSTRAINT FK_FIRMA_DOCUMENTO FOREIGN KEY (idDoc) REFERENCES DOCUMENTO(idDoc)
);

-- =================== INSERTS ========================

INSERT INTO USUARIO (ci, email, password, estado) VALUES
('7234501', 'ana.mamani@gmail.com',       'abc123',   1),  
('8156302', 'pedro.quispe@gmail.com',     'abc123',   1),  
('9301245', 'rosa.condori@gmail.com',     'abc123',   1), 
('6712834', 'carlos.flores@gmail.com',    'abc123',   1), 
('5489023', 'lucia.choque@gmail.com',     'abc123',   0),  
('3102987', 'juan.ticona@muni.gob.bo',   'func456',  1),  
('2845610', 'silvia.apaza@muni.gob.bo',  'func456',  1),  
('1983047', 'director@muni.gob.bo',      'dir789',   1);  

INSERT INTO CIUDADANO (ci, nombre, apellido, telefono, direccion) VALUES
('7234501', 'Ana',    'Mamani',   '71234501', 'Av. Buenos Aires 345, El Alto'),
('8156302', 'Pedro',  'Quispe',   '78156302', 'Calle Comercio 78, La Paz'),
('9301245', 'Rosa',   'Condori',  '79301245', 'Villa Fatima, Calle 5 Nro 23, La Paz'),
('6712834', 'Carlos', 'Flores',   '76712834', 'Av. Montes 1102, La Paz'),
('5489023', 'Lucia',  'Choque',   NULL,       'Zona Sur, Calle 21 Nro 8, La Paz');

INSERT INTO FUNCIONARIO (ci, cargo, departamento) VALUES
('3102987', 'Tecnico de Tramites',   'Ventanilla Unica'),
('2845610', 'Jefa de Ventanilla',    'Ventanilla Unica');

INSERT INTO AUTORIDAD (ci, cargo) VALUES
('2845610', 'Jefa de Departamento'),
('1983047', 'Director Municipal');

INSERT INTO TRAMITE (nombre, descripcion, requisitos, costo, estado, fechaCreacion, ci_funcionario) VALUES
('Certificado de Residencia',
    'Emision de certificado oficial de domicilio',
    'CI vigente, factura de agua o luz del domicilio',
    60.00, 'activo', '2025-01-08', '3102987'),
 
('Registro de Nacimiento',
    'Inscripcion de nacimiento en el registro civil',
    'Certificado medico de nacimiento, CI de ambos padres',
    0.00,  'activo', '2025-01-08', '3102987'),
 
('Licencia de Funcionamiento',
    'Autorizacion municipal para apertura de negocio',
    'CI, croquis del local, contrato de alquiler o titulos, memoria descriptiva',
    350.00,'activo', '2025-01-15', '2845610'),
 
('Certificado de Solteria',
    'Constancia de estado civil soltero para uso legal',
    'CI vigente, partida de nacimiento',
    90.00, 'activo', '2025-02-03', '2845610'),
 
('Apostilla de Documentos',
    'Legalizacion de documentos bolivianos para uso en el exterior',
    'Documento original a apostillar, CI vigente, carta de destino',
    200.00,'activo', '2025-02-10', '3102987');

INSERT INTO SOLICITUD (fechaSolicitud, estado, observacion, idTramite) VALUES
('2025-03-03', 'aprobada',  'Documentos completos y verificados', 1),
('2025-03-05', 'aprobada',  'Datos del recien nacido verificados con hospital', 2),
('2025-03-10', 'rechazada', 'Falta memoria descriptiva del local comercial', 3),
('2025-03-20', 'pendiente', 'Documentacion recibida, en proceso de revision', 3),
('2025-03-22', 'aprobada',  'Verificado en registro civil, sin observaciones', 4),
('2025-04-01', 'pendiente', NULL, 5),
('2025-04-07', 'aprobada',  'Factura de luz presentada y verificada', 1),
('2025-02-14', 'rechazada', 'Usuario dado de baja del sistema durante el proceso', 4);

INSERT INTO PAGO (monto, fecha, metodo, estado, idSolicitud) VALUES
(60.00,  '2025-03-03', 'QR',            'pagado',   1),
(0.00,   '2025-03-05', 'exento',        'pagado',   2),
(350.00, '2025-03-10', 'transferencia', 'devuelto', 3),
(350.00, '2025-03-21', 'QR',            'pendiente',4),
(90.00,  '2025-03-22', 'efectivo',      'pagado',   5),
(60.00,  '2025-04-07', 'QR',            'pagado',   7),
(90.00,  '2025-02-14', 'efectivo',      'devuelto', 8);

INSERT INTO COMPROBANTE (numero, fecha, url, idPago) VALUES
('COMP-2025-0031', '2025-03-03', 'https://muni.lapaz.bo/comp/2025-0031.pdf', 1),
('COMP-2025-0032', '2025-03-05', 'https://muni.lapaz.bo/comp/2025-0032.pdf', 2),
('COMP-2025-0047', '2025-03-22', 'https://muni.lapaz.bo/comp/2025-0047.pdf', 5),
('COMP-2025-0061', '2025-04-07', 'https://muni.lapaz.bo/comp/2025-0061.pdf', 7);

INSERT INTO DOCUMENTO (nombre, tipo, fechaEmision, estado) VALUES
('Cert. Residencia - Ana Mamani 03/2025',       'certificado',  '2025-03-04', 'firmado'),
('Partida Nacimiento - hijo de Pedro Quispe',   'partida',      '2025-03-06', 'firmado'),
('Cert. Solteria - Carlos Flores 03/2025',      'certificado',  '2025-03-23', 'firmado'),
('Cert. Residencia - Pedro Quispe 04/2025',     'certificado',  '2025-04-08', 'emitido');

INSERT INTO PRODUCE (idSolicitud, idDoc) VALUES
(1, 1),  
(2, 2),  
(5, 3),  
(7, 4);

INSERT INTO FIRMA (ci, idDoc) VALUES
('2845610', 1), 
('1983047', 2), 
('2845610', 3);

INSERT INTO DESCARGA (ci, idDoc) VALUES
('7234501', 1),  
('8156302', 2),  
('8156302', 4),  
('6712834', 3),  
('9301245', 1);  

-- =================== CONSULTA DE VERIFICACIÓN ========================
SELECT 'USUARIO'       AS tabla, COUNT(*) AS cantidad FROM USUARIO
UNION ALL
SELECT 'CIUDADANO',                  COUNT(*)             FROM CIUDADANO
UNION ALL
SELECT 'FUNCIONARIO',                COUNT(*)             FROM FUNCIONARIO
UNION ALL
SELECT 'AUTORIDAD',                  COUNT(*)             FROM AUTORIDAD
UNION ALL
SELECT 'TRAMITE',                    COUNT(*)             FROM TRAMITE
UNION ALL
SELECT 'SOLICITUD',                  COUNT(*)             FROM SOLICITUD
UNION ALL
SELECT 'PAGO',                       COUNT(*)             FROM PAGO
UNION ALL
SELECT 'COMPROBANTE',                COUNT(*)             FROM COMPROBANTE
UNION ALL
SELECT 'DOCUMENTO',                  COUNT(*)             FROM DOCUMENTO
UNION ALL
SELECT 'PRODUCE',                    COUNT(*)             FROM PRODUCE
UNION ALL
SELECT 'DESCARGA',                   COUNT(*)             FROM DESCARGA
UNION ALL
SELECT 'FIRMA',                      COUNT(*)             FROM FIRMA;

-- =================== MOSTRAR TODAS LAS TABLAS ========================
SELECT '=== BASE DE DATOS CREADA EXITOSAMENTE ===' AS mensaje;
SELECT 'Base de datos: GestionTramitesMunicipales' AS informacion;
SHOW TABLES;
USE GestionTramitesMunicipales;

-- =====================================================
-- DATOS EXTRA DE CONVENIOS UMSA - MUNICIPIO
-- =====================================================

INSERT INTO CONVENIO 
(titulo, tipo, descripcion, fechaInicio, fechaFin, estado, ciCreador)
VALUES
(
  'Convenio Marco de Cooperación Interinstitucional UMSA - GAMLP',
  'marco',
  'Convenio orientado a fortalecer la cooperación académica, técnica y social entre la Universidad Mayor de San Andrés y el Gobierno Autónomo Municipal de La Paz.',
  '2026-02-01',
  '2028-02-01',
  'activo',
  '3102987'
);

SET @conv1 = LAST_INSERT_ID();

INSERT INTO PARTE_CONVENIO 
(idConvenio, entidad, representante, cargo)
VALUES
(@conv1, 'UMSA', 'Lic. Marcelo Vargas Quispe', 'Director de Relaciones Interinstitucionales'),
(@conv1, 'Municipio', 'Ing. Carla Mendoza Rojas', 'Secretaria Municipal de Desarrollo Humano');


INSERT INTO CONVENIO 
(titulo, tipo, descripcion, fechaInicio, fechaFin, estado, ciCreador)
VALUES
(
  'Convenio Específico para Prácticas Preprofesionales de Estudiantes UMSA',
  'especifico',
  'Convenio destinado a permitir que estudiantes de la UMSA realicen prácticas preprofesionales en unidades administrativas y técnicas del municipio.',
  '2026-03-10',
  '2027-03-10',
  'activo',
  '3102987'
);

SET @conv2 = LAST_INSERT_ID();

INSERT INTO PARTE_CONVENIO 
(idConvenio, entidad, representante, cargo)
VALUES
(@conv2, 'UMSA', 'M.Sc. Patricia Choque Apaza', 'Coordinadora Académica UMSA'),
(@conv2, 'Municipio', 'Lic. Fernando Callisaya Mamani', 'Responsable de Recursos Humanos GAMLP');


INSERT INTO CONVENIO 
(titulo, tipo, descripcion, fechaInicio, fechaFin, estado, ciCreador)
VALUES
(
  'Convenio de Apoyo Técnico para Digitalización de Trámites Municipales',
  'especifico',
  'Convenio para apoyar la digitalización, revisión y mejora de procesos administrativos mediante participación de estudiantes universitarios.',
  '2026-04-05',
  '2027-04-05',
  'activo',
  '3102987'
);

SET @conv3 = LAST_INSERT_ID();

INSERT INTO PARTE_CONVENIO 
(idConvenio, entidad, representante, cargo)
VALUES
(@conv3, 'UMSA', 'Ing. Roberto Aguilar Flores', 'Docente Coordinador de Sistemas'),
(@conv3, 'Municipio', 'Ing. Daniela Ríos Fernández', 'Jefa de Gobierno Electrónico');

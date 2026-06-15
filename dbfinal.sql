-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: gestiontramitesmunicipales
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4a0b7cc1-5f57-11f1-ba33-00e04c362d9a:1-192';

--
-- Table structure for table `autoridad`
--

DROP TABLE IF EXISTS `autoridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autoridad` (
  `ci` varchar(20) NOT NULL,
  `cargo` varchar(100) NOT NULL,
  PRIMARY KEY (`ci`),
  CONSTRAINT `FK_AUTORIDAD_USUARIO` FOREIGN KEY (`ci`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autoridad`
--

LOCK TABLES `autoridad` WRITE;
/*!40000 ALTER TABLE `autoridad` DISABLE KEYS */;
INSERT INTO `autoridad` VALUES ('1983047','Director Municipal'),('2845610','Jefa de Departamento');
/*!40000 ALTER TABLE `autoridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrera_umsa`
--

DROP TABLE IF EXISTS `carrera_umsa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrera_umsa` (
  `idCarrera` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `idFacultad` int NOT NULL,
  PRIMARY KEY (`idCarrera`),
  UNIQUE KEY `UQ_CARRERA_CODIGO` (`codigo`),
  KEY `FK_CARRERA_FACULTAD` (`idFacultad`),
  CONSTRAINT `FK_CARRERA_FACULTAD` FOREIGN KEY (`idFacultad`) REFERENCES `facultad_umsa` (`idFacultad`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrera_umsa`
--

LOCK TABLES `carrera_umsa` WRITE;
/*!40000 ALTER TABLE `carrera_umsa` DISABLE KEYS */;
INSERT INTO `carrera_umsa` VALUES (1,'Derecho','DER-001',1),(2,'Ciencia Politica y Gestion Publica','CPGP-001',1),(3,'Medicina','MED-001',2),(4,'Enfermeria','ENF-001',2),(5,'Nutricion y Dietetica','NUT-001',2),(6,'Ingenieria Civil','ICIV-001',3),(7,'Ingenieria Industrial','IIND-001',3),(8,'Ingenieria de Sistemas','ISIS-001',3),(9,'Ingenieria Electronica','IELC-001',3),(10,'Ingenieria Petrolera','IPET-001',3),(11,'Economia','ECO-001',4),(12,'Administracion de Empresas','ADM-001',4),(13,'Contaduria Publica','CONT-001',4),(14,'Ingenieria Financiera','IFIN-001',4),(15,'Turismo','TUR-001',5),(16,'Bibliotecologia y Ciencias de la Informacion','BIBL-001',5),(17,'Psicologia','PSIC-001',5),(18,'Ciencias de la Educacion','CEDU-001',5),(19,'Informatica','INFO-001',6),(20,'Matematica','MATE-001',6),(21,'Estadistica','EST-001',6),(22,'Fisica','FIS-001',6),(23,'Arquitectura','ARQ-001',7),(24,'Artes Plasticas','ART-001',7),(25,'Diseno Grafico','DGRAF-001',7),(26,'Trabajo Social','TSOC-001',8),(27,'Sociologia','SOC-001',8),(28,'Antropologia y Arqueologia','ANTRO-001',8),(29,'Ingenieria Agronomica','IAGRO-001',9),(30,'Ingenieria en Produccion y Comercializacion Agropecuaria','IPCA-001',9),(31,'Odontologia','ODON-001',10);
/*!40000 ALTER TABLE `carrera_umsa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudadano`
--

DROP TABLE IF EXISTS `ciudadano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudadano` (
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `estudia` tinyint(1) DEFAULT '0',
  `institucion_estudio` varchar(200) DEFAULT NULL,
  `dir_estudio` varchar(200) DEFAULT NULL,
  `trabaja` tinyint(1) DEFAULT '0',
  `empresa_trabajo` varchar(200) DEFAULT NULL,
  `dir_trabajo` varchar(200) DEFAULT NULL,
  `idCarrera` int DEFAULT NULL,
  PRIMARY KEY (`ci`),
  CONSTRAINT `FK_CIUDADANO_USUARIO` FOREIGN KEY (`ci`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudadano`
--

LOCK TABLES `ciudadano` WRITE;
/*!40000 ALTER TABLE `ciudadano` DISABLE KEYS */;
INSERT INTO `ciudadano` VALUES ('0123456','Elena','Torres','70123456','Calle Ingavi 789, La Paz',0,NULL,NULL,1,'Ministerio de Educaci??n','Plaza Murillo',NULL),('1234567','Diego','Morales','71234567','Av. Villaz??n 1234, La Paz',1,'UMSA','Av. Villaz??n 1966',0,NULL,NULL,19),('1983047','Director','Municipal','71983047','Plaza Murillo, La Paz',0,NULL,NULL,0,NULL,NULL,NULL),('2345678','Sof??a','Castro','72345678','Calle Jun??n 567, La Paz',1,'UMSA','Av. Villaz??n 1966',1,'ONG Desarrollo','Zona Sur',26),('2845610','Silvia','Apaza','72845610','Calle Comercio 123, La Paz',0,NULL,NULL,0,NULL,NULL,NULL),('3102987','Juan','Ticona','73102987','Av. Mariscal Santa Cruz, La Paz',0,NULL,NULL,0,NULL,NULL,NULL),('3456789','Andr??s','Guti??rrez','73456789','Av. Montes 2345, La Paz',0,NULL,NULL,1,'Comercio Independiente','Mercado Rodr??guez',NULL),('4567890','Mar??a','L??pez','74567890','Calle Ja??n 234, La Paz',1,'UMSA','Av. Villaz??n 1966',0,NULL,NULL,1),('5489023','Lucia','Choque',NULL,'Zona Sur, Calle 21 Nro 8, La Paz',0,NULL,NULL,0,NULL,NULL,NULL),('5678901','Jos??','Garc??a','75678901','Av. Armentia 567, La Paz',1,'UMSA','Av. Villaz??n 1966',1,'Consultora ABC','Calle Bol??var 100',3),('6712834','Carlos','Flores','76712834','Av. Montes 1102, La Paz',0,NULL,NULL,1,'Banco Nacional','Av. 16 de Julio',NULL),('6789012','Carmen','Ruiz','76789012','Zona Sopocachi, Calle 12, La Paz',0,NULL,NULL,1,'Hospital Arco Iris','Av. Arce 234',NULL),('7234501','Ana','Mamani','71234501','Av. Buenos Aires 345, El Alto',1,'UMSA','Av. Villazon 1966',0,NULL,NULL,6),('7755001','Gestor','UMSA','77755001','Av. Villaz??n 1966, La Paz',0,NULL,NULL,0,NULL,NULL,NULL),('7890123','Luis','Mendoza','77890123','Av. 6 de Agosto 890, La Paz',1,'UMSA','Av. Villaz??n 1966',0,NULL,NULL,11),('8156302','Pedro','Quispe','78156302','Calle Comercio 78, La Paz',1,'UMSA','Av. Villazon 1966',1,'Empresa XYZ','Calle Potosi 200',8),('8901234','Patricia','Vega','78901234','Calle Potos?? 456, La Paz',0,NULL,NULL,1,'Banco Mercantil','Av. Camacho 789',NULL),('9012345','Roberto','Silva','79012345','Zona Miraflores, Av. Busch 123, La Paz',1,'UMSA','Av. Villaz??n 1966',1,'Empresa Constructora','Zona Industrial',6),('9301245','Rosa','Condori','79301245','Villa Fatima, Calle 5 Nro 23, La Paz',0,NULL,NULL,1,'Comercio Local','Villa Fatima',NULL);
/*!40000 ALTER TABLE `ciudadano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comprobante`
--

DROP TABLE IF EXISTS `comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comprobante` (
  `idComprobante` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `fecha` date NOT NULL DEFAULT (curdate()),
  `url` varchar(300) DEFAULT NULL,
  `idPago` int NOT NULL,
  PRIMARY KEY (`idComprobante`),
  UNIQUE KEY `UQ_COMPROBANTE_PAGO` (`idPago`),
  CONSTRAINT `FK_COMPROBANTE_PAGO` FOREIGN KEY (`idPago`) REFERENCES `pago` (`idPago`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprobante`
--

LOCK TABLES `comprobante` WRITE;
/*!40000 ALTER TABLE `comprobante` DISABLE KEYS */;
INSERT INTO `comprobante` VALUES (1,'COMP-2025-0031','2025-03-03','https://muni.lapaz.bo/comp/2025-0031.pdf',1),(2,'COMP-2025-0032','2025-03-05','https://muni.lapaz.bo/comp/2025-0032.pdf',2),(3,'COMP-2025-0047','2025-03-22','https://muni.lapaz.bo/comp/2025-0047.pdf',5),(4,'COMP-2025-0061','2025-04-07','https://muni.lapaz.bo/comp/2025-0061.pdf',7),(5,'COMP-2025-0100','2025-04-10','https://muni.lapaz.bo/comp/2025-0100.pdf',8),(6,'COMP-2025-0101','2025-04-12','https://muni.lapaz.bo/comp/2025-0101.pdf',9),(7,'COMP-2025-0102','2025-04-20','https://muni.lapaz.bo/comp/2025-0102.pdf',12),(8,'COMP-2025-0103','2025-05-01','https://muni.lapaz.bo/comp/2025-0103.pdf',16),(9,'COMP-2025-0104','2025-05-05','https://muni.lapaz.bo/comp/2025-0104.pdf',18),(10,'COMP-2025-0105','2025-05-12','https://muni.lapaz.bo/comp/2025-0105.pdf',21),(11,'COMP-2025-0106','2025-05-20','https://muni.lapaz.bo/comp/2025-0106.pdf',24),(12,'COMP-2025-0107','2025-05-25','https://muni.lapaz.bo/comp/2025-0107.pdf',26);
/*!40000 ALTER TABLE `comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convenio`
--

DROP TABLE IF EXISTS `convenio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `convenio` (
  `idConvenio` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(300) NOT NULL,
  `tipo` enum('marco','especifico') NOT NULL DEFAULT 'especifico',
  `descripcion` text,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'activo',
  `archivoUrl` varchar(300) DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ciCreador` varchar(20) NOT NULL,
  PRIMARY KEY (`idConvenio`),
  KEY `FK_CONVENIO_USUARIO` (`ciCreador`),
  CONSTRAINT `FK_CONVENIO_USUARIO` FOREIGN KEY (`ciCreador`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convenio`
--

LOCK TABLES `convenio` WRITE;
/*!40000 ALTER TABLE `convenio` DISABLE KEYS */;
/*!40000 ALTER TABLE `convenio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descarga`
--

DROP TABLE IF EXISTS `descarga`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descarga` (
  `ci` varchar(20) NOT NULL,
  `idDoc` int NOT NULL,
  PRIMARY KEY (`ci`,`idDoc`),
  KEY `FK_DESCARGA_DOCUMENTO` (`idDoc`),
  CONSTRAINT `FK_DESCARGA_CIUDADANO` FOREIGN KEY (`ci`) REFERENCES `ciudadano` (`ci`),
  CONSTRAINT `FK_DESCARGA_DOCUMENTO` FOREIGN KEY (`idDoc`) REFERENCES `documento` (`idDoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descarga`
--

LOCK TABLES `descarga` WRITE;
/*!40000 ALTER TABLE `descarga` DISABLE KEYS */;
INSERT INTO `descarga` VALUES ('7234501',1),('9301245',1),('8156302',2),('6712834',3),('8156302',4),('4567890',5),('5678901',6),('8901234',7),('2345678',8),('4567890',9),('7890123',10),('0123456',11),('2345678',12);
/*!40000 ALTER TABLE `descarga` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documento`
--

DROP TABLE IF EXISTS `documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documento` (
  `idDoc` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fechaEmision` date NOT NULL DEFAULT (curdate()),
  `estado` varchar(50) NOT NULL DEFAULT 'generado',
  PRIMARY KEY (`idDoc`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documento`
--

LOCK TABLES `documento` WRITE;
/*!40000 ALTER TABLE `documento` DISABLE KEYS */;
INSERT INTO `documento` VALUES (1,'Cert. Residencia - Ana Mamani 03/2025','certificado','2025-03-04','firmado'),(2,'Partida Nacimiento - hijo de Pedro Quispe','partida','2025-03-06','firmado'),(3,'Cert. Solteria - Carlos Flores 03/2025','certificado','2025-03-23','firmado'),(4,'Cert. Residencia - Pedro Quispe 04/2025','certificado','2025-04-08','emitido'),(5,'Cert. Residencia - Mar??a L??pez 04/2025','certificado','2025-04-11','firmado'),(6,'Partida Nacimiento - hijo de Jos?? Garc??a','partida','2025-04-13','firmado'),(7,'Apostilla - Patricia Vega 04/2025','apostilla','2025-04-21','firmado'),(8,'Carnet Municipal - Sof??a Castro 05/2025','carnet','2025-05-02','firmado'),(9,'Convalidaci??n - Mar??a L??pez 05/2025','certificado','2025-05-06','firmado'),(10,'Convenio Pasant??as - Luis Mendoza','convenio','2025-05-13','firmado'),(11,'Partida Nacimiento - Elena Torres','partida','2025-05-21','firmado'),(12,'Cert. Solter??a - Sof??a Castro 05/2025','certificado','2025-05-26','firmado');
/*!40000 ALTER TABLE `documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facultad_umsa`
--

DROP TABLE IF EXISTS `facultad_umsa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facultad_umsa` (
  `idFacultad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `sigla` varchar(20) NOT NULL,
  PRIMARY KEY (`idFacultad`),
  UNIQUE KEY `UQ_FACULTAD_SIGLA` (`sigla`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultad_umsa`
--

LOCK TABLES `facultad_umsa` WRITE;
/*!40000 ALTER TABLE `facultad_umsa` DISABLE KEYS */;
INSERT INTO `facultad_umsa` VALUES (1,'Facultad de Derecho y Ciencias Politicas','FDCP'),(2,'Facultad de Medicina, Enfermeria, Nutricion y Tecnologia Medica','FMENyTM'),(3,'Facultad de Ingenieria','FI'),(4,'Facultad de Ciencias Economicas y Financieras','FCEF'),(5,'Facultad de Humanidades y Ciencias de la Educacion','FHCE'),(6,'Facultad de Ciencias Puras y Naturales','FCPN'),(7,'Facultad de Arquitectura, Artes, Diseno y Urbanismo','FAADU'),(8,'Facultad de Ciencias Sociales','FCS'),(9,'Facultad de Agronomia','FAgro'),(10,'Facultad de Odontologia','FO');
/*!40000 ALTER TABLE `facultad_umsa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firma`
--

DROP TABLE IF EXISTS `firma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `firma` (
  `ci` varchar(20) NOT NULL,
  `idDoc` int NOT NULL,
  PRIMARY KEY (`ci`,`idDoc`),
  KEY `FK_FIRMA_DOCUMENTO` (`idDoc`),
  CONSTRAINT `FK_FIRMA_AUTORIDAD` FOREIGN KEY (`ci`) REFERENCES `autoridad` (`ci`),
  CONSTRAINT `FK_FIRMA_DOCUMENTO` FOREIGN KEY (`idDoc`) REFERENCES `documento` (`idDoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firma`
--

LOCK TABLES `firma` WRITE;
/*!40000 ALTER TABLE `firma` DISABLE KEYS */;
INSERT INTO `firma` VALUES ('2845610',1),('1983047',2),('2845610',3),('2845610',5),('1983047',6),('2845610',7),('1983047',8),('2845610',9),('1983047',10),('2845610',11),('1983047',12);
/*!40000 ALTER TABLE `firma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flujo_tramite`
--

DROP TABLE IF EXISTS `flujo_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flujo_tramite` (
  `idFlujo` int NOT NULL AUTO_INCREMENT,
  `idTramite` int NOT NULL,
  `orden` int NOT NULL,
  `institucion` enum('ciudadano','umsa','municipio','autoridad') NOT NULL,
  `accion` varchar(100) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`idFlujo`),
  KEY `FK_FLUJO_TRAMITE` (`idTramite`),
  CONSTRAINT `FK_FLUJO_TRAMITE` FOREIGN KEY (`idTramite`) REFERENCES `tramite` (`idTramite`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flujo_tramite`
--

LOCK TABLES `flujo_tramite` WRITE;
/*!40000 ALTER TABLE `flujo_tramite` DISABLE KEYS */;
INSERT INTO `flujo_tramite` VALUES (1,6,1,'ciudadano','solicitar','Ciudadano envia solicitud con documentos'),(2,6,2,'umsa','validar','Gestor UMSA valida inscripcion universitaria'),(3,6,3,'municipio','revisar','Funcionario municipal revisa documentos'),(4,6,4,'autoridad','aprobar','Autoridad aprueba el certificado'),(5,7,1,'ciudadano','solicitar','Ciudadano envia documento academico'),(6,7,2,'umsa','validar','UMSA certifica autenticidad del documento'),(7,7,3,'municipio','legalizar','Municipio legaliza con sello oficial'),(8,7,4,'autoridad','aprobar','Autoridad firma la legalizacion'),(9,8,1,'ciudadano','solicitar','Estudiante postula a practicas'),(10,8,2,'umsa','validar','UMSA valida requisitos academicos'),(11,8,3,'municipio','asignar','Municipio asigna dependencia'),(12,8,4,'autoridad','aprobar','Autoridad aprueba la asignacion'),(13,9,1,'ciudadano','solicitar','Estudiante solicita carnet'),(14,9,2,'umsa','validar','UMSA verifica matricula activa'),(15,9,3,'municipio','emitir','Municipio emite carnet'),(16,9,4,'autoridad','aprobar','Autoridad firma el carnet'),(17,10,1,'ciudadano','solicitar','Estudiante solicita certificado de matricula'),(18,10,2,'umsa','validar','UMSA verifica y emite certificado'),(19,10,3,'municipio','legalizar','Municipio legaliza el certificado'),(20,11,1,'ciudadano','solicitar','Ciudadano solicita convalidacion'),(21,11,2,'umsa','validar','UMSA certifica programas de estudio'),(22,11,3,'municipio','revisar','Municipio revisa y convalida'),(23,11,4,'autoridad','aprobar','Autoridad aprueba la convalidacion');
/*!40000 ALTER TABLE `flujo_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `ci` varchar(20) NOT NULL,
  `cargo` varchar(100) NOT NULL,
  `departamento` varchar(100) NOT NULL,
  PRIMARY KEY (`ci`),
  CONSTRAINT `FK_FUNCIONARIO_USUARIO` FOREIGN KEY (`ci`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
INSERT INTO `funcionario` VALUES ('2845610','Jefa de Ventanilla','Ventanilla Unica'),('3102987','Tecnico de Tramites','Ventanilla Unica');
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_umsa`
--

DROP TABLE IF EXISTS `gestor_umsa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_umsa` (
  `ci` varchar(20) NOT NULL,
  `cargo` varchar(100) NOT NULL,
  `idFacultad` int NOT NULL,
  PRIMARY KEY (`ci`),
  CONSTRAINT `FK_GESTOR_UMSA_USUARIO` FOREIGN KEY (`ci`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_umsa`
--

LOCK TABLES `gestor_umsa` WRITE;
/*!40000 ALTER TABLE `gestor_umsa` DISABLE KEYS */;
INSERT INTO `gestor_umsa` VALUES ('7755001','Gestor Academico UMSA',3);
/*!40000 ALTER TABLE `gestor_umsa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estado`
--

DROP TABLE IF EXISTS `historial_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estado` (
  `idHistorial` int NOT NULL AUTO_INCREMENT,
  `idSolicitud` int NOT NULL,
  `estadoAnterior` varchar(50) DEFAULT NULL,
  `estadoNuevo` varchar(50) NOT NULL,
  `institucion` enum('ciudadano','umsa','municipio','autoridad') DEFAULT NULL,
  `ciActor` varchar(20) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observacion` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idHistorial`),
  KEY `FK_HISTORIAL_SOLICITUD` (`idSolicitud`),
  CONSTRAINT `FK_HISTORIAL_SOLICITUD` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estado`
--

LOCK TABLES `historial_estado` WRITE;
/*!40000 ALTER TABLE `historial_estado` DISABLE KEYS */;
INSERT INTO `historial_estado` VALUES (1,9,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Documentaci??n recibida'),(2,9,'en_revision','aprobada','autoridad','2845610','2026-06-15 13:10:02','Certificado aprobado'),(3,10,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Verificaci??n iniciada'),(4,10,'en_revision','aprobada','autoridad','1983047','2026-06-15 13:10:02','Registro completado'),(5,12,'pendiente','en_revision','municipio','2845610','2026-06-15 13:10:02','En proceso de verificaci??n'),(6,13,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Documentos recibidos'),(7,13,'en_revision','aprobada','autoridad','2845610','2026-06-15 13:10:02','Apostilla aprobada'),(8,14,'pendiente','rechazada','umsa','7755001','2026-06-15 13:10:02','Falta certificado UMSA vigente'),(9,16,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Validado por UMSA'),(10,17,'pendiente','en_revision','municipio','2845610','2026-06-15 13:10:02','En revisi??n t??cnica'),(11,17,'en_revision','aprobada','autoridad','1983047','2026-06-15 13:10:02','Carnet emitido'),(12,19,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Documentos completos'),(13,19,'en_revision','aprobada','autoridad','2845610','2026-06-15 13:10:02','Convalidaci??n aprobada'),(14,22,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Convenio revisado'),(15,22,'en_revision','aprobada','autoridad','1983047','2026-06-15 13:10:02','Convenio aprobado'),(16,23,'pendiente','rechazada','umsa','7755001','2026-06-15 13:10:02','Perfil incompleto'),(17,25,'pendiente','en_revision','municipio','2845610','2026-06-15 13:10:02','Registro verificado'),(18,25,'en_revision','aprobada','autoridad','2845610','2026-06-15 13:10:02','Partida emitida'),(19,27,'pendiente','en_revision','municipio','3102987','2026-06-15 13:10:02','Documentaci??n completa'),(20,27,'en_revision','aprobada','autoridad','1983047','2026-06-15 13:10:02','Certificado aprobado');
/*!40000 ALTER TABLE `historial_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `idPago` int NOT NULL AUTO_INCREMENT,
  `monto` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL DEFAULT (curdate()),
  `metodo` varchar(50) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  `idSolicitud` int NOT NULL,
  PRIMARY KEY (`idPago`),
  KEY `FK_PAGO_SOLICITUD` (`idSolicitud`),
  CONSTRAINT `FK_PAGO_SOLICITUD` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,60.00,'2025-03-03','QR','pagado',1),(2,0.00,'2025-03-05','exento','pagado',2),(3,350.00,'2025-03-10','transferencia','devuelto',3),(4,350.00,'2025-03-21','QR','pendiente',4),(5,90.00,'2025-03-22','efectivo','pagado',5),(6,60.00,'2025-04-07','QR','pagado',7),(7,90.00,'2025-02-14','efectivo','devuelto',8),(8,60.00,'2025-04-10','QR','pagado',9),(9,0.00,'2025-04-12','exento','pagado',10),(10,350.00,'2025-04-15','transferencia','pendiente',11),(11,90.00,'2025-04-18','QR','pendiente',12),(12,200.00,'2025-04-20','efectivo','pagado',13),(13,45.00,'2025-04-22','QR','devuelto',14),(14,120.00,'2025-04-25','transferencia','pendiente',15),(15,0.00,'2025-04-28','exento','pendiente',16),(16,35.00,'2025-05-01','QR','pagado',17),(17,25.00,'2025-05-03','efectivo','pendiente',18),(18,150.00,'2025-05-05','QR','pagado',19),(19,0.00,'2025-05-08','exento','pendiente',20),(20,0.00,'2025-05-10','exento','pendiente',21),(21,0.00,'2025-05-12','exento','pagado',22),(22,0.00,'2025-05-15','exento','devuelto',23),(23,60.00,'2025-05-18','QR','pendiente',24),(24,0.00,'2025-05-20','exento','pagado',25),(25,350.00,'2025-05-22','transferencia','pendiente',26),(26,90.00,'2025-05-25','QR','pagado',27),(27,200.00,'2025-05-28','efectivo','pendiente',28);
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parte_convenio`
--

DROP TABLE IF EXISTS `parte_convenio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parte_convenio` (
  `idParte` int NOT NULL AUTO_INCREMENT,
  `idConvenio` int NOT NULL,
  `entidad` enum('UMSA','Municipio') NOT NULL,
  `representante` varchar(200) NOT NULL,
  `cargo` varchar(200) NOT NULL,
  PRIMARY KEY (`idParte`),
  KEY `FK_PARTE_CONVENIO` (`idConvenio`),
  CONSTRAINT `FK_PARTE_CONVENIO` FOREIGN KEY (`idConvenio`) REFERENCES `convenio` (`idConvenio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parte_convenio`
--

LOCK TABLES `parte_convenio` WRITE;
/*!40000 ALTER TABLE `parte_convenio` DISABLE KEYS */;
/*!40000 ALTER TABLE `parte_convenio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `practica`
--

DROP TABLE IF EXISTS `practica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `practica` (
  `idPractica` int NOT NULL AUTO_INCREMENT,
  `idConvenio` int DEFAULT NULL,
  `ciEstudiante` varchar(20) NOT NULL,
  `carrera` varchar(200) NOT NULL,
  `duracion` varchar(50) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  `observacion` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`idPractica`),
  KEY `FK_PRACTICA_CONVENIO` (`idConvenio`),
  KEY `FK_PRACTICA_USUARIO` (`ciEstudiante`),
  CONSTRAINT `FK_PRACTICA_CONVENIO` FOREIGN KEY (`idConvenio`) REFERENCES `convenio` (`idConvenio`),
  CONSTRAINT `FK_PRACTICA_USUARIO` FOREIGN KEY (`ciEstudiante`) REFERENCES `usuario` (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `practica`
--

LOCK TABLES `practica` WRITE;
/*!40000 ALTER TABLE `practica` DISABLE KEYS */;
/*!40000 ALTER TABLE `practica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produce`
--

DROP TABLE IF EXISTS `produce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produce` (
  `idSolicitud` int NOT NULL,
  `idDoc` int NOT NULL,
  PRIMARY KEY (`idSolicitud`,`idDoc`),
  KEY `FK_PRODUCE_DOCUMENTO` (`idDoc`),
  CONSTRAINT `FK_PRODUCE_DOCUMENTO` FOREIGN KEY (`idDoc`) REFERENCES `documento` (`idDoc`),
  CONSTRAINT `FK_PRODUCE_SOLICITUD` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produce`
--

LOCK TABLES `produce` WRITE;
/*!40000 ALTER TABLE `produce` DISABLE KEYS */;
INSERT INTO `produce` VALUES (1,1),(2,2),(5,3),(7,4),(9,5),(10,6),(13,7),(17,8),(19,9),(22,10),(25,11),(27,12);
/*!40000 ALTER TABLE `produce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud`
--

DROP TABLE IF EXISTS `solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud` (
  `idSolicitud` int NOT NULL AUTO_INCREMENT,
  `fechaSolicitud` date NOT NULL DEFAULT (curdate()),
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  `observacion` varchar(500) DEFAULT NULL,
  `idTramite` int NOT NULL,
  `ci_ciudadano` varchar(20) DEFAULT NULL,
  `idConvenio` int DEFAULT NULL,
  `institucion_origen` enum('ciudadano','umsa','municipio') NOT NULL DEFAULT 'ciudadano',
  `institucion_actual` enum('ciudadano','umsa','municipio','autoridad','finalizado') NOT NULL DEFAULT 'ciudadano',
  `estado_umsa` enum('pendiente','validado','rechazado') DEFAULT 'pendiente',
  `estado_municipio` enum('pendiente','en_revision','aprobado','rechazado') DEFAULT 'pendiente',
  PRIMARY KEY (`idSolicitud`),
  KEY `FK_SOLICITUD_TRAMITE` (`idTramite`),
  KEY `FK_SOLICITUD_CIUDADANO` (`ci_ciudadano`),
  CONSTRAINT `FK_SOLICITUD_CIUDADANO` FOREIGN KEY (`ci_ciudadano`) REFERENCES `ciudadano` (`ci`),
  CONSTRAINT `FK_SOLICITUD_TRAMITE` FOREIGN KEY (`idTramite`) REFERENCES `tramite` (`idTramite`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud`
--

LOCK TABLES `solicitud` WRITE;
/*!40000 ALTER TABLE `solicitud` DISABLE KEYS */;
INSERT INTO `solicitud` VALUES (1,'2025-03-03','aprobada','Documentos completos y verificados',1,'7234501',NULL,'ciudadano','finalizado','pendiente','aprobado'),(2,'2025-03-05','aprobada','Datos del recien nacido verificados con hospital',2,'8156302',NULL,'ciudadano','finalizado','pendiente','aprobado'),(3,'2025-03-10','rechazada','Falta memoria descriptiva del local comercial',3,'9301245',NULL,'ciudadano','finalizado','pendiente','rechazado'),(4,'2025-03-20','pendiente','Documentacion recibida, en proceso de revision',3,'9301245',NULL,'ciudadano','municipio','pendiente','pendiente'),(5,'2025-03-22','aprobada','Verificado en registro civil, sin observaciones',4,'6712834',NULL,'ciudadano','finalizado','pendiente','aprobado'),(6,'2025-04-01','pendiente',NULL,5,'8156302',NULL,'ciudadano','municipio','pendiente','pendiente'),(7,'2025-04-07','aprobada','Factura de luz presentada y verificada',1,'7234501',NULL,'ciudadano','finalizado','pendiente','aprobado'),(8,'2025-02-14','rechazada','Usuario dado de baja del sistema durante el proceso',4,'6712834',NULL,'ciudadano','finalizado','pendiente','rechazado'),(9,'2025-04-10','aprobada','Documentaci??n completa y verificada',1,'4567890',NULL,'ciudadano','finalizado','pendiente','aprobado'),(10,'2025-04-12','aprobada','Certificado emitido correctamente',2,'5678901',NULL,'ciudadano','finalizado','pendiente','aprobado'),(11,'2025-04-15','pendiente',NULL,3,'6789012',NULL,'ciudadano','municipio','pendiente','pendiente'),(12,'2025-04-18','en_revision','En proceso de verificaci??n documental',4,'7890123',NULL,'ciudadano','municipio','pendiente','en_revision'),(13,'2025-04-20','aprobada','Apostilla completada exitosamente',5,'8901234',NULL,'ciudadano','finalizado','pendiente','aprobado'),(14,'2025-04-22','rechazada','Falta certificado de inscripci??n UMSA vigente',6,'9012345',NULL,'ciudadano','finalizado','rechazado','pendiente'),(15,'2025-04-25','pendiente',NULL,7,'0123456',NULL,'ciudadano','umsa','pendiente','pendiente'),(16,'2025-04-28','en_revision','Validado por UMSA, pendiente revisi??n municipal',8,'1234567',NULL,'ciudadano','municipio','validado','en_revision'),(17,'2025-05-01','aprobada','Carnet emitido y firmado por autoridad',9,'2345678',NULL,'ciudadano','finalizado','validado','aprobado'),(18,'2025-05-03','pendiente',NULL,10,'3456789',NULL,'ciudadano','umsa','pendiente','pendiente'),(19,'2025-05-05','aprobada','Convalidaci??n aprobada por autoridad competente',11,'4567890',NULL,'ciudadano','finalizado','validado','aprobado'),(20,'2025-05-08','en_revision','Convenio en revisi??n por consejo universitario',12,'5678901',NULL,'ciudadano','umsa','pendiente','pendiente'),(21,'2025-05-10','pendiente',NULL,13,'6789012',NULL,'ciudadano','municipio','pendiente','pendiente'),(22,'2025-05-12','aprobada','Convenio de pasant??as aprobado oficialmente',14,'7890123',NULL,'ciudadano','finalizado','validado','aprobado'),(23,'2025-05-15','rechazada','Perfil de proyecto incompleto, falta presupuesto',15,'8901234',NULL,'ciudadano','finalizado','rechazado','pendiente'),(24,'2025-05-18','pendiente',NULL,1,'9012345',NULL,'ciudadano','municipio','pendiente','pendiente'),(25,'2025-05-20','aprobada','Registro completado sin observaciones',2,'0123456',NULL,'ciudadano','finalizado','pendiente','aprobado'),(26,'2025-05-22','en_revision','Memoria descriptiva en revisi??n t??cnica',3,'1234567',NULL,'ciudadano','municipio','pendiente','en_revision'),(27,'2025-05-25','aprobada','Certificado de solter??a emitido',4,'2345678',NULL,'ciudadano','finalizado','pendiente','aprobado'),(28,'2025-05-28','pendiente',NULL,5,'3456789',NULL,'ciudadano','municipio','pendiente','pendiente');
/*!40000 ALTER TABLE `solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tramite`
--

DROP TABLE IF EXISTS `tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tramite` (
  `idTramite` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `requisitos` varchar(500) DEFAULT NULL,
  `tipo_tramite` enum('municipal','umsa','convenio') NOT NULL DEFAULT 'municipal',
  `costo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(50) NOT NULL DEFAULT 'activo',
  `fechaCreacion` date NOT NULL DEFAULT (curdate()),
  `ci_funcionario` varchar(20) NOT NULL,
  PRIMARY KEY (`idTramite`),
  KEY `FK_TRAMITE_FUNCIONARIO` (`ci_funcionario`),
  CONSTRAINT `FK_TRAMITE_FUNCIONARIO` FOREIGN KEY (`ci_funcionario`) REFERENCES `funcionario` (`ci`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tramite`
--

LOCK TABLES `tramite` WRITE;
/*!40000 ALTER TABLE `tramite` DISABLE KEYS */;
INSERT INTO `tramite` VALUES (1,'Certificado de Residencia','Emision de certificado oficial de domicilio','CI vigente, factura de agua o luz del domicilio','municipal',60.00,'activo','2025-01-08','3102987'),(2,'Registro de Nacimiento','Inscripcion de nacimiento en el registro civil','Certificado medico de nacimiento, CI de ambos padres','municipal',0.00,'activo','2025-01-08','3102987'),(3,'Licencia de Funcionamiento','Autorizacion municipal para apertura de negocio','CI, croquis del local, contrato de alquiler o titulos, memoria descriptiva','municipal',350.00,'activo','2025-01-15','2845610'),(4,'Certificado de Solteria','Constancia de estado civil soltero para uso legal','CI vigente, partida de nacimiento','municipal',90.00,'activo','2025-02-03','2845610'),(5,'Apostilla de Documentos','Legalizacion de documentos bolivianos para uso en el exterior','Documento original a apostillar, CI vigente, carta de destino','municipal',200.00,'activo','2025-02-10','3102987'),(6,'Certificado de Residencia Estudiantil','Certificado oficial de domicilio para estudiantes UMSA que requieren acreditar residencia en La Paz.','CI vigente, Factura de agua/luz del domicilio, Certificado de inscripcion UMSA','umsa',45.00,'activo','2026-06-15','3102987'),(7,'Legalizacion de Documentos Academicos','Legalizacion municipal de titulos, diplomas y certificados academicos emitidos por la UMSA.','Documento original a legalizar, CI vigente, Certificado de conclusion UMSA','umsa',120.00,'activo','2026-06-15','2845610'),(8,'Solicitud de Practicas Pre-Profesionales','Postulacion para realizar practicas pre-profesionales en dependencias municipales.','CI vigente, Certificado de inscripcion UMSA, Carta de presentacion de facultad, Hoja de vida','umsa',0.00,'activo','2026-06-15','3102987'),(9,'Carnet Municipal Universitario','Emision del carnet que acredita al estudiante UMSA para acceder a beneficios municipales.','CI vigente, Certificado de inscripcion UMSA, Fotografia 4x4 fondo azul','umsa',35.00,'activo','2026-06-15','3102987'),(10,'Certificado de Matricula UMSA','Certificado oficial de matricula vigente emitido por la UMSA para tramites municipales.','CI vigente, Codigo de estudiante UMSA','umsa',25.00,'activo','2026-06-15','3102987'),(11,'Convalidacion de Estudios','Convalidacion de estudios realizados en la UMSA para su reconocimiento municipal.','Certificado de notas, Programas de estudio, CI vigente','umsa',150.00,'activo','2026-06-15','2845610'),(12,'Convenio Marco UMSA-Municipio','Registro de convenio marco de cooperacion interinstitucional entre la UMSA y la Municipalidad de La Paz.','Resolucion del H. Consejo Universitario, Resolucion Municipal, Minuta de convenio','convenio',0.00,'activo','2026-06-15','2845610'),(13,'Convenio Especifico de Practicas','Convenio especifico para la realizacion de practicas pre-profesionales entre una facultad UMSA y una dependencia municipal.','Convenio marco vigente, Plan de practicas, Designacion de tutores','convenio',0.00,'activo','2026-06-15','2845610'),(14,'Convenio de Pasantias','Acuerdo para que estudiantes UMSA realicen pasantias en areas tecnicas del municipio.','Carta de solicitud de facultad, Seguro de salud, Plan de trabajo','convenio',0.00,'activo','2026-06-15','2845610'),(15,'Convenio de Investigacion Conjunta','Convenio para proyectos de investigacion conjunta entre la UMSA y la Municipalidad.','Perfil del proyecto, Resolucion facultativa, Designacion de responsables','convenio',0.00,'activo','2026-06-15','2845610');
/*!40000 ALTER TABLE `tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ci` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ci`),
  UNIQUE KEY `UQ_USUARIO_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES ('0123456','elena.torres@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('1234567','diego.morales@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('1983047','director@muni.gob.bo','$2a$10$7z1yt9QZwqTgPpuT.qsxO./T.hbNneLgTjisCrjf/8Q5YqkYa3rES',1),('2345678','sofia.castro@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('2845610','silvia.apaza@muni.gob.bo','$2a$10$KfP57h06moUJmMqZKUJDUeRtulx9W50voUTBN5zQcEtJuMJG2to8u',1),('3102987','juan.ticona@muni.gob.bo','$2a$10$KfP57h06moUJmMqZKUJDUeRtulx9W50voUTBN5zQcEtJuMJG2to8u',1),('3456789','andres.gutierrez@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('4567890','maria.lopez@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('5489023','lucia.choque@gmail.com','$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu',0),('5678901','jose.garcia@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('6712834','carlos.flores@gmail.com','$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu',1),('6789012','carmen.ruiz@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('7234501','ana.mamani@gmail.com','$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu',1),('7755001','gestor.umsa@umsa.bo','$2a$10$KfP57h06moUJmMqZKUJDUeRtulx9W50voUTBN5zQcEtJuMJG2to8u',1),('7890123','luis.mendoza@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('8156302','pedro.quispe@gmail.com','$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu',1),('8901234','patricia.vega@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('9012345','roberto.silva@gmail.com','$2a$10$MCUITlT.dY/IAE5dnyZzFudlZQaTekBrwcFnXlPSJ0Isj3ZOmDNn.',1),('9301245','rosa.condori@gmail.com','$2a$10$GV/iqoHuNrTv5YhBoXVb5uydDavQymzMUxhWMZPHt.BOdHtyQWClu',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-15 13:51:12

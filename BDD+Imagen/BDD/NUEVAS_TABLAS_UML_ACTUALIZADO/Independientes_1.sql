/* Tabla para las campañas de marketing */
CREATE TABLE Campana (
    ID_Campana SERIAL PRIMARY KEY,
    Nombre_Campana VARCHAR(255) NOT NULL
);


/* TABLA MAESTRA: Canales de la campana */
CREATE TABLE Canal (
    ID_Canal SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) UNIQUE NOT NULL /* 'Email', 'SMS', 'Call Center' */
);

/* TABLA MAESTRA: Segmentos de la campana */
CREATE TABLE Segmento (
    ID_Segmento SERIAL PRIMARY KEY,
    Nombre VARCHAR(255) UNIQUE NOT NULL, /* 'Clientes antiguos', 'Rango 25-35' */
    Descripcion TEXT
);


/* Tabla central para los clientes */
CREATE TABLE Consumidor (
    RUT VARCHAR(12) PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Tipo_Cliente VARCHAR(50),
    Scoring INT,
	Activo BOOLEAN DEFAULT TRUE
);
COMMENT ON COLUMN Consumidor.Tipo_Cliente IS 'Prospecto, Existente, Inactivo, Nuevo';

/* TABLA MAESTRA: Para tipos de documentos (Cédula, Liq. Sueldo, etc.) */
CREATE TABLE Tipo_Documento (
    ID_Tipo_Documento SERIAL PRIMARY KEY,
    Nombre VARCHAR(50) UNIQUE NOT NULL
);

/* Tabla para las entidades que proveen el dinero */
CREATE TABLE Entidad_Fondeo (
    ID_Entidad_Fondeo SERIAL PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL, /* 'Banco, AFP, Fondo de Inversión' */
    Tipo VARCHAR(100)
);

/* Tablas para el desembolso (separadas) */
CREATE TABLE Cuenta_Institucional (
    Numero_Cuenta VARCHAR(50) PRIMARY KEY,
    Saldo DECIMAL(15, 2)
);

CREATE TABLE Vale_Vista (
    Numero_Vale_Vista VARCHAR(50) PRIMARY KEY,
    Monto DECIMAL(15, 2),
    Estado VARCHAR(50),
    Emisor VARCHAR(255),
    Observaciones TEXT
);
COMMENT ON COLUMN Vale_Vista.Estado IS 'Emitido, Cobrado, Vencido, Anulado';

/* Tablas para la relación 1:1 con Solicitud */
CREATE TABLE Firma_Digital (
    ID_Firma SERIAL PRIMARY KEY,
    Datos_Firma TEXT NOT NULL
);

CREATE TABLE Sello_Tiempo (
    ID_Sello SERIAL PRIMARY KEY,
    Timestamp_Sello TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
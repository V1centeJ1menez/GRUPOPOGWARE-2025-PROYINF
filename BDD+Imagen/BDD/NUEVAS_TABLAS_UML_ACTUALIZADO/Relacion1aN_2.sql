/* TABLA ASOCIADA: Productos de fondeo (1:N con Entidad_Fondeo) */
CREATE TABLE Producto_Fondeo (
    ID_Producto_Fondeo SERIAL PRIMARY KEY,
    ID_Entidad_Fondeo INT NOT NULL REFERENCES Entidad_Fondeo(ID_Entidad_Fondeo),
    Nombre_Producto VARCHAR(255),
    Tasa_Base DECIMAL(5, 2),
    Plazo_Minimo_Dias INT,
    Plazo_Maximo_Dias INT,
    Monto_Minimo DECIMAL(15, 2),
    Monto_Maximo DECIMAL(15, 2),
    Activo BOOLEAN DEFAULT TRUE
);
COMMENT ON COLUMN Producto_Fondeo.Nombre_Producto IS 'E.g., Fondo a 30 días, Fondo a 90 días';

/* TABLA ASOCIADA: Beneficios ofrecidos por la campana (1:N con Campana) */
CREATE TABLE Beneficio_Campana (
    ID_Beneficio_Campana SERIAL PRIMARY KEY,
    ID_Campana INT NOT NULL REFERENCES Campana(ID_Campana),
    Descripcion TEXT,
    Tipo_Beneficio VARCHAR(100) /* E.g., 'Tasa', 'Comisión', 'Seguro' */
);

/* TABLA ASOCIADA: Teléfonos del consumidor (1:N con Consumidor) */
CREATE TABLE Telefono_Consumidor (
    ID_Telefono SERIAL PRIMARY KEY,
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Numero VARCHAR(20) NOT NULL,
    Tipo VARCHAR(50) /* E.g., 'Móvil', 'Casa', 'Trabajo' */
);

/* TABLA ASOCIADA: Correos del consumidor (1:N con Consumidor) */
CREATE TABLE Correo_Consumidor (
    ID_Correo SERIAL PRIMARY KEY,
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Email VARCHAR(255) NOT NULL,
    Tipo VARCHAR(50) /* E.g., 'Personal', 'Trabajo' */
);

/* TABLA ASOCIADA: Antecedentes del consumidor (1:N con Consumidor) */
CREATE TABLE Antecedente_Consumidor (
    ID_Antecedente SERIAL PRIMARY KEY,
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Tipo_Antecedente VARCHAR(100), /* E.g., 'Laboral', 'Financiero', 'Domicilio' */
    Descripcion TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fuente VARCHAR(255), /* E.g., 'Equifax', 'Declaración Cliente' */
    Vigente BOOLEAN DEFAULT TRUE
);

/* TABLA ASOCIADA: Beneficios asociados al consumidor (1:N con Consumidor) */
CREATE TABLE Beneficio_Consumidor (
    ID_Beneficio SERIAL PRIMARY KEY,
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Tipo_Beneficio VARCHAR(100), /* E.g., 'Descuento Tasa', 'Seguro Gratis' */
    Descripcion TEXT,
    Estado VARCHAR(50), /* E.g., 'Activo', 'Utilizado', 'Vencido' */
    Fecha_Vencimiento DATE
);

/* TABLA ASOCIADA: Documentos del consumidor (1:N con Consumidor) */
CREATE TABLE Documento_Carpeta (
    ID_Documento SERIAL PRIMARY KEY,
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    ID_Tipo_Documento INT NOT NULL REFERENCES Tipo_Documento(ID_Tipo_Documento),
    Archivo BYTEA NOT NULL,
    Fecha_Subida TIMESTAMP DEFAULT NOW()
);

/* Tabla para las solicitudes de crédito (corazón del flujo) */
CREATE TABLE Solicitud (
    Numero_Solicitud SERIAL PRIMARY KEY,
    Antecedentes_Solicitud TEXT, 
    Evaluacion_Riesgo TEXT,
    Reglas_Admision TEXT,
    Estado_Solicitud VARCHAR(50),
    
    /* Relaciones */
    ID_Campana INT REFERENCES Campana(ID_Campana),
    ID_Firma INT UNIQUE REFERENCES Firma_Digital(ID_Firma),
    ID_Sello INT UNIQUE REFERENCES Sello_Tiempo(ID_Sello)
);
COMMENT ON COLUMN Solicitud.Antecedentes_Solicitud IS 'Docs/datos de esta petición (ej. liquidaciones, Dicom)';

/* Tabla para las simulaciones */
CREATE TABLE Simulacion (
    ID_Simulacion SERIAL PRIMARY KEY,
    Monto DECIMAL(15, 2),
    Cuotas INT,
    Spread_Aplicado DECIMAL(5, 2),
    Tarifa_Costo_Fondo DECIMAL(5, 2),
    Total_a_Pagar DECIMAL(15, 2),
    
    /* Relaciones */
    RUT_Consumidor VARCHAR(12) REFERENCES Consumidor(RUT),
    Numero_Solicitud INT UNIQUE REFERENCES Solicitud(Numero_Solicitud)
);

/* Tabla para el crédito/préstamo generado */
CREATE TABLE Credito_Prestamo (
    ID_Credito SERIAL PRIMARY KEY,
    Monto DECIMAL(15, 2),
    Plazo_Cuotas INT,
    Spread_Aplicado DECIMAL(5, 2),
    Tasa_Aplicada DECIMAL(5, 2),
    Total_a_Pagar DECIMAL(15, 2),
    Estado VARCHAR(50),
    Metodo_Desembolso VARCHAR(50),

    /* Relación 1:1 con Solicitud */
    Numero_Solicitud INT NOT NULL UNIQUE REFERENCES Solicitud(Numero_Solicitud)
);
COMMENT ON COLUMN Credito_Prestamo.Estado IS 'Solicitado, Aprobado, Desembolsado, Pagado';
COMMENT ON COLUMN Credito_Prestamo.Metodo_Desembolso IS 'Corriente, Vale Vista';

/* TABLA ASOCIADA: Pagos del préstamo (1:N con Credito_Prestamo) [CORREGIDO] */
CREATE TABLE Pago_Prestamo (
    ID_Pago SERIAL PRIMARY KEY,
    ID_Credito INT NOT NULL REFERENCES Credito_Prestamo(ID_Credito),
    Tipo_Transaccion VARCHAR(100),
    Producto_a_Pagar VARCHAR(255),
    Monto_Pago DECIMAL(15, 2),
    Fecha_Pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
/* Resuelve la relación M:N entre Campana y Canal */
CREATE TABLE Campana_Canal (
    ID_Campana INT NOT NULL REFERENCES Campana(ID_Campana),
    ID_Canal INT NOT NULL REFERENCES Canal(ID_Canal),
    PRIMARY KEY (ID_Campana, ID_Canal)
);

/* Resuelve la relación M:N entre Campana y Segmento */
CREATE TABLE Campana_Segmento (
    ID_Campana INT NOT NULL REFERENCES Campana(ID_Campana),
    ID_Segmento INT NOT NULL REFERENCES Segmento(ID_Segmento),
    PRIMARY KEY (ID_Campana, ID_Segmento)
);

/* Resuelve la relación M:N entre Simulacion y Producto_Fondeo */
CREATE TABLE Simulacion_Producto_Fondeo (
    ID_Simulacion INT NOT NULL REFERENCES Simulacion(ID_Simulacion),
    ID_Producto_Fondeo INT NOT NULL REFERENCES Producto_Fondeo(ID_Producto_Fondeo),
    PRIMARY KEY (ID_Simulacion, ID_Producto_Fondeo)
);

/* Resuelve la relación M:N entre Credito_Prestamo y Producto_Fondeo */
CREATE TABLE Credito_Producto_Fondeo (
    ID_Credito INT NOT NULL REFERENCES Credito_Prestamo(ID_Credito),
    ID_Producto_Fondeo INT NOT NULL REFERENCES Producto_Fondeo(ID_Producto_Fondeo),
    PRIMARY KEY (ID_Credito, ID_Producto_Fondeo)
);

/* Resuelve la relación M:N entre Consumidor y Cuenta_Institucional */
CREATE TABLE Consumidor_Cuenta (
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Numero_Cuenta VARCHAR(50) NOT NULL REFERENCES Cuenta_Institucional(Numero_Cuenta),
    PRIMARY KEY (RUT_Consumidor, Numero_Cuenta)
);

/* Resuelve la relación M:N entre Credito_Prestamo y Cuenta_Institucional */
CREATE TABLE Credito_Cuenta (
    ID_Credito INT NOT NULL REFERENCES Credito_Prestamo(ID_Credito),
    Numero_Cuenta VARCHAR(50) NOT NULL REFERENCES Cuenta_Institucional(Numero_Cuenta),
    PRIMARY KEY (ID_Credito, Numero_Cuenta)
);

/* Resuelve la relación M:N entre Consumidor y Vale_Vista */
CREATE TABLE Consumidor_ValeVista (
    RUT_Consumidor VARCHAR(12) NOT NULL REFERENCES Consumidor(RUT),
    Numero_Vale_Vista VARCHAR(50) NOT NULL REFERENCES Vale_Vista(Numero_Vale_Vista),
    PRIMARY KEY (RUT_Consumidor, Numero_Vale_Vista)
);

/* Resuelve la relación M:N entre Credito_Prestamo y Vale_Vista */
CREATE TABLE Credito_ValeVista (
    ID_Credito INT NOT NULL REFERENCES Credito_Prestamo(ID_Credito),
    Numero_Vale_Vista VARCHAR(50) NOT NULL REFERENCES Vale_Vista(Numero_Vale_Vista),
    PRIMARY KEY (ID_Credito, Numero_Vale_Vista)
);
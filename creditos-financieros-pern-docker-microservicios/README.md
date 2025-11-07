# Sistema de Créditos Financieros - Arquitectura de Microservicios

Sistema de gestión de créditos financieros desarrollado con arquitectura de microservicios usando **PERN Stack** (PostgreSQL, Express, React, Node.js) desplegado con Docker.

## Descripción

Plataforma modular para gestionar el ciclo completo de créditos financieros, desde la simulación y solicitud hasta el desembolso, pago y cobranza. Cada funcionalidad está implementada como un microservicio independiente con su propia base de datos.

## Arquitectura

```
Frontend (React) → Gateway (Express) → Microservicios (Express + PostgreSQL)
                                       ├─ auth
                                       ├─ simulacion
                                       ├─ solicitud
                                       ├─ evaluacion
                                       ├─ firma
                                       ├─ desembolso
                                       ├─ pago
                                       ├─ cobranza
                                       ├─ activacion
                                       └─ campana
```

Nota: el usuario final solo interactúa con el frontend. Los microservicios (por ejemplo, auth) exponen APIs sin interfaz y deben consumirse a través del gateway en http://localhost:8080; no se accede a ellos directamente por navegador.

## Tecnologías

- **Backend:** Node.js 22, Express 4
- **Base de Datos:** PostgreSQL 16
- **Frontend:** React 19, Material-UI 7, React Router 7
- **Gateway:** Express con proxy a microservicios
- **Autenticación:** JWT (jsonwebtoken) + bcrypt
- **Migraciones:** node-pg-migrate
- **Contenedorización:** Docker, Docker Compose
- **Administración BD:** pgAdmin 4

## Estructura del Proyecto

```
creditos-financieros-pern-docker-microservicios/
├── auth/                    # Servicio de autenticación
├── gateway/                 # API Gateway (proxy)
├── frontend/                # Aplicación React
├── services/                # Microservicios de negocio
│   ├── simulacion/
│   ├── solicitud/
│   ├── evaluacion/
│   ├── firma/
│   ├── desembolso/
│   ├── pago/
│   ├── cobranza/
│   ├── activacion/
│   └── campana/
├── pgadmin/                 # Configuración de pgAdmin
├── scripts/                 # Scripts de verificación y testing
│   └── chequeos_auth/
├── docker-compose.yml       # Orquestación de servicios
├── GUIA_MICROSERVICIOS.md   # Guía completa para crear microservicios
└── README.md                # Este archivo
```

## Requisitos Previos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Puertos disponibles:** 4000, 5050, 5173, 5400-5410, 8080
- **RAM:** Mínimo 2GB disponible
- **Herramientas opcionales:**
  - `curl` o Postman (para probar APIs)
  - `jq` (para formatear respuestas JSON)
  - Node.js 18+ (solo para desarrollo local sin Docker)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone git@github.com:V1centeJ1menez/GRUPOPOGWARE-2025-PROYINF.git
cd GRUPOPOGWARE-2025-PROYINF/creditos-financieros-pern-docker-microservicios
```

### 2. Verificar Configuración (Opcional)

Los archivos `.env` ya están configurados. Puedes revisarlos si necesitas ajustar puertos o credenciales:

```bash
# Ver configuración de auth
cat auth/.env

# Ver configuración de gateway
cat gateway/.env

# Ver configuración de frontend
cat frontend/.env
```

### 3. Levantar el Sistema Completo

```bash
# Construir y levantar todos los servicios
docker compose up --build

# O en segundo plano (modo daemon)
docker compose up -d --build
```

**Tiempo estimado:** 3-5 minutos en la primera ejecución (descarga de imágenes y build).


### Verificación Manual en Navegador

1. **Frontend:** http://localhost:5173 - Debe cargar la página de inicio
2. **pgAdmin:** http://localhost:5050 - Login: `admin@admin.com` / `admin`
3. **Registrar usuario:** Click en "Register", llenar formulario, verificar que funcione
4. **Login:** Iniciar sesión y verificar redirección a dashboard

### Resultado Esperado

- Todos los servicios muestran estado "Up" en `docker compose ps`
- Health checks responden con `{"ok":true}` o `{"status":"ok"}`
- Script de test muestra checkmarks verdes sin errores
- Frontend permite registro, login y navegación
- pgAdmin se conecta a la base de datos auth_db

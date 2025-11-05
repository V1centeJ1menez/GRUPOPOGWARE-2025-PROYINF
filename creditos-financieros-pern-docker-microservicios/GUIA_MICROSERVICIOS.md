# Agregar un microservicio genérico (servicio*)

Objetivo: crear rápidamente un microservicio bajo `services/servicio*` y conectarlo al gateway y a su PostgreSQL. Debe quedar conectado sí o sí al docker-compose, a su base de datos y al gateway para que el proyecto funcione.

Sustituye `servicio*` por el nombre real del servicio (ej. `clientes`, `productos`). El puerto interno recomendado es `30xx` único por servicio.

## 1) Archivos mínimos en `services/servicio*`

- `.env` (conexión BD y puerto del servicio):
  - DB_HOST=`db_servicio*`
  - DB_PORT=`5432`
  - DB_USER=`postgres`
  - DB_PASSWORD=`postgres`
  - DB_NAME=`servicio*_db`
  - PORT=`30xx`
  - DATABASE_URL=`postgresql://postgres:postgres@db_servicio*:5432/servicio*_db`

- `.node-pg-migraterc.json` (migraciones):
  - host: `db_servicio*`, port: `5432`, database: `servicio*_db`, user: `postgres`, password: `postgres`, schema: `public`, migrations-table: `pgmigrations`

- `package.json` (scripts estándar):
  - scripts: `start: node index.js`, `migrate: node-pg-migrate up`, `rollback: node-pg-migrate down`
  - deps: `express`, `pg`, `dotenv`, `cors`, `node-pg-migrate`

- `Dockerfile` mínimo:
  - FROM node:22-alpine
  - WORKDIR /usr/src/app
  - COPY package*.json ./ && npm install
  - COPY . .
  - EXPOSE 30xx
  - CMD "sh -c 'npm run migrate && npm start'"

- `db.js` y `index.js`:
  - `db.js`: crea `Pool` de pg usando variables `.env` y una función de reintentos (pg_isready tarda los primeros segundos).
  - `index.js`: servidor Express, `app.get('/health')` debe responder 200, y define tus rutas del recurso.
  - Carpeta `migrations/` con al menos una migración inicial (por ejemplo, crear la tabla principal del servicio).

## 2) docker-compose.yml (conexión obligatoria)

Dentro de `services:` agrega la base de datos y el servicio. Los nombres deben coincidir con `.env` y migraciones.

```yaml
  db_servicio*:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: servicio*_db
    volumes:
      - db_servicio*_data:/var/lib/postgresql/data
    ports:
      - "54xx:5432"   # opcional, solo si necesitas acceso desde el host
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  servicio*:
    build: ./services/servicio*
    env_file:
      - ./services/servicio*/.env
    # ports:
    #   - "30xx:30xx" # opcional, normalmente se accede vía gateway
    depends_on:
      db_servicio*:
        condition: service_healthy
    restart: unless-stopped
```

En `volumes:` agrega:

```yaml
  db_servicio*_data:
```

Notas clave:
- `db_servicio*` debe ser el `DB_HOST` del servicio.
- Usa el puerto interno `30xx` solo para el contenedor; el acceso externo va por el gateway.
- El healthcheck evita errores de conexión temprana.

## 3) Conectar el gateway (obligatorio)

Agregar variable y ruta para que el gateway enrute las solicitudes.

- `gateway/.env`:
  - `SERVICIO*_URL=http://servicio*:30xx`

- `gateway/index.js`:
  - `app.use('/servicio*', proxyRequest(process.env.SERVICIO*_URL));`

Reconstruye el gateway si cambiaste rutas o variables.

## 4) Frontend (acceso)

El frontend debe llamar al gateway usando `REACT_APP_API_URL` (por defecto `http://localhost:8080`).

Ejemplos de endpoints desde el navegador o axios: `GET http://localhost:8080/servicio*/health`, `GET/POST http://localhost:8080/servicio*`.

## 5) pgAdmin (opcional)

Para ver la BD, agrega una entrada en `pgadmin/servers.json` con:
- Host: `db_servicio*`, Port: `5432`, MaintenanceDB: `postgres`, User/Password: `postgres`.
Si ya existía pgAdmin, elimina su volumen para reimportar `servers.json`.

## 6) Levantar y verificar

```bash
docker compose up -d db_servicio* servicio* gateway frontend
curl -s http://localhost:8080/servicio*/health
docker compose logs -f servicio*
```

Debe responder 200 en `/servicio*/health` a través del gateway. Si falla, revisa: nombres en compose vs `.env`, salud de `db_servicio*`, y la URL del gateway.

## Checklist mínimo

- Carpeta `services/servicio*/` con `.env`, `.node-pg-migraterc.json`, `package.json`, `Dockerfile`, `db.js`, `index.js`, `migrations/`.
- Servicios `db_servicio*` y `servicio*` agregados al `docker-compose.yml` y volumen `db_servicio*_data` definido.
- Gateway configurado: variable `SERVICIO*_URL` y ruta `/servicio*`.
- Health del servicio responde vía `http://localhost:8080/servicio*/health`.

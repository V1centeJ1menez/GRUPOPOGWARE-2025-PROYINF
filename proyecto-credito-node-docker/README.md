# Aplicación de Solicitud de Créditos con Node.js y Docker

Este proyecto es desarrollado por el grupo **POGWARE** para la asignatura **Proyecto de Informática 2025**. La aplicación utiliza **Node.js** con **Express**, **MySQL** como base de datos y se despliega mediante **Docker**.

## 📋 Estructura del Proyecto
```
.
├── src/
│   ├── controllers/    # Lógica de negocio
│   ├── models/         # Modelos de datos
│   ├── public/         # Archivos estáticos (CSS, imágenes)
│   └── views/          # Vistas HTML
├── db.js              # Configuración de base de datos
├── index.js           # Punto de entrada de la aplicación
├── docker-compose.yml # Configuración de servicios
└── Dockerfile         # Configuración de contenedor
```

## 🛠️ Tecnologías Principales
- **Backend:** Node.js, Express
- **Base de Datos:** MySQL
- **Frontend:** HTML5, CSS3, Bootstrap 5
- **Contenedorización:** Docker, Docker Compose

---

## ✅ Requisitos Previos

- Docker
- Docker Compose (v2.0+)
- Node.js (opcional, solo para desarrollo local)
- `curl` o cliente HTTP (para probar endpoints)
- **Windows:** Tener WSL2 instalado y habilitado en Docker Desktop:
  - Configuración → **Resources** → **WSL Integration** → Activar la integración con la distro correspondiente.

---

## 📂 Clonar el repositorio

```bash
git clone git@github.com:V1centeJ1menez/GRUPOPOGWARE-2025-PROYINF.git
cd GRUPOPOGWARE-2025-PROYINF
```

---

## ▶️ Levantar el proyecto con Docker

1. Asegúrate de estar en la carpeta raíz del proyecto.
2. Construir y levantar los contenedores:

```bash
docker compose up --build
```

3. Para detener y eliminar contenedores y volúmenes:

```bash
docker compose down -v
```

---

## 🔍 Comandos útiles

- Levantar sin reconstruir imágenes:
  ```bash
  docker compose up
  ```
- Levantar en segundo plano:
  ```bash
  docker compose up -d
  ```
- Ver estado de los servicios:
  ```bash
  docker compose ps
  ```
- Ver logs en tiempo real:
  ```bash
  docker compose logs -f
  ```
- Logs de un servicio específico:
  ```bash
  docker compose logs -f nombre_servicio
  ```
- Reiniciar un servicio:
  ```bash
  docker compose restart nombre_servicio
  ```
- Detener contenedores sin eliminar volúmenes:
  ```bash
  docker compose down
  ```

---

## ✅ Verificación

Una vez levantado el proyecto:

1. Visita `http://localhost:3000` en tu navegador
2. Deberías ver la página principal de la aplicación
3. Navega por las diferentes secciones:
   - Inicio
   - Información
   - Acerca de
   - Contacto

## 🔧 Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
DB_HOST=mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=creditos_db
PORT=3000
```

## 🚀 Desarrollo Local
Para desarrollo sin Docker:
```bash
npm install
npm run dev
```

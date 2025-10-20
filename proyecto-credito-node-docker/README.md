# Aplicación de Solicitud de Créditos con Node.js y Docker

Este proyecto es desarrollado por el grupo **POGWARE** para la asignatura **Proyecto de Informática 2025**. La aplicación utiliza **Node.js** con **Express**, **MySQL** como base de datos y se despliega mediante **Docker**.

## 📋 Estructura del Proyecto
```
.
├── server.js           # Punto de entrada (arranca src/app)
├── package.json
├── docker-compose.yml  # Configuración de servicios
├── Dockerfile          # Configuración de contenedor
├── README.md
└── src/
  ├── app.js           # Configuración de Express (mount routes, middlewares)
  ├── controllers/     # Lógica de rutas y controladores
  ├── services/        # Lógica de negocio reutilizable (ej. simulador)
  ├── models/          # Modelos de datos (clases, esquemas)
  ├── db/              # Conexión a la base de datos
  │   └── db.js
  ├── public/          # Archivos estáticos
  │   ├── css/
  │   ├── js/
  │   └── img/
  └── views/           # Vistas HTML
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
   - Simula tu credito! (lo que es codigo de Simulación y este luego lleva a la Solicitud (Todo esto en testing))
   - Información
   - Acerca de
   - Contacto


# Guía de Contribución

Este documento define las convenciones para la gestión de tareas en el repositorio, asegurando una organización clara y coherente durante el proyecto.

---

## ✅ Tipos de Tareas y Convenciones de Nombres

Cada issue debe comenzar con un prefijo que indique el tipo de tarea:

- **HU**: Historia de Usuario  
- **TT**: Tarea Técnica  
- **DOC**: Documentación  
- **TEST**: Pruebas  
- **BUG**: Corrección de errores  
- **DEV**: Desarrollo general  

### Ejemplo de nombres:
- `HU: Simulación de crédito`
- `TT: Configuración de CI/CD`
- `DOC: Actualizar README`
- `TEST: Pruebas unitarias para módulo X`
- `BUG: Error en cálculo de cuotas`
- `DEV: Refactorización del módulo de pagos`

---

## ✅ Uso de Etiquetas (Labels) para Estados

Cada issue debe tener al menos una etiqueta que indique su estado actual:

- **Por hacer**: Tarea pendiente por iniciar  
- **En proceso**: Tarea en desarrollo  
- **Bloqueado**: Tarea detenida por dependencia o problema  
- **Completado**: Tarea finalizada y validada  

### Ejemplo:
- Issue: `HU: Simulación de crédito`
- Labels: `Por hacer`, `Prioridad Alta`

---

## ✅ Buenas Prácticas

- **Crear issues claras y concisas**: Incluir descripción, criterios de aceptación y valor para el proyecto.
- **Actualizar el estado con etiquetas**: Cambiar la etiqueta según el progreso.
- **Asignar responsables**: Cada issue debe tener un responsable asignado.
- **Referenciar commits y PRs**: Usar el número de issue en los mensajes de commit y pull requests (ej. `Fix #12`).

---

## ✅ Ejemplo de Flujo

1. Crear issue: `HU: Simulación de crédito` con label `Por hacer`.
2. Asignar responsable y agregar detalles.
3. Cambiar label a `En proceso` cuando se inicie el trabajo.
4. Al finalizar, cambiar label a `Completado` y cerrar la issue.

---

## 📌 Documentación

Este documento debe mantenerse actualizado en el archivo `CONTRIBUTING.md` y en el Wiki del repositorio.

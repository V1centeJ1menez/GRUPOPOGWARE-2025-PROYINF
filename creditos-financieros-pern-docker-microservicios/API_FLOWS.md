# Flujo de comunicación Front → Back (resumen)

Este documento presenta, de forma breve y práctica, cómo se comunican el frontend y los servicios backend del proyecto (auth, solicitud, simulación, evaluación). Incluye endpoints principales, headers, payloads y notas sobre los cambios implementados.

**Ubicaciones relevantes**
- Servicio auth: `auth/` (endpoints: `POST /api/auth/login`, `POST /api/auth/register`).
- Servicio solicitud: `services/solicitud/` (endpoints: `POST /api/solicitud`, `GET /api/solicitud`).
- Servicio evaluación: `services/evaluacion/` (endpoints: `POST /api/evaluar`, `POST /api/simular`).
- Frontend: `frontend/src/features/...` (componentes y hooks de simulación y solicitud).

---

**1) Autenticación (auth)**

- Endpoints principales:
  - `POST /api/auth/register` — cuerpo: `{ username, email, password }`.
  - `POST /api/auth/login` — cuerpo: `{ username, password }`. Respuesta: `{ token, user }`.

- Token JWT: al autenticar, el backend devuelve `token` (JWT) que contiene `id`, `username`, `role`.
- Uso en frontend: añadir header `Authorization: Bearer <token>` en llamadas protegidas.

Ejemplo de login (curl):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"secreto"}'
```

Promover usuario a admin (opciones):
- SQL directo: `UPDATE users SET role='admin' WHERE id = <user_id>;` (usar psql o pgAdmin).
- Re-generar token en frontend tras cambio de rol para que el payload actualice `role`.

---

**2) Flujo de Simulación (usuario anónimo)**

- Objetivo: permitir que un usuario sin registro haga una simulación preliminar sin generar una `solicitud` formal.
- Endpoint público en evaluación: `POST /api/simular` (no requiere JWT) — devuelve un resultado preliminar y score.
- En la base de datos local/front: las simulaciones anónimas se guardan en `localStorage` y se muestran como `SIMULADA` (no `APROBADA`).

Frontend: comportamiento implementado
- `frontend/src/features/simulacion/hooks/useSimulacionAnon.js`: guarda simulación en historial local y marca `resultado: 'simulada'`.
- CTA cambiado: en la vista de simulación anónima el botón es `Solicitar tras registro` (en vez de presentar aprobada/rechazada).

Ejemplo curl (simular públicamente):
```bash
curl -X POST http://localhost:3004/api/simular \
  -H "Content-Type: application/json" \
  -d '{"monto":2000000, "plazo":24, "ingresos":500000}'
```

---

**3) Crear y enviar una Solicitud (usuario autenticado)**

- Endpoint frontend → servicio de solicitud: `POST /api/solicitud`.
- Payload típico:
```json
{
  "clienteId": 12,
  "monto": 2000000,
  "plazo": 24,
  "origen": "simulacion", // o 'web'
  "estado": "enviada" // o 'borrador'
}
```
- Si el `estado === 'enviada'`, el servicio de `solicitud` (controller) realiza, de forma síncrona en este prototipo, una llamada HTTP al servicio `evaluacion` para obtener una evaluación inmediata.
- La llamada incluye el header `Authorization` (se reenvía el token del usuario) y el body con los datos de la solicitud.

Ejemplo curl (crear solicitud enviada):
```bash
curl -X POST http://localhost:3002/api/solicitud \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"monto":2000000,"plazo":24,"origen":"simulacion","estado":"enviada"}'
```

Respuesta esperada: objeto `solicitud` que incluye (ahora) la última `evaluacion` asociada:
```json
{
  "id": 123,
  "monto": 2000000,
  "plazo": 24,
  "estado": "enviada",
  "origen": "simulacion",
  "evaluacion": { "decision": "aprobada", "score": 710, "created_at": "..." }
}
```

Notas de diseño
- Actualmente la integración `solicitud -> evaluacion` es síncrona (HTTP). Para producción recomendamos asíncronizar (cola, retries) y exponer estado `en_revision`.

---

**4) Evaluación (service)**

- Endpoints principales en `services/evaluacion`:
  - `POST /api/evaluar` — recibe payload de solicitud y (si viene) `solicitudId` y genera una evaluación persistente en DB.
  - `POST /api/simular` — endpoint público para simulaciones, NO persiste como `evaluación` formal para una `solicitud`.

Comportamiento implementado
- Si la llamada a `evaluar` NO tiene `solicitudId`, se considera una simulación y la respuesta tendrá `decision: 'simulada'` (no `aprobada`).
- Sólo evaluaciones con `solicitudId` pueden terminar con `decision: 'aprobada'` o `decision: 'rechazada'` y generarán notificaciones/correos si aplica.

Ejemplo curl (evaluar solicitud):
```bash
curl -X POST http://localhost:3004/api/evaluar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"solicitudId":123,"monto":2000000,"plazo":24,"clienteId":12}'
```

---

**5) Headers y seguridad (práctica actual)**

- Frontend debe enviar siempre el header `Authorization: Bearer <JWT>` en endpoints que requieran autenticación (crear solicitud, ver historial, etc.).
- Nota: actualmente algunos servicios decodifican tokens manualmente; mejorar usando `jwt.verify` con `process.env.JWT_SECRET` se recomienda (pendiente en la lista de tareas).

---

**6) Cambios y mejoras que se implementaron en esta sesión**

- Evitar auto-aprobar simulaciones anónimas: ahora las simulaciones públicas se marcan `simulada` y no se muestran como `aprobada` en UI/historial.
- `services/evaluacion` expone `POST /api/simular` para simulaciones públicas.
- Frontend: componentes de simulación muestran badge `SIMULADA` y CTA `Solicitar tras registro`.
- `services/solicitud/controllers/solicitudController.js` actualizado para devolver la última `evaluacion` en las rutas de listado, y `frontend/src/app/pages/Dashboard.js` muestra esa evaluación.
- Nueva página UI de ejemplo: `frontend/src/features/solicitud/pages/SolicitudesEstado.js` (mock cards).

---

**7) Ejemplos rápidos (resumen de curl)**

- Login y uso de token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"juan","password":"secreto"}' | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/solicitud
```

- Simular públicamente (sin token):
```bash
curl -X POST http://localhost:3004/api/simular -H "Content-Type: application/json" -d '{"monto":1500000,"plazo":12}'
```

---

**8) Próximos pasos recomendados**

- Migrar verificación de JWT en servicios críticos (`evaluacion`, `solicitud`) a middleware con `jwt.verify`.
- Implementar scoring prototipo con pruebas unitarias y exponer razones en `evaluacion.razones`.
- Considerar asincronizar la evaluación (cola) para carga y resiliencia.

---

Si querés, puedo:
- agregar ejemplos concretos de payloads en `services/solicitud/README.md` (curl + estructura JSON),
- implementar el middleware JWT en `services/evaluacion` ahora,
- o añadir la ruta al `App.js` para que `SolicitudesEstado` sea accesible desde el frontend.

Archivo creado automáticamente desde los cambios recientes en el repo.

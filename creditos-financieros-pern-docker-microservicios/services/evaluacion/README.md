# Servicio Evaluación

## Objetivo
Evalúa solicitudes de crédito y registra simulaciones preliminares. A partir de ahora:
- SOLO las evaluaciones con `solicitudId` pueden terminar en `aprobada` o `rechazada`.
- Las simulaciones sin solicitud (usuario aún no registrado o no ha enviado solicitud) se guardan como `decision = 'simulada'` y no generan aprobación inmediata.

## Endpoints

### POST `/api/simular`
Simulación pública SIN token. No persiste en BD.
Body ejemplo:
```json
{ "monto": 5000000, "plazo": 24 }
```
Respuesta contiene: `score`, `rangoDecision` (aprobada/en_revision/rechazada COMO referencia, NO es aprobación), fechas de pago estimadas y mensaje orientando a registro.

### POST `/api/evaluar` (requiere token)
Evalúa:
1. Simulación autenticada (sin `solicitudId`) -> registra fila en `evaluaciones` con `decision = 'simulada'`.
2. Evaluación formal (con `solicitudId`) -> aplica reglas y puede devolver `aprobada`, `en_revision` o `rechazada`.

Campos relevantes en body:
```json
{
  "solicitudId": 123,   // opcional: si presente es evaluación formal
  "monto": 5000000,
  "plazo": 24,
  "tasaBase": 0.015,
  "cae": 0.018,
  "cuotaMensual": 250000
}
```

### GET `/api/notificaciones`
Lista notificaciones del usuario autenticado.

### PATCH `/api/notificaciones/:id/leida`
Marca notificación como leída.

### GET `/api/evaluaciones/ultima`
Última evaluación (simulada o formal) del usuario.

## Flujo sugerido Frontend (usuario no registrado)
1. Usuario ingresa monto/plazo y llama a `/api/simular` (sin autenticación).
2. Se muestra score y condiciones preliminares + CTA: Registrarse.
3. Tras registro/login, crea una Solicitud (servicio `solicitud`). Obtiene `solicitudId`.
4. Llama a `/api/evaluar` pasando `solicitudId` para evaluación formal.
5. Según `decision` -> interfaz guía a pasos siguientes (firma, etc.).

## Razones del cambio
Evitar que una simulación sea tratada como aprobación definitiva y garantizar que solo solicitudes formales avancen a proceso contractual.

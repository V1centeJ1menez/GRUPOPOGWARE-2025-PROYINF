# Simulaciones (Flujo Anónimo)

Este módulo permite realizar simulaciones preliminares SIN registro. Cambios recientes:

- Las simulaciones locales NO deben tener estado (no son solicitudes ni evaluaciones formales). Son objetos de cálculo separados.
- El botón para continuar dice `Solicitar tras registro`: la simulación es únicamente un insumo para crear una Solicitud formal después de autenticarse.
- El historial local guarda la simulación tal cual (monto, plazo, resultados numéricos) sin adjuntar `resultado`/`estado`.

## Pasos del usuario
1. Ingresa monto y plazo y guarda simulación local.
2. Si desea avanzar hace clic en "Solicitar tras registro" y se redirige a registro/login.
3. Tras autenticarse, el frontend debe crear una Solicitud real y luego llamar al servicio de Evaluación (`/api/evaluar` con `solicitudId`).

## Razón del cambio
Evitar confusión: una simulación matemática NO equivale a una aprobación de riesgo. Sólo evaluaciones formales asociadas a una Solicitud pueden ser aprobadas/rechazadas.

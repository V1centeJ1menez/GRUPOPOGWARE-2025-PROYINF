// Valores por defecto de respaldo (fallback) usados solo si la API no responde.
// La configuración real proviene del backend vía `useSimulacionConfig`.
export const DEFAULT_CONFIG = {
  TASA_BASE_ANUAL: 0.18,
  GASTOS_OPERACIONALES_PORCENTAJE: 0.02,
  COMISION_APERTURA: 0.015,
  MONTO_MIN: 500000,
  MONTO_MAX: 10000000,
  PLAZO_MIN: 6,
  PLAZO_MAX: 48,
};

import { useEffect, useRef, useState } from "react";
import { obtenerConfiguracion } from "../services/simulacionApi";
import { DEFAULT_CONFIG } from "../constants";

// Cache simple en memoria para evitar múltiples requests en la misma sesión
let cachedConfig = null;

export default function useSimulacionConfig() {
  const [config, setConfig] = useState(cachedConfig || DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cachedConfig) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const resp = await obtenerConfiguracion();
        const cfg = {
          TASA_BASE_ANUAL: resp.data.tasaBaseAnual,
          GASTOS_OPERACIONALES_PORCENTAJE: resp.data.gastosOperacionalesPorcentaje,
          COMISION_APERTURA: resp.data.comisionApertura,
          MONTO_MIN: resp.data.montoMinimo,
          MONTO_MAX: resp.data.montoMaximo,
          PLAZO_MIN: resp.data.plazoMinimo,
          PLAZO_MAX: resp.data.plazoMaximo,
        };
        cachedConfig = cfg;
        if (mounted.current) setConfig(cfg);
      } catch (e) {
        setError(e);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, []);

  return { CONFIG: config, loading, error };
}

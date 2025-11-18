import { useCallback, useEffect, useState } from "react";
import useSimulacionConfig from "./useSimulacionConfig";
import { calcularScoringInicial } from "../utils/scoring";
import { addSimulation, getHistory, deleteFromHistory, setPendingSimulation } from "../utils/localHistory";

export default function useSimulacionAnon() {
  const { CONFIG } = useSimulacionConfig();
  const [monto, setMonto] = useState(5000000);
  const [plazo, setPlazo] = useState(24);
  const [ingresoMensual, setIngresoMensual] = useState(null);

  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [mostrarAmortizacion, setMostrarAmortizacion] = useState(false);

  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [success, setSuccess] = useState(null);

  // (se mueve más abajo para evitar no-use-before-define)

  const calcularVistaPrevia = useCallback((mEntrada, pEntrada, ingreso = ingresoMensual) => {
    const m = Number(mEntrada);
    const p = Number(pEntrada);

    if (!m || !p || m <= 0 || p <= 0) {
      setVistaPrevia(null);
      return;
    }

    const { ajuste, score } = calcularScoringInicial({ monto: m, plazo: p, ingresoMensual: ingreso ?? undefined });
    const tasaAnual = Math.max(0.05, Math.min(0.45, CONFIG.TASA_BASE_ANUAL + ajuste));

    const gastosOp = Math.round(m * CONFIG.GASTOS_OPERACIONALES_PORCENTAJE);
    const comisionAp = Math.round(m * CONFIG.COMISION_APERTURA);
    const montoLiq = Math.round(m - gastosOp - comisionAp);

    const i = tasaAnual / 12;
    const cuota = Math.round(m * i / (1 - Math.pow(1 + i, -p)));

    const montoTot = Math.round(cuota * p);
    const intereses = Math.round(montoTot - m);
    const cae = parseFloat((tasaAnual + ((gastosOp + comisionAp) / m)).toFixed(6));

    setVistaPrevia({
      monto: m,
      plazo: p,
      tasaBase: tasaAnual,
      cae,
      cuotaMensual: cuota,
      montoTotal: montoTot,
      montoLiquido: montoLiq,
      interesesTotales: intereses,
      gastosOperacionales: gastosOp,
      comisionApertura: comisionAp,
      scoreInicial: score,
    });
  }, [CONFIG, ingresoMensual]);

  useEffect(() => {
    calcularVistaPrevia(monto, plazo);
  }, [monto, plazo, calcularVistaPrevia]);

  const cargarHistorialLocal = useCallback((limit = null) => {
    setLoadingHistorial(true);
    const items = getHistory(limit);
    setHistorial(items);
    setLoadingHistorial(false);
  }, []);

  // Cargar historial al montar
  useEffect(() => {
    cargarHistorialLocal(4);
  }, [cargarHistorialLocal]);

  const handleGuardarLocal = useCallback(() => {
    if (!vistaPrevia) return;
    const saved = addSimulation(vistaPrevia);
    // Sin notificaciones en modo anónimo al guardar
    cargarHistorialLocal(4);
    return saved;
  }, [vistaPrevia, cargarHistorialLocal]);

  const handleEliminarLocal = useCallback((id) => {
    deleteFromHistory(id);
    cargarHistorialLocal(4);
  }, [cargarHistorialLocal]);

  const marcarParaContinuarTrasLogin = useCallback(() => {
    if (!vistaPrevia) return null;
    const saved = setPendingSimulation(vistaPrevia);
    return saved;
  }, [vistaPrevia]);

  return {
    CONFIG,
    monto, setMonto,
    plazo, setPlazo,
    ingresoMensual, setIngresoMensual,
    vistaPrevia,
    mostrarAmortizacion, setMostrarAmortizacion,
    historial, loadingHistorial,
    success,
    calcularVistaPrevia,
    handleGuardarLocal,
    handleEliminarLocal,
    cargarHistorialLocal,
    marcarParaContinuarTrasLogin,
  };
}

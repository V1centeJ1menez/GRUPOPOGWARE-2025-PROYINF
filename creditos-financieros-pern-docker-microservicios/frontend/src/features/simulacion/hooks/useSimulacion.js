import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearSimulacion, obtenerHistorial, eliminarSimulacion } from "../services/simulacionApi";
import useSimulacionConfig from "./useSimulacionConfig";

export default function useSimulacion(user) {
  const navigate = useNavigate();
  const { CONFIG } = useSimulacionConfig();

  const [monto, setMonto] = useState(5000000);
  const [plazo, setPlazo] = useState(24);
  const [simulacion, setSimulacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [mostrarAmortizacion, setMostrarAmortizacion] = useState(false);

  const calcularVistaPrevia = useCallback((montoInput, plazoInput) => {
    const m = Number(montoInput);
    const p = Number(plazoInput);

    if (!m || !p || m <= 0 || p <= 0) {
      setVistaPrevia(null);
      return;
    }

    const gastosOp = Math.round(m * CONFIG.GASTOS_OPERACIONALES_PORCENTAJE);
    const comisionAp = Math.round(m * CONFIG.COMISION_APERTURA);
    const montoLiq = Math.round(m - gastosOp - comisionAp);

    const i = CONFIG.TASA_BASE_ANUAL / 12;
    const cuota = Math.round(m * i / (1 - Math.pow(1 + i, -p)));

    const montoTot = Math.round(cuota * p);
    const intereses = Math.round(montoTot - m);
    const cae = parseFloat((CONFIG.TASA_BASE_ANUAL + ((gastosOp + comisionAp) / m)).toFixed(6));
    const resultado = m >= CONFIG.MONTO_MIN && p >= CONFIG.PLAZO_MIN && p <= CONFIG.PLAZO_MAX ? "aprobado" : "rechazado";

    setVistaPrevia({
      monto: m,
      plazo: p,
      tasaBase: CONFIG.TASA_BASE_ANUAL,
      cae,
      cuotaMensual: cuota,
      montoTotal: montoTot,
      montoLiquido: montoLiq,
      interesesTotales: intereses,
      gastosOperacionales: gastosOp,
      comisionApertura: comisionAp,
      resultado,
    });
  }, [CONFIG]);

  useEffect(() => {
    calcularVistaPrevia(monto, plazo);
  }, [monto, plazo, calcularVistaPrevia]);

  const cargarHistorial = useCallback(async (limit = null) => {
    if (!user?.token) return;
    setLoadingHistorial(true);
    try {
      const response = await obtenerHistorial(user.token, limit);
      setHistorial(response.data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setLoadingHistorial(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      cargarHistorial(4);
    }
  }, [user, navigate, cargarHistorial]);

  const handleSimular = useCallback(async (data) => {
    setError(null);
    setSuccess(null);
    setSimulacion(null);
    setLoading(true);

    try {
      const response = await crearSimulacion(data, user.token);
      setSimulacion(response.data);
      setSuccess("✅ Simulación guardada exitosamente en tu historial");
      cargarHistorial(mostrarTodoHistorial ? null : 4);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error al simular:", err);
      setError(err.response?.data?.error || "Error al procesar la simulación");
    } finally {
      setLoading(false);
    }
  }, [user?.token, cargarHistorial, mostrarTodoHistorial]);

  const handleLimpiar = useCallback(() => {
    setMonto(5000000);
    setPlazo(24);
    setSimulacion(null);
    setError(null);
    setSuccess(null);
  }, []);

  const handleEliminar = useCallback(async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta simulación?")) return;
    try {
      await eliminarSimulacion(id, user.token);
      cargarHistorial(mostrarTodoHistorial ? null : 4);
      setSimulacion((s) => (s && s.id === id ? null : s));
      setSuccess("Simulación eliminada correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar la simulación");
    }
  }, [user?.token, cargarHistorial, mostrarTodoHistorial]);

  const handleVerMas = useCallback(() => {
    if (mostrarTodoHistorial) {
      cargarHistorial(4);
      setMostrarTodoHistorial(false);
    } else {
      cargarHistorial(null);
      setMostrarTodoHistorial(true);
    }
  }, [mostrarTodoHistorial, cargarHistorial]);

  const handleSeleccionarSimulacion = useCallback((sim) => {
    setSimulacion(sim);
    setMonto(sim.monto);
    setPlazo(sim.plazo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    monto,
    setMonto,
    plazo,
    setPlazo,
    simulacion,
    loading,
    error,
    success,
    historial,
    mostrarTodoHistorial,
    loadingHistorial,
    vistaPrevia,
    mostrarAmortizacion,
    setMostrarAmortizacion,
    calcularVistaPrevia,
    handleSimular,
    handleLimpiar,
    handleEliminar,
    handleVerMas,
    handleSeleccionarSimulacion,
    cargarHistorial,
    CONFIG,
  };
}

// utilidades para la simulación: formatos y generación de tabla de amortización
export const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Math.round(n));
};

export const formatPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(2)}%`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generarTablaAmortizacion = (sim) => {
  if (!sim) return [];
  const tabla = [];
  let saldo = Number(sim.monto);
  const i = Number(sim.tasaBase) / 12;
  const cuota = Math.round(Number(sim.cuotaMensual));

  for (let mes = 1; mes <= Number(sim.plazo); mes++) {
    let interes = Math.round(saldo * i);
    let capital = cuota - interes;
    if (mes === Number(sim.plazo)) {
      capital = saldo;
      interes = Math.max(0, cuota - capital);
    }
    saldo = Math.max(0, Math.round(saldo - capital));

    tabla.push({ mes, cuota, interes, capital, saldo });
  }

  return tabla;
};

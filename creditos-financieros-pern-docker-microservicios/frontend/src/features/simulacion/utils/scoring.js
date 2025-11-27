// Scoring inicial simple para ajustar tasa
// Devuelve { score: 300-850 aprox, ajuste: delta tasa anual en puntos (ej: +0.02) }

export function calcularScoringInicial({ monto, plazo, ingresoMensual = null }) {
  // Heurística simple basada en carga mensual estimada vs ingreso
  // Si no hay ingreso, estimamos conservador
  const cargaMensualEstimada = monto * (0.18 / 12) / (1 - Math.pow(1 + 0.18 / 12, -plazo));
  const ingreso = ingresoMensual ?? Math.max(500000, Math.min(1500000, monto / plazo * 4));
  const ratio = cargaMensualEstimada / ingreso; // menor es mejor

  let score = 650;
  if (ratio < 0.15) score = 780;
  else if (ratio < 0.25) score = 720;
  else if (ratio < 0.35) score = 680;
  else if (ratio < 0.45) score = 630;
  else score = 580;

  // Ajuste de tasa anual basado en score
  // bandas: [≥760:-0.02], [700-759:-0.01], [640-699:+0.0], [580-639:+0.01], [<580:+0.03]
  let ajuste = 0.0;
  if (score >= 760) ajuste = -0.02;
  else if (score >= 700) ajuste = -0.01;
  else if (score >= 640) ajuste = 0.0;
  else if (score >= 580) ajuste = 0.01;
  else ajuste = 0.03;

  return { score, ajuste, ratio };
}

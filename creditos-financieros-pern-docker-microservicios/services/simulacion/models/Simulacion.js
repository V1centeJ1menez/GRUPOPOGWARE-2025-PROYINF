// Modelo de Simulación para microservicio
// Puedes modificar los campos según los requisitos del negocio

class Simulacion {
  constructor({ 
    monto, 
    plazo, 
    tasaBase,
    cae,
    cuotaMensual,
    montoTotal,
    montoLiquido,
    interesesTotales,
    gastosOperacionales,
    comisionApertura,
    resultado, 
    fecha 
  }) {
    this.monto = monto;                           // Monto solicitado
    this.plazo = plazo;                           // Plazo en meses
    this.tasaBase = tasaBase;                     // Tasa base anual
    this.cae = cae;                               // Carga Anual Equivalente
    this.cuotaMensual = cuotaMensual;             // Cuota mensual
    this.montoTotal = montoTotal;                 // Monto total a pagar
    this.montoLiquido = montoLiquido;             // Monto líquido (sin gastos)
    this.interesesTotales = interesesTotales;     // Intereses totales
    this.gastosOperacionales = gastosOperacionales; // Gastos operacionales
    this.comisionApertura = comisionApertura;     // Comisión de apertura
    this.resultado = resultado;                   // Estado: 'aprobado' o 'rechazado'
    this.fecha = fecha || new Date();             // Fecha de la simulación
  }
}

module.exports = Simulacion;


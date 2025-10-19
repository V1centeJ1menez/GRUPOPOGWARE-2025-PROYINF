class Simulador {
  constructor(monto, cuotas, mespago, diapago, seguro) {
    this.factorinteres = 0.05;
    this.monto = monto;
    this.cuotas = cuotas;
    this.mespago = mespago;
    this.diapago = diapago;
    this.seguro = seguro;

    this.interesmensual = 0;
    this.total = 0;
    this.valorcuota = 0;
  }

  // Getters
  getmonto() {
    return this.monto;
  }
  getcuotas() {
    return this.cuotas;
  }
  getmespago() {
    return this.mespago;
  }
  getdiapago() {
    return this.diapago;
  }
  getseguro() {
    return this.seguro;
  }
  getinteresmensual() {
    return this.interesmensual;
  }
  getfactorinteres() {
    return this.factorinteres;
  }
  gettotal() {
    return this.total;
  }
  getvalorcuota() {
    return this.valorcuota;
  }

  // Setters
  setmonto(monto) {
    this.monto = monto;
  }
  setcuotas(cuotas) {
    this.cuotas = cuotas;
  }
  setmespago(mespago) {
    if (mespago > 12 || mespago < 1) {
      throw new Error("del 1-12");
    } else {
      this.mespago = mespago;
    }
  }
  setdiapago(diapago) {
    const m = this.mespago;
    if ([1, 3, 5, 7, 8, 10, 12].includes(m)) {
      if (diapago > 31 || diapago < 1) {
        throw new Error("Este mes tiene 31 dias");
      } else {
        this.diapago = diapago;
      }
    } else if (m === 2) {
      if (diapago > 29 || diapago < 1) {
        throw new Error("Este mes tiene 29 dias");
      } else {
        this.diapago = diapago;
      }
    } else {
      if (diapago > 30 || diapago < 1) {
        throw new Error("Este mes tiene 30 dias");
      } else {
        this.diapago = diapago;
      }
    }
  }
  setseguro(seguro) {
    this.seguro = seguro;
  }

  simular() {
    this.interesmensual = this.factorinteres * this.cuotas;
    this.valorcuota = this.monto / this.cuotas + this.monto * this.interesmensual;
    this.total = this.valorcuota * this.cuotas;
  }

  simularConParametros(monto, cuotas, mespago, diapago, seguro) {
    this.factorinteres = 0.05;
    this.monto = monto;
    this.cuotas = cuotas;
    this.mespago = mespago;
    this.diapago = diapago;
    this.seguro = seguro;

    this.interesmensual = this.factorinteres * this.cuotas;
    this.valorcuota = this.monto / this.cuotas + this.monto * this.interesmensual;
    this.total = this.valorcuota * this.cuotas;
  }
}
module.exports = Simulador; 
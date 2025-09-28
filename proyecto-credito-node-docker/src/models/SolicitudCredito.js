// Ejemplo de modelo para solicitudes de crédito
class SolicitudCredito {
    constructor(id, cliente, monto, plazo, tasaInteres) {
        this.id = id;
        this.cliente = cliente;
        this.monto = monto;
        this.plazo = plazo;
        this.tasaInteres = tasaInteres;
    }

    calcularCuotaMensual() {
        const tasaMensual = this.tasaInteres / 12 / 100;
        const cuota = (this.monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -this.plazo));
        return cuota.toFixed(2);
    }
}

module.exports = SolicitudCredito;
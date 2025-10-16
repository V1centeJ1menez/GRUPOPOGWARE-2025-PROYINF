const express = require('express');
const router = express.Router();
const path = require('path');
const Simulador = require('../yavascrip/simulador'); 

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/simulador.html'));
});

router.post('/simular', (req, res) => {
  const { monto, cuotas, mespago, diapago, seguro } = req.body;

  const sim = new Simulador(monto, cuotas, mespago, diapago, seguro);
  sim.simular();

  res.json(sim); //retorna objeto con valores
});

module.exports = router;

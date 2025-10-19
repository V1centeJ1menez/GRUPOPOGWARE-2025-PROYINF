const express = require('express');
const router = express.Router();
const path = require('path');

// Modelo simple (si existe un modelo real, importarlo aquí)
// const SolicitudCredito = require('../models/SolicitudCredito');

// In-memory store de solicitudes (prototipo)
const solicitudes = {};
let nextId = 1;
const queue = [];

// Worker simple que procesa la cola en background
function processQueue() {
	if (queue.length === 0) return;
	const item = queue.shift();
	const { id } = item;
	const s = solicitudes[id];
	if (!s) return setImmediate(processQueue);

	s.status = 'evaluando';
	// Simular llamada a motor de scoring externo
	setTimeout(() => {
		const monto = s.monto;
		const plazo = s.plazo;
		const score = Math.max(1, Math.round(100 - (monto / 1000) - (plazo / 2)));
		const resultado = { score };
		if (score >= 50) {
			resultado.aprobado = true;
			resultado.razon = 'Cumple reglas básicas';
			s.status = 'aprobado';
		} else {
			resultado.aprobado = false;
			resultado.razon = 'Puntaje insuficiente';
			s.status = 'rechazado';
		}
		s.evaluacion = resultado;
		setImmediate(processQueue);
	}, 3000);
}

// Mostrar formulario
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/solicitud.html'));
});

// Crear solicitud (espera JSON)
router.post('/crear', (req, res) => {
	const { cliente, monto, plazo, tasaInteres } = req.body || {};
	if (!cliente || !monto || !plazo) {
		return res.status(400).json({ error: 'Faltan campos requeridos: cliente, monto, plazo' });
	}

	const id = nextId++;
	const solicitud = {
		id,
		cliente,
		monto: parseFloat(monto),
		plazo: parseInt(plazo, 10),
		tasaInteres: parseFloat(tasaInteres || 12),
		status: 'pendiente',
		evaluacion: null,
		creadoEn: new Date()
	};

	solicitudes[id] = solicitud;
	queue.push({ id });
	setImmediate(processQueue);

	res.json({ id, status: solicitud.status, message: 'Solicitud recibida y en cola de evaluación' });
});

// Consultar estado/evaluación
router.get('/status/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const s = solicitudes[id];
	if (!s) return res.status(404).json({ error: 'Solicitud no encontrada' });
	res.json({ id: s.id, status: s.status, evaluacion: s.evaluacion });
});

module.exports = router;


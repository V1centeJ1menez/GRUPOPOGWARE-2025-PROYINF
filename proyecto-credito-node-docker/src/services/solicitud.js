document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('solicitudForm');
  const resultado = document.getElementById('resultadoSolicitud');

  if (!form) return;

  // Prefill desde query params (si viene de simulador)
  const params = new URLSearchParams(window.location.search);
  if (params.has('monto')) document.getElementById('monto').value = params.get('monto');
  if (params.has('plazo')) document.getElementById('plazo').value = params.get('plazo');
  if (params.has('tasaInteres')) document.getElementById('tasaInteres').value = params.get('tasaInteres');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      cliente: document.getElementById('cliente').value,
      monto: parseFloat(document.getElementById('monto').value),
      plazo: parseInt(document.getElementById('plazo').value, 10),
      tasaInteres: parseFloat(document.getElementById('tasaInteres').value)
    };

    resultado.innerHTML = '<div class="alert alert-info">Enviando solicitud...</div>';

    try {
      const res = await fetch('/solicitar/crear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();

      if (res.ok) {
        resultado.innerHTML = `\n          <div class="alert alert-success">\n            <h5>Solicitud en proceso</h5>\n            <p>ID: <strong>${json.id}</strong></p>\n            <p>Estado inicial: <strong>${json.status}</strong></p>\n            <p>Consultar estado en unos segundos...</p>\n          </div>`;
        form.reset();
        // Poll de estado
        const id = json.id;
        const poll = setInterval(async () => {
          const sres = await fetch(`/solicitar/status/${id}`);
          const sjson = await sres.json();
          if (sjson.status && sjson.status !== 'pendiente' && sjson.status !== 'evaluando') {
            clearInterval(poll);
            resultado.innerHTML = `\n              <div class="alert alert-primary">\n                <h5>Evaluaci\u00f3n finalizada</h5>\n                <p>ID: <strong>${sjson.id}</strong></p>\n                <p>Estado: <strong>${sjson.status}</strong></p>\n                <pre>${JSON.stringify(sjson.evaluacion, null, 2)}</pre>\n              </div>`;
          }
        }, 2000);
      } else {
        resultado.innerHTML = `<div class="alert alert-danger">${json.error || 'Error al enviar'}</div>`;
      }
    } catch (err) {
      resultado.innerHTML = `<div class="alert alert-danger">Error de conexión</div>`;
    }
  });
});

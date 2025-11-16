// Utilidades para historial local (cookie + localStorage)
// Estrategia:
// - Cookie "sim_hist_idx": JSON con { ids: string[], lastPendingId?: string }
// - localStorage items "sim_hist:{id}": simulación completa
// - localStorage key "pending_simulation": simulación a continuar tras registro

const COOKIE_NAME = "sim_hist_idx";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 días

function setCookie(name, value, maxAgeSec = COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}`;
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function readIndex() {
  try {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) return { ids: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.ids)) return { ids: [] };
    return parsed;
  } catch {
    return { ids: [] };
  }
}

function writeIndex(idx) {
  setCookie(COOKIE_NAME, JSON.stringify(idx));
}

function saveItem(id, data) {
  localStorage.setItem(`sim_hist:${id}`, JSON.stringify(data));
}

function loadItem(id) {
  const raw = localStorage.getItem(`sim_hist:${id}`);
  return raw ? JSON.parse(raw) : null;
}

function removeItem(id) {
  localStorage.removeItem(`sim_hist:${id}`);
}

export function addSimulation(sim) {
  const id = sim.id || crypto.randomUUID();
  const fecha = sim.fecha || new Date().toISOString();
  const full = { ...sim, id, fecha };
  saveItem(id, full);
  const idx = readIndex();
  const ids = [id, ...idx.ids.filter((x) => x !== id)].slice(0, 50); // conservar últimas 50
  writeIndex({ ...idx, ids });
  return full;
}

export function getHistory(limit = null) {
  const idx = readIndex();
  const items = idx.ids.map(loadItem).filter(Boolean);
  return limit ? items.slice(0, limit) : items;
}

export function deleteFromHistory(id) {
  const idx = readIndex();
  writeIndex({ ...idx, ids: idx.ids.filter((x) => x !== id), lastPendingId: idx.lastPendingId === id ? undefined : idx.lastPendingId });
  removeItem(id);
}

export function clearHistory() {
  const idx = readIndex();
  idx.ids.forEach(removeItem);
  writeIndex({ ids: [] });
}

export function setPendingSimulation(sim) {
  const saved = addSimulation(sim);
  localStorage.setItem("pending_simulation", JSON.stringify(saved));
  const idx = readIndex();
  writeIndex({ ...idx, lastPendingId: saved.id });
  return saved;
}

export function getPendingSimulation() {
  const raw = localStorage.getItem("pending_simulation");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function popPendingSimulation() {
  const sim = getPendingSimulation();
  localStorage.removeItem("pending_simulation");
  const idx = readIndex();
  if (idx.lastPendingId) writeIndex({ ...idx, lastPendingId: undefined });
  return sim;
}

const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const host = process.env.DB_HOST || process.env.PGHOST || 'db_solicitud';
const port = process.env.DB_PORT || process.env.PGPORT || 5432;
const user = process.env.DB_USER || process.env.PGUSER || 'postgres';
const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres';
const database = process.env.DB_NAME || process.env.PGDATABASE || process.env.POSTGRES_DB || 'solicitud_db';

const maxRetries = 30;
const delayMs = 2000;

async function waitForDb() {
  let attempts = 0;
  while (attempts < maxRetries) {
    attempts += 1;
    try {
      const client = new Client({ host, port, user, password, database, connectionTimeoutMillis: 2000 });
      await client.connect();
      await client.end();
      console.log(`DB está lista (host=${host}, port=${port})`);
      return;
    } catch (err) {
      console.log(`Intento ${attempts}/${maxRetries}: DB no disponible aún (${err.code || err.message}). Esperando ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error(`No se pudo conectar a la base de datos después de ${maxRetries} intentos.`);
  process.exit(1);
}

waitForDb();

import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL / SUPABASE_DB_URL env var");
  // não encerre em vercel durante build; lance erro mais à frente se necessário
}

export const pool = new Pool({
  connectionString,
  // Supabase exige TLS — em Node hosting como Vercel, aceite o certificado:
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

// tratamento básico
pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
});
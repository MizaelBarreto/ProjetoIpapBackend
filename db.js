import pkg from "pg";
import dns from "dns/promises";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL / SUPABASE_DB_URL env var");
}

let host;
try {
  host = new URL(connectionString).hostname;
  console.log("DB host (diagnostic):", host);
} catch (err) {
  console.error("Invalid DATABASE_URL format:", err.message);
  host = null;
}

(async () => {
  if (host) {
    try {
      const v4 = await dns.resolve4(host).catch((e) => { return { err: e }; });
      const v6 = await dns.resolve6(host).catch((e) => { return { err: e }; });

      if (v4 && !v4.err) console.log("DNS resolve4 ok:", v4);
      else console.log("DNS resolve4 failed:", v4?.err?.code ?? v4?.err?.message);

      if (v6 && !v6.err) console.log("DNS resolve6 ok:", v6);
      else console.log("DNS resolve6 failed:", v6?.err?.code ?? v6?.err?.message);
    } catch (err) {
      console.error("DNS diagnostic error:", err?.code ?? err?.message ?? err);
    }
  }
})();
 
export const pool = new Pool({
  connectionString,
  // Supabase exige TLS — em Node hosting como Vercel, aceite o certificado:
  ssl: connectionString ? { rejectUnauthorized: false } : false,
  // reduz tempo de timeout para detectar falhas rápido em logs
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
});
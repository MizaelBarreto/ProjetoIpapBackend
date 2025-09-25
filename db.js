import pkg from "pg";
import dns from "dns/promises";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL / SUPABASE_DB_URL env var");
}

// exportamos uma variável que será inicializada async
export let pool;

(async () => {
  let url;
  try {
    url = new URL(connectionString);
  } catch (err) {
    console.error("Invalid DATABASE_URL format:", err.message);
  }

  const host = url?.hostname;
  if (host) console.log("DB host (diagnostic):", host);

  // tenta resolver IPv4 primeiro, fallback para qualquer família
  let resolvedAddress = null;
  if (host) {
    try {
      const r = await dns.lookup(host, { family: 4 });
      resolvedAddress = r.address;
      console.log("DNS lookup (IPv4) ok:", resolvedAddress);
    } catch (err) {
      console.warn("IPv4 lookup failed, trying default lookup:", err.message);
      try {
        const r2 = await dns.lookup(host);
        resolvedAddress = r2.address;
        console.log("DNS lookup (any) ok:", resolvedAddress);
      } catch (err2) {
        console.error("DNS lookup failed for", host, err2.message || err2.code);
      }
    }
  }

  try {
    if (resolvedAddress && url) {
      // monta config sem usar connectionString (usa IP resolvido)
      const user = url.username || process.env.PGUSER;
      const password = url.password || process.env.PGPASSWORD;
      const port = Number(url.port || process.env.PGPORT || 5432);
      const database = (url.pathname || "").replace(/^\//, "") || process.env.PGDATABASE;

      pool = new Pool({
        host: resolvedAddress,
        port,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      console.log("PG Pool created using resolved IP (WARNING: uses IP, SSL cert validation disabled).");
    } else {
      // fallback: usa connectionString diretamente
      pool = new Pool({
        connectionString,
        ssl: connectionString ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
      });
      console.log("PG Pool created using connectionString.");
    }

    pool.on("error", (err) => {
      console.error("Unexpected PG error", err);
    });
  } catch (err) {
    console.error("Error creating PG pool:", err);
  }
})();
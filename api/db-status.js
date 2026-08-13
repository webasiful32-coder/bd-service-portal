import pg from 'pg';

const { Pool } = pg;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  const config = { connectionString: process.env.DATABASE_URL };
  if (process.env.DATABASE_URL.includes("neon.tech") || 
      process.env.DATABASE_URL.includes("cockroachlabs") || 
      process.env.DATABASE_URL.includes("render.com")) {
    config.ssl = { rejectUnauthorized: false };
  }
  return new Pool(config);
}

export default async (req, res) => {
  if (req.method === 'GET') {
    const isConfigured = !!process.env.DATABASE_URL;
    let connectionStable = false;
    if (isConfigured) {
      try {
        const p = getPool();
        if (p) {
          await p.query("SELECT NOW()");
          connectionStable = true;
        }
      } catch (e) {
        console.error("Health check error:", e);
      }
    }
    return res.status(200).json({
      configured: isConfigured,
      stable: connectionStable,
      message: isConfigured 
        ? (connectionStable ? "Neon Database connected correctly." : "Database variable present but failed connection handshake.")
        : "DATABASE_URL environment variable is currently absent."
    });
  }
  res.status(405).json({ error: "Method not allowed" });
};

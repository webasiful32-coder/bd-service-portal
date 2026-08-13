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
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  const { uid } = req.query;
  const p = getPool();
  if (!p) return res.status(404).json({ error: "Not configured" });

  try {
    const result = await p.query("SELECT uid, email, phone, display_name as \"displayName\", balance, role FROM users WHERE uid = $1", [uid]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found." });
    
    const user = result.rows[0];
    res.status(200).json({ ...user, balance: parseFloat(user.balance) });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Profile read error" });
  }
};

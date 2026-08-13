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
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { uid, amount, serviceName } = req.body;
  const p = getPool();
  if (!p) return res.status(400).json({ error: "DB missing" });

  try {
    const amountVal = parseFloat(amount);
    const checkUsr = await p.query("SELECT balance FROM users WHERE uid = $1", [uid]);
    if (checkUsr.rows.length === 0) return res.status(404).json({ error: "User not found." });
    
    const balance = parseFloat(checkUsr.rows[0].balance);
    if (balance < amountVal) return res.status(400).json({ error: "Insufficient funds." });

    await p.query("UPDATE users SET balance = balance - $1 WHERE uid = $2", [amountVal, uid]);
    
    const id = 'SERV-' + Math.floor(100000 + Math.random() * 900000);
    await p.query(
      "INSERT INTO transactions (id, uid, type, service_name, amount, method, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id, uid, 'service', serviceName, amountVal, 'System', 'Completed', new Date().toLocaleString()]
    );

    const latestUser = await p.query("SELECT balance FROM users WHERE uid = $1", [uid]);
    res.status(200).json({
      success: true,
      balance: parseFloat(latestUser.rows[0].balance)
    });
  } catch (err) {
    console.error("Service charge error:", err);
    res.status(500).json({ error: err.message });
  }
};

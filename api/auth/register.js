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

async function initDb() {
  const p = getPool();
  if (!p) return false;
  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(64) PRIMARY KEY,
          email VARCHAR(128) UNIQUE NOT NULL,
          phone VARCHAR(32) UNIQUE,
          display_name VARCHAR(128) NOT NULL,
          balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
          role VARCHAR(32) NOT NULL DEFAULT 'citizen',
          password VARCHAR(256) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        uid VARCHAR(64) REFERENCES users(uid) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        service_name VARCHAR(128),
        amount NUMERIC(15, 2) NOT NULL,
        method VARCHAR(32),
        trx_id VARCHAR(64),
        account_no VARCHAR(64),
        status VARCHAR(32) NOT NULL,
        timestamp VARCHAR(128) NOT NULL
      );`);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database init error:", error);
    return false;
  }
}

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { email, phone, name, password } = req.body;
  const p = getPool();
  if (!p) return res.status(400).json({ error: "DATABASE_URL is missing." });

  try {
    await initDb();
    const emailKey = email ? email.trim().toLowerCase() : '';
    const phoneVal = phone ? phone.trim() : null;

    if (!emailKey) return res.status(400).json({ error: "ইমেইল প্রদান করা আবশ্যক। (Email is required.)" });

    const duplicateEmail = await p.query("SELECT uid FROM users WHERE email = $1", [emailKey]);
    if (duplicateEmail.rows.length > 0) return res.status(400).json({ error: "ইমেইলটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });

    if (phoneVal) {
      const duplicatePhone = await p.query("SELECT uid FROM users WHERE phone = $1", [phoneVal]);
      if (duplicatePhone.rows.length > 0) return res.status(400).json({ error: "মোবাইল নম্বরটি ইতিপূর্বে নিবন্ধিত হয়েছে।" });
    }

    const uid = 'USR-' + Math.floor(100000 + Math.random() * 900000);
    await p.query(
      "INSERT INTO users (uid, email, phone, display_name, balance, role, password) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [uid, emailKey, phoneVal, name || emailKey.split('@')[0], 0.00, 'citizen', password]
    );

    res.status(200).json({
      uid, email: emailKey, phone: phoneVal,
      displayName: name || emailKey.split('@')[0],
      balance: 0.00, role: 'citizen'
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message || "Registration failed." });
  }
};

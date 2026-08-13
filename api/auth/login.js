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

  const { email, password } = req.body;
  const p = getPool();
  if (!p) return res.status(400).json({ error: "DATABASE_URL is missing." });

  try {
    if (!email) return res.status(400).json({ error: "ইমেইল বা মোবাইল নম্বর প্রদান করুন।" });
    
    const cleanId = email.trim().toLowerCase();
    const result = await p.query("SELECT * FROM users WHERE email = $1 OR phone = $1", [cleanId]);
    
    if (result.rows.length === 0) return res.status(400).json({ error: "ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।" });

    const user = result.rows[0];
    if (user.password !== password) return res.status(400).json({ error: "ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।" });

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      phone: user.phone,
      displayName: user.display_name,
      balance: parseFloat(user.balance),
      role: user.role
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message || "Login failed." });
  }
};

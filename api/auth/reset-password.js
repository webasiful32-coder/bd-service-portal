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

  const { identifier, newPassword } = req.body;
  const p = getPool();
  if (!p) return res.status(400).json({ error: "DATABASE_URL is missing." });

  try {
    if (!identifier) return res.status(400).json({ error: "ইমেইল বা মোবাইল নম্বর প্রদান করুন।" });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: "পাসওয়ার্ডটি অবশ্যই অন্তত ৬ ডিজিটের হতে হবে।" });
    
    const cleanId = identifier.trim().toLowerCase();
    const result = await p.query("SELECT uid FROM users WHERE email = $1 OR phone = $1", [cleanId]);
    
    if (result.rows.length === 0) return res.status(400).json({ error: "এই ইমেইল বা মোবাইল নম্বরের কোনো ব্যবহারকারী পাওয়া যায়নি।" });

    const uid = result.rows[0].uid;
    await p.query("UPDATE users SET password = $1 WHERE uid = $2", [newPassword, uid]);

    res.status(200).json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: err.message || "Password reset failed." });
  }
};

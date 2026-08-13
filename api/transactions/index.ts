import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

const { Pool } = pg;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  const config: any = { connectionString: process.env.DATABASE_URL };
  if (process.env.DATABASE_URL.includes("neon.tech") || 
      process.env.DATABASE_URL.includes("cockroachlabs") || 
      process.env.DATABASE_URL.includes("render.com")) {
    config.ssl = { rejectUnauthorized: false };
  }
  return new Pool(config);
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  const { uid } = req.query;
  const p = getPool();
  if (!p) return res.json([]);

  try {
    const result = await p.query(
      "SELECT id, type, service_name as \"serviceName\", amount, method, trx_id as \"trxId\", account_no as \"accountNo\", status, timestamp FROM transactions WHERE uid = $1 ORDER BY timestamp DESC LIMIT 50",
      [uid]
    );
    const output = result.rows.map(item => ({ ...item, amount: parseFloat(item.amount) }));
    res.status(200).json(output);
  } catch (err) {
    console.error("Fetch transactions error:", err);
    res.json([]);
  }
};

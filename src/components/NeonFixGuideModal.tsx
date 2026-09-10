import React, { useState } from 'react';
import { Database, AlertTriangle, Check, Copy, ExternalLink, Terminal, Shield } from 'lucide-react';

interface NeonFixGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeonFixGuideModal: React.FC<NeonFixGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeSnippetEnv = `# .env ফাইলে Neon Pooled Connection যোগ করুন:
# লক্ষ্য করুন: neon.tech ড্যাশবোর্ড থেকে "Pooled connection" সিলেক্ট করুন
DATABASE_URL="postgresql://username:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
`;

  const codeSnippetServerTs = `// server.ts এ PostgreSQL কানেকশন হ্যান্ডলিং ফিক্স:
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000, // ৫ সেকেন্ডের বেশি হ্যাং হবে না
});

// ডাটাবেস এররে সার্ভার ক্র্যাশ হওয়া প্রতিরোধ করুন:
pool.on('error', (err) => {
  console.warn('⚠️ Neon PG Background Pool Notice:', err.message);
});

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️ DATABASE_URL নেই, মেমোরি ফলব্যাক মোডে চলছে');
    return;
  }
  try {
    const client = await pool.connect();
    // টেবিল তৈরি করুন...
    await client.query(\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance NUMERIC(15, 2) DEFAULT 0.00
      );
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(100) NOT NULL,
        info TEXT NOT NULL,
        fee INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    \`);
    client.release();
    console.log('✅ Neon PostgreSQL টেবিল সফলভাবে রেডি!');
  } catch (err: any) {
    console.error('⚠️ Neon PostgreSQL কানেকশন টাইমআউট হয়েছে (ISP Port 5432 ব্লক হতে পারে):', err.message);
    console.log('ℹ️ সার্ভার মেমোরি মোডে ব্যাকআপ রান করছে!');
  }
}
`;

  const codeSnippetNeonServerless = `# বিকল্প এবং ১০০% গ্যারান্টি সমাধান (ISP ব্লক এড়াতে HTTPS ব্যবহার):
npm install @neondatabase/serverless

# এটি পোর্ট ৫৪৩২ এর বদলে পোর্ট ৪৪৩ (HTTPS) ব্যবহার করে, ফলে কোনো ISP ব্লক করতে পারে না!
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 my-8 border border-gray-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Neon PostgreSQL (ETIMEDOUT) সমাধান গাইড
              </h3>
              <p className="text-xs text-gray-500">
                কেন ETIMEDOUT হয়েছে এবং আপনার লোকাল মেশিনে কীভাবে ঠিক করবেন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Diagnostic explanation */}
        <div className="my-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <AlertTriangle size={17} />
            <span>ত্রুটির কারণ (Root Cause Analysis):</span>
          </div>
          <p>
            আপনার টার্মিনাল এররে দেখাচ্ছে: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-red-700">connect ETIMEDOUT 18.138.49.39:5432</code>। 
            বাংলাদেশের অধিকাংশ ব্রডব্যান্ড আইএসপি (যেমন Link3, AmberIT, Carnival বা মোবাইল ডাটা) আউটবাউন্ড <strong>Port 5432</strong> ব্লক রাখে। ফলে লোকাল মেশিন থেকে ডিরেক্ট PostgreSQL সার্ভার টাইমআউট হয়ে যায়।
          </p>
        </div>

        {/* Steps to fix */}
        <div className="space-y-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-800 text-sm">
                ১. Neon ড্যাশবোর্ড থেকে "Pooled Connection" স্ট্রিং ব্যবহার করুন
              </h4>
              <button
                onClick={() => handleCopy(codeSnippetEnv, 'env')}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 cursor-pointer"
              >
                {copiedSection === 'env' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSection === 'env' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <p className="text-gray-600">
              Neon কনসোলে গিয়ে Connection Details এ <strong>"Pooled connection"</strong> চেকবক্সে টিক দিন (এতে হোস্টনেমে <code className="font-mono text-purple-600">-pooler</code> যুক্ত হবে)।
            </p>
            <pre className="p-3 bg-slate-900 text-green-400 rounded-xl font-mono text-[11px] overflow-x-auto">
              {codeSnippetEnv}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-800 text-sm">
                ২. server.ts এ টাইমআউট ও ফলব্যাক কোড আপডেট করুন
              </h4>
              <button
                onClick={() => handleCopy(codeSnippetServerTs, 'server')}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 cursor-pointer"
              >
                {copiedSection === 'server' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSection === 'server' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <p className="text-gray-600">
              আপনার <code className="font-mono font-bold">server.ts</code> ফাইলে <code className="font-mono">connectionTimeoutMillis: 5000</code> যুক্ত করুন এবং ট্রাই-ক্যাচ দিয়ে হ্যান্ডল করুন যাতে ডাটাবেস অফলাইন থাকলেও সার্ভার ক্র্যাশ না করে।
            </p>
            <pre className="p-3 bg-slate-900 text-green-400 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48">
              {codeSnippetServerTs}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-purple-900 text-sm">
                ৩. সবচেয়ে কার্যকরী সমাধান: @neondatabase/serverless (Port 443 / HTTPS)
              </h4>
              <button
                onClick={() => handleCopy(codeSnippetNeonServerless, 'neon')}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-200 cursor-pointer"
              >
                {copiedSection === 'neon' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSection === 'neon' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <p className="text-purple-800">
              Neon এর অফিসিয়াল সার্ভারলেস ড্রাইভার ব্যবহার করলে এটি পোর্ট ৫৪৩২ এর পরিবর্তে সাধারণ ব্রাউজার পোর্ট ৪৪৩ (HTTPS) দিয়ে কানেক্ট করে, ফলে কোনো আইএসপি বা রাউটার এটিকে ব্লক করতে পারে না।
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-[#8000ff] hover:bg-[#7200e6] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
export default NeonFixGuideModal;

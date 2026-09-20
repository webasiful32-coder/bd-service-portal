import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  RotateCw, 
  Copy, 
  Smartphone, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  History, 
  ArrowLeft,
  Coins,
  AlertCircle
} from 'lucide-react';

export type PaymentMethod = 'bKash' | 'Nagad';

export interface WalletGateProps {
  balance: number;
  transactions?: Transaction[];
  onAddMoney: (amount: number, method: PaymentMethod, trxId: string, senderNumber?: string) => void | Promise<void>;
  onWithdraw: (amount: number, method: PaymentMethod, accountNo: string) => boolean | Promise<boolean>;
  onResetBalance?: () => void;
  onBack?: () => void;
}

export const WalletGate: React.FC<WalletGateProps> = ({ 
  balance, 
  transactions = [], 
  onAddMoney, 
  onWithdraw, 
  onResetBalance, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  
  // Deposit States
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>('bKash');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string>('');

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('bKash');
  const [accountNo, setAccountNo] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string>('');

  // মার্চেন্ট নম্বর
  const MERCHANT_NUMBERS: Record<PaymentMethod, string> = {
    bKash: '01628329062',
    Nagad: '01628329062',
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.trim());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setDepositError('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন।');
      return;
    }

    if (!senderNumber.trim()) {
      setDepositError('প্রেরক নম্বর (Sender Number) দেওয়া আবশ্যক।');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(senderNumber.trim())) {
      setDepositError('১১-সংখ্যার সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (!trxId.trim()) {
      setDepositError('পেমেন্ট সফল হওয়ার পর প্রাপ্ত Transaction ID (TrxID) দিন।');
      return;
    }

    setIsVerifying(true);
    setDepositSuccess(false);
    setVerifyStep('পেমেন্ট ট্রানজেকশন যাচাই করা হচ্ছে...');

    try {
      await onAddMoney(amountNum, depositMethod, trxId.trim().toUpperCase(), senderNumber.trim());
      setIsVerifying(false);
      setDepositSuccess(true);
      setTrxId('');
      setSenderNumber('');
      setTimeout(() => setDepositSuccess(false), 4500);
    } catch {
      setIsVerifying(false);
      setDepositError('ডিপোজিট প্রক্রিয়া সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    if (amountNum > balance) {
      setWithdrawError('আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    if (!accountNo.match(/^01[3-9]\d{8}$/)) {
      setWithdrawError('১১-সংখ্যার সঠিক মোবাইল নম্বর দিন।');
      return;
    }

    setIsWithdrawing(true);
    try {
      const success = await onWithdraw(amountNum, withdrawMethod, accountNo.trim());
      setIsWithdrawing(false);
      if (success) {
        setWithdrawSuccess(true);
        setAccountNo('');
        setTimeout(() => setWithdrawSuccess(false), 4000);
      } else {
        setWithdrawError('উইথড্র রিকোয়েস্ট সফল হয়নি।');
      }
    } catch {
      setIsWithdrawing(false);
      setWithdrawError('উইথড্র সংযোগে ত্রুটি হয়েছে।');
    }
  };

  return (
    <div id="wallet_subsystem" className="bg-white/95 backdrop-blur-md border border-purple-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(124,58,237,0.08)] overflow-hidden transition-all duration-300">
      
      {/* Back Button Header */}
      {onBack && (
        <div className="px-6 py-5 flex items-center justify-between border-b border-purple-100/40 bg-purple-50/20">
          <button
            id="wallet_back_btn"
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-950 text-xs font-black transition-colors cursor-pointer group"
          >
            <ArrowLeft size={15} className="stroke-[2.5] group-hover:-translate-x-1 transition-transform text-purple-700" />
            <span>ফিরে যান (Back to Services)</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span>SECURED WORKSPACE</span>
          </div>
        </div>
      )}

      {/* Hero Wallet Balance Card */}
      <div className="p-6 sm:p-8 bg-purple-50/80 border-b border-purple-100/40">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.26em] text-violet-200 font-black">ডিজিটাল সেবা ওয়ালেট</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">আপনার ওয়ালেট ব্যালেন্স</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white">
                <ShieldCheck size={14} className="text-emerald-300" />
                <span>অফিসিয়াল সক্রিয় ওয়ালেট</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 px-6 py-4 shadow-lg backdrop-blur-sm text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200 font-black">বর্তমান ওয়ালেট ব্যালেন্স</p>
              <p className="mt-1 text-3xl sm:text-4xl font-extrabold">৳ {balance.toFixed(2)}</p>
              <p className="mt-0.5 text-xs text-violet-100/90">প্রকৃত ক্যাশ ব্যালেন্স</p>
              {onResetBalance && balance > 0 && (
                <button
                  type="button"
                  onClick={onResetBalance}
                  className="mt-2 text-[11px] text-rose-200 hover:text-white bg-rose-500/30 hover:bg-rose-500/50 px-3 py-1 rounded-full border border-rose-300/30 transition-all font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <span>ব্যালেন্স ০ ৳ করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Menu */}
        <div className="flex gap-1 bg-white border border-purple-100/80 p-1.5 rounded-2xl mt-6 shadow-sm">
          {(['deposit', 'withdraw', 'history'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                id={`wallet_tab_${tab}`}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setWithdrawError('');
                  setDepositError('');
                }}
                className={`flex-1 py-3 rounded-xl text-[11px] sm:text-xs font-bold leading-none shrink-0 flex justify-center items-center gap-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white shadow-md'
                    : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
                }`}
              >
                {tab === 'deposit' && <ArrowUpRight size={14} />}
                {tab === 'withdraw' && <ArrowDownLeft size={14} />}
                {tab === 'history' && <History size={14} />}
                <span>
                  {tab === 'deposit' ? 'Add Money / রিচার্জ' : tab === 'withdraw' ? 'Withdraw / উইথড্র' : 'History / বিবরণী'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Space */}
      <div className="p-6 sm:p-8">
        {/* ================= ADD MONEY TAB ================= */}
        {activeTab === 'deposit' && (
          <div className="space-y-6 animate-fade-in">
            {/* User Guidance Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ব্যালেন্স রিচার্জ করার সহজ নিয়ম:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-950/90 font-medium">
                নিচের বিকাশ বা নগদ নম্বরে <strong>Send Money</strong> করুন। এরপর যে নম্বর থেকে টাকা পাঠিয়েছেন এবং প্রাপ্ত <strong>Transaction ID (TrxID)</strong> নিচে লিখে নিশ্চিত করুন। আপনার ব্যালেন্স সাথে সাথে যোগ হয়ে যাবে।
              </p>
            </div>

            {depositError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {depositError}
              </div>
            )}

            {depositSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-emerald-800 shadow-sm animate-scale-up">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-xs text-emerald-900">ব্যালেন্স সফলভাবে যোগ হয়েছে!</h4>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    আপনার ডিপোজিট নিশ্চিত করা হয়েছে এবং ওয়ালেটে ব্যালেন্স যুক্ত হয়েছে।
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-5">
              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                  ১. পেমেন্ট মেথড নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['bKash', 'Nagad'] as const).map((method) => {
                    const isSelected = depositMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDepositMethod(method)}
                        className={`p-3.5 border rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs border-2'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-200'
                        }`}
                      >
                        <span>{method === 'bKash' ? 'বিকাশ (bKash)' : 'নগদ (Nagad)'}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Merchant Number Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">ব্যক্তিগত (Send Money) নম্বর:</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">সক্রিয়</span>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
                    <Smartphone size={16} className="text-purple-600" />
                    <span>{MERCHANT_NUMBERS[depositMethod]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(MERCHANT_NUMBERS[depositMethod])}
                    className="p-1.5 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedText ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedText ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Amount, Sender Number, TrxID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    টাকার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    যে নম্বর থেকে পাঠিয়েছেন
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl py-2.5 px-3.5 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BL98A2K..."
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl py-2.5 px-3.5 text-xs font-bold font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RotateCw className="animate-spin" size={15} />
                    <span>{verifyStep}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>ডিপোজিট নিশ্চিত করুন (৳ {depositAmount || 0})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= WITHDRAW TAB ================= */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6 animate-fade-in">
            {withdrawSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold">
                উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!
              </div>
            )}

            {withdrawError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    উইথড্র মেথড
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900"
                  >
                    <option value="bKash">বিকাশ (bKash)</option>
                    <option value="Nagad">নগদ (Nagad)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                    টাকার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  যে নম্বরে টাকা নেবেন
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isWithdrawing ? 'উইথড্র প্রসেস হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
              </button>
            </form>
          </div>
        )}

        {/* ================= HISTORY TAB ================= */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
              <span>ট্রানজেকশন বিবরণী</span>
              <span>মোট {transactions.length} টি</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === 'deposit' ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {tx.type === 'deposit' ? `${tx.method || ''} ডিপোজিট` : tx.serviceName || 'সার্ভিস ফি কর্তন'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {tx.timestamp} {tx.trxId ? `• Trx: ${tx.trxId}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <span className={tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'}>
                        {tx.type === 'deposit' ? '+' : '-'} ৳{(tx.amount || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletGate;
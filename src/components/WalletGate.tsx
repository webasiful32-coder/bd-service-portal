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
  Lock, 
  History, 
  ArrowRight,
  TrendingUp,
  Coins,
  ArrowLeft
} from 'lucide-react';

interface WalletGateProps {
  balance: number;
  transactions: Transaction[];
  onAddMoney: (amount: number, method: 'bKash' | 'Nagad' , trxId: string, senderNumber: string) => void;
  onWithdraw: (amount: number, method: 'bKash' | 'Nagad' , accountNo: string) => boolean | Promise<boolean>;
  onBack?: () => void;
}

export default function WalletGate({ balance, transactions, onAddMoney, onWithdraw, onBack }: WalletGateProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  
  // Deposit States
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositMethod, setDepositMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [depositAccountType, setDepositAccountType] = useState<'Personal' | 'Business'>('Personal');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string>('');

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState<string>('200');
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [accountNo, setAccountNo] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string>('');

  // Merchants numbers simulation
  const MERCHANT_NUMBERS = {
    bKash: '01628329062',
    Nagad: '01628329062',
  };

  // Get brand color theme
  const getBrandDetails = (method: 'bKash' | 'Nagad') => {
    switch (method) {
      case 'bKash':
        return {
          primary: '#e2136e',
          pastelBg: 'bg-[#e2136e]/5',
          primaryBg: 'bg-[#e2136e]',
          borderActive: 'border-[#e2136e]',
          textActive: 'text-[#e2136e]',
          ring: 'focus:ring-[#e2136e]/10',
          badgeDot: 'bg-[#e2136e]',
          glow: 'shadow-[0_4px_14px_rgba(226,19,110,0.12)]'
        };
      case 'Nagad':
        return {
          primary: '#f7941d',
          pastelBg: 'bg-[#f7941d]/5',
          primaryBg: 'bg-[#f7941d]',
          borderActive: 'border-[#f7941d]',
          textActive: 'text-[#f7941d]',
          ring: 'focus:ring-[#f7941d]/10',
          badgeDot: 'bg-[#f7941d]',
          glow: 'shadow-[0_4px_14px_rgba(247,148,29,0.12)]'
        };
   
    }
  };

  const currentDepositTheme = getBrandDetails(depositMethod);
  const currentWithdrawTheme = getBrandDetails(withdrawMethod);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.split(' ')[0]);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const generateMockTrxId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TXN';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTrxId(result);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (!senderNumber.trim()) {
      setDepositError('Sender Number দেওয়া আবশ্যক।');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(senderNumber.trim())) {
      setDepositError('ভুল Sender Number ফরম্যাট। ১১-সংখ্যার বাংলাদেশি নম্বর দিন।');
      return;
    }

    if (depositAccountType === 'Business' && amountNum < 1450) {
      setDepositError('Business অ্যাকাউন্টের জন্য সর্বনিম্ন ১,৪৫০ টাকা দিতে হবে।');
      return;
    }

    if (!trxId.trim()) {
      alert('Please enter a Transaction ID (or click "Mock Sandbox ID" to auto-simulate)');
      return;
    }

    setIsVerifying(true);
    setDepositSuccess(false);
    
    setVerifyStep('Secure payment handshake initiated...');
    setTimeout(() => {
      setVerifyStep(`Syncing with Bangladesh ${depositMethod} API portal...`);
      setTimeout(() => {
        setVerifyStep('Matching safe ledger with local sandbox...');
        setTimeout(() => {
          setVerifyStep('Crediting cloud wallet ledger...');
          setTimeout(() => {
            onAddMoney(amountNum, depositMethod, trxId, senderNumber.trim());
            setIsVerifying(false);
            setDepositSuccess(true);
            setTrxId('');
            setSenderNumber('');
            setTimeout(() => setDepositSuccess(false), 4000);
          }, 1000);
        }, 1000);
      }, 1200);
    }, 1000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid BDT amount.');
      return;
    }

    if (amountNum > balance) {
      setWithdrawError('Insufficient account Balance for this transfer.');
      return;
    }

    if (!accountNo.match(/^01[3-9]\d{8}$/)) {
      setWithdrawError('Please enter a valid 11-digit Bangladesh mobile number.');
      return;
    }

    setIsWithdrawing(true);
    
    setTimeout(async () => {
      try {
        const success = await onWithdraw(amountNum, withdrawMethod, accountNo);
        setIsWithdrawing(false);
        if (success) {
          setWithdrawSuccess(true);
          setAccountNo('');
          setTimeout(() => setWithdrawSuccess(false), 4000);
        } else {
          setWithdrawError('Withdrawal processing failed. Please verify with authority.');
        }
      } catch (err) {
        setIsWithdrawing(false);
        setWithdrawError('Withdrawal connection failed. Please retry.');
      }
    }, 2500);
  };

  return (
    <div id="wallet_subsystem" className="bg-white/95 backdrop-blur-md border border-purple-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(124,58,237,0.08)] overflow-hidden transition-all duration-300">
      
      {onBack && (
        <div className="px-6 py-5 flex items-center justify-between border-b border-purple-100/40 bg-purple-50/20">
          <button
            id="wallet_back_btn"
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-purple-750 hover:text-purple-950 text-xs font-black transition-colors cursor-pointer group"
          >
            <ArrowLeft size={15} className="stroke-[2.5] group-hover:-translate-x-1 transition-transform text-purple-750" />
            <span>ফিরে যান (Back to Services)</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span>SECURED WORKSPACE</span>
          </div>
        </div>
      )}

      {/* 💳 Hero Wallet Recharge Card */}
      <div className="p-6 sm:p-8 bg-purple-50/80 border-b border-purple-100/40">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 text-white p-6 sm:p-8 relative overflow-hidden shadow-[0_30px_90px_-45px_rgba(124,58,237,0.40)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_20%)] pointer-events-none"></div>
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute left-0 top-16 h-28 w-28 rounded-full bg-white/10 blur-3xl"></div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.26em] text-violet-200 font-black">সাব এডমিন হওয়ার সুযোগ!</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">আমাদের একাউন্টে সাব অ্যাডমিন নিতে চাইলে মাত্র</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white shadow-sm">
                <Sparkles size={14} className="text-amber-200" />
                <span>সাব এডমিন</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 px-5 py-4 shadow-lg backdrop-blur-sm text-right">
              <p className="text-[10px] uppercase tracking-[0.24em] text-violet-200 font-black">২,৯৫০ ৳</p>
              <p className="mt-3 text-4xl font-extrabold">৳ ২,৯৫০</p>
              <p className="mt-2 text-xs text-violet-100/90">এবার যোগ করুন — সারাদেশীয় সুবিধা উপভোগ করুন</p>
            </div>
          </div>
            
             
        </div>

        {/* 📑 Action Selector Menu (Clean Segmented control matching light-mode) */}
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
                }}
                className={`flex-1 py-3 rounded-xl text-[11px] sm:text-xs font-bold leading-none shrink-0 flex justify-center items-center gap-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white shadow-[0_4px_15px_rgba(124,58,237,0.18)]'
                    : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
                }`}
              >
                {tab === 'deposit' && <ArrowUpRight size={14} />}
                {tab === 'withdraw' && <ArrowDownLeft size={14} />}
                {tab === 'history' && <History size={14} />}
                <span>
                  {tab === 'deposit' ? 'Add Money' : tab === 'withdraw' ? 'Withdraw / ক্যাশআউট' : 'History / বিবরণী'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Forms Workspace - Spacious & Clutter-free */}
      <div className="p-6 sm:p-8">
        
        {/* ==================== ADD MONEY DEPOSIT FORM ==================== */}
        {activeTab === 'deposit' && (
          <div className="animate-fade-in space-y-6">
            <div className="rounded-[2rem] border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-purple-500 font-black pb-4">ব্যালেন্স রিচার্জ করুন</p>
                  <h3 className="text-xl sm:text-2xl font-black text-purple-950 mb-7">Your wallet recharge dashboard</h3>
                  
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full sm:w-auto">
                  <div className="rounded-[1.75rem] bg-purple-50 border border-purple-100 p-4 text-purple-950 shadow-sm min-w-[220px]">
                    <div className="text-[10px] uppercase tracking-[0.24em] font-black text-purple-500">{depositAccountType === 'Personal' ? 'Personal Account' : 'Business Account'}</div>
                    <div className="mt-3 text-3xl font-extrabold">৳ {depositAccountType === 'Personal' ? '৫০০' : '১,৪৫০'}</div>
                    <p className="mt-2 text-[11px] text-purple-600">{depositAccountType === 'Personal' ? 'Personal অ্যাকাউন্টের জন্য প্রস্তাবিত টাকা।' : 'Business অ্যাকাউন্টের জন্য ন্যূনতম জমা।'}</p>
                  </div>
                  
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-[12px] font-bold">
              {(['Personal', 'Business'] as const).map((type) => {
                const isActive = depositAccountType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setDepositAccountType(type);
                      if (type === 'Business' && parseFloat(depositAmount) < 1450) {
                        setDepositAmount('1450');
                      }
                      setDepositError('');
                    }}
                    className={`py-3 rounded-2xl transition-all duration-200 text-sm font-black ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' : 'bg-white text-purple-800 border border-purple-100 hover:border-purple-200'}`}
                  >
                    {type} Account
                  </button>
                );
              })}
            </div>

            {depositAccountType === 'Business' && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-[11px] sm:text-xs text-amber-900 shadow-sm">
                <div className="font-black text-xs uppercase tracking-[0.18em] mb-1">Business Account Minimum</div>
                <p className="leading-relaxed">
                  Business অ্যাকাউন্টের জন্য সর্বনিম্ন <strong className="text-amber-800">১,৪৫০ টাকা</strong> অ্যাড করতে হবে। ১,৪৫০ টাকার কম পরিমাণ দিলে সাবমিশন গ্রহণ করা হবে না।
                </p>
              </div>
            )}

            {depositError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">{depositError}</div>
            )}

            {depositSuccess && (
              <div id="deposit_success_banner" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-emerald-800 shadow-sm animate-scale-up">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                    Add Money Processed Successfully! <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-emerald-600/90 mt-1 leading-relaxed">
                    Transaction matched. Your wallet balance has been credited with BDT <strong className="text-emerald-950 font-black">{depositAmount}</strong>.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              
              {/* Payment Method selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest uppercase block pl-1">
                  1. Select Payment Method / অপারেটর সিলেক্ট করুন
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['bKash', 'Nagad'] as const).map((method) => {
                    const isSelected = depositMethod === method;
                    const bTheme = getBrandDetails(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDepositMethod(method)}
                        className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all duration-200 text-xs font-bold cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? `${bTheme.borderActive} ${bTheme.pastelBg} ${bTheme.textActive} ${bTheme.glow} border-2`
                            : 'border-purple-100 bg-purple-50/10 hover:border-purple-200 text-purple-900/60 hover:text-purple-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? bTheme.badgeDot : 'bg-purple-200'}`}></span>
                          <span className="font-extrabold text-xs">{method}</span>
                        </div>
                        
                        {/* Dot indicator for brands */}
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bTheme.primary }}></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secure Copy Box & Rules */}
              <div className={`p-5 rounded-2xl border ${currentDepositTheme.pastelBg} ${currentDepositTheme.borderActive}/30 space-y-3.5 relative overflow-hidden`}>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider pl-0.5">
                  <span className={currentDepositTheme.textActive}>Payment Rules & Guide</span>
                  <span className="text-purple-400 font-mono text-[9px]">GATEWAY STATUS: ONLINE</span>
                </div>
                
                <p className="text-[11px] text-purple-950/80 leading-relaxed font-medium">
                  নিচের মার্চেন্ট নাম্বারে <strong className={currentDepositTheme.textActive}>Send Money / Cash In</strong> করুন। পেমেন্ট সম্পন্ন হবার পর প্রাপ্ত <strong className={currentDepositTheme.textActive}>Transaction ID</strong> নিচে দিয়ে পোর্টালে সাবমিট করুন।
                </p>

                <div className="flex items-center justify-between bg-white border border-purple-100/60 p-3 rounded-xl transition-all duration-200 hover:border-purple-200">
                  <div className="flex gap-2.5 items-center text-xs font-mono font-black text-purple-950">
                    <Smartphone size={14} className={currentDepositTheme.textActive} />
                    <span className="tracking-wide text-xs select-all text-purple-900">{MERCHANT_NUMBERS[depositMethod]}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(MERCHANT_NUMBERS[depositMethod])}
                    className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    title="Copy details"
                  >
                    {copiedText ? (
                      <Check size={14} className="text-emerald-600 animate-scale-up" />
                    ) : (
                      <Copy size={13} className="hover:scale-105 transition-transform" />
                    )}
                  </button>
                </div>
              </div>

              {/* Amount, Sender Number and Trx ID Fields */}
              <div className="grid grid-cols-1 gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Deposit Amount field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest block pl-1 uppercase">
                      Amount / টাকার পরিমাণ
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-black text-purple-400 font-sans">৳</span>
                      <input
                        id="input_deposit_amount"
                        type="number"
                        required
                        min={depositAccountType === 'Business' ? 1450 : 50}
                        max="25000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-purple-50/10 border border-purple-100 hover:border-purple-300 focus:border-purple-500 rounded-xl py-3 pl-8 pr-4 text-xs font-black text-purple-950 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
                      />
                    </div>
                    <span className="text-[9px] text-purple-400 font-medium pl-1 block">
                      {depositAccountType === 'Business'
                        ? 'Business অ্যাকাউন্টের জন্য সর্বনিম্ন ১,৪৫০ টাকা বাধ্যতামূলক'
                        : 'Min 50 ৳, Max 25,000 ৳ per entry'}
                    </span>
                  </div>

                  {/* Sender Number field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest block pl-1 uppercase">
                      Sender Number / পাঠানো নম্বর
                    </label>
                    <div className="relative">
                      <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        id="input_sender_number"
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full bg-purple-50/10 border border-purple-100 hover:border-purple-300 focus:border-purple-500 rounded-xl py-3 pl-12 pr-4 text-xs font-black text-purple-950 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
                      />
                    </div>
                    <span className="text-[9px] text-purple-400 font-medium pl-1 block">যেমন: 01712345678</span>
                  </div>
                </div>

                {/* TrxID Field with dynamic copy mock ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest block pl-1 uppercase">
                    Transaction ID / ট্রানজেকশন ID
                  </label>
                  <div className="relative">
                    <input
                      id="input_deposit_trxid"
                      type="text"
                      required
                      placeholder="e.g. TRX893JVU3"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full bg-purple-50/10 border border-purple-100 hover:border-purple-300 focus:border-purple-500 rounded-xl py-3 pl-4 pr-24 text-xs font-mono uppercase font-black text-purple-950 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={generateMockTrxId}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-750 text-[10px] px-2.5 py-1.5 rounded-lg border border-purple-200/40 font-black transition-all cursor-pointer shadow-xs"
                      title="Simulate automated test payload"
                    >
                      Mock Sandbox
                    </button>
                  </div>
                  <span className="text-[9px] text-purple-400 font-medium pl-1 block">Specify your mobile wallet transaction proof</span>
                </div>
              </div>

              {/* Submit Deposit triggers button */}
              <button
                id="btn_submit_deposit"
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] border-transparent text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-purple-300/40 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RotateCw className="animate-spin text-white" size={13} />
                    <span>{verifyStep}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Confirm Deposit Submission / ডিপোজিট নিশ্চিত করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================== WITHDRAW HUB FORM ==================== */}
        {activeTab === 'withdraw' && (
          <div className="animate-fade-in space-y-6">
            {withdrawSuccess && (
              <div id="withdraw_success_banner" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-emerald-800 shadow-sm animate-scale-up">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">Payout Request Transmitted!</h4>
                  <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed text-emerald-700/90">
                    Schedules created successfully. Requested amount will transfer securely into your verified wallet number shortly.
                  </p>
                </div>
              </div>
            )}

            {withdrawError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-700 font-bold flex gap-2 items-center">
                <span>⚠️</span>
                <span>{withdrawError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest uppercase block pl-1">
                  1. Choose Payout Channel / উইথড্র মেথড সিলেক্ট করুন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['bKash', 'Nagad'] as const).map((method) => {
                    const isSelected = withdrawMethod === method;
                    const bTheme = getBrandDetails(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setWithdrawMethod(method)}
                        className={`p-3 border rounded-2xl flex items-center justify-between transition-all duration-200 text-xs font-bold cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? `${bTheme.borderActive} ${bTheme.pastelBg} ${bTheme.textActive} border-2`
                            : 'border-purple-100 bg-purple-50/10 hover:border-purple-200 text-purple-900/60 hover:text-purple-900'
                        }`}
                      >
                        <span className="font-extrabold text-xs">{method}</span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bTheme.primary }}></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Account phone input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest uppercase block pl-1">
                    Beneficiary Account / ওয়ালেট নম্বর
                  </label>
                  <div className="relative">
                    <input
                      id="input_withdraw_account"
                      type="tel"
                      required
                      placeholder=""
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      className="w-full bg-purple-50/10 border border-purple-100 hover:border-purple-300 focus:border-purple-500 text-purple-950 font-extrabold rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-4 focus:ring-purple-100 font-mono transition-all"
                    />
                  </div>
                  <span className="text-[9px] text-purple-400 font-medium pl-1 block">Specify registered 11-digit Bangladesh wallet mobile</span>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-purple-950/80 tracking-widest uppercase block pl-1">
                    Withdrawal Amount / উইথড্র পরিমাণ
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-black text-purple-400 font-sans">৳</span>
                    <input
                      id="input_withdraw_amount"
                      type="number"
                      required
                      min="100"
                      max="15000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-purple-50/10 border border-purple-100 hover:border-purple-300 focus:border-purple-500 text-purple-950 font-black rounded-xl py-3 pl-8 pr-4 text-xs focus:outline-none focus:ring-4 focus:ring-purple-100 font-sans transition-all"
                    />
                  </div>
                  <span className="text-[9px] text-purple-400 font-medium pl-1 block">Available Limit: 100 ৳ to 15,000 ৳</span>
                </div>
              </div>

              {/* Submit withdraw triggers button */}
              <button
                id="btn_submit_withdraw"
                type="submit"
                disabled={isWithdrawing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] hover:shadow-purple-300/40 text-white font-extrabold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isWithdrawing ? (
                  <>
                    <RotateCw className="animate-spin text-white" size={13} />
                    <span>Verifying secure balance signatures...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft size={13} className="text-purple-200" />
                    <span>Request Payout Transfer / উইথড্র সম্পন্ন করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================== LEDGER HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="animate-fade-in space-y-4">
            
            <div className="flex justify-between items-center mb-1 text-[10px] font-extrabold text-purple-900/60 uppercase tracking-widest pl-1">
              <span>Past Transfers Ledger / বিবরণী</span>
              <span className="bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md text-[9px] text-purple-700 font-mono font-bold">
                Total: {transactions.length} items
              </span>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-purple-400 text-[11px] font-bold border border-dashed border-purple-100/60 rounded-2xl bg-purple-50/5">
                No ledger activity recorded on your current cloud profile.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 select-none custom-scrollbar">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  const isWithdraw = tx.type === 'withdraw';
                  const isPending = tx.status === 'Pending';
                  
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between border border-purple-100/50 bg-white hover:bg-purple-50/10 p-4 rounded-2xl text-xs transition-all duration-300 hover:border-purple-200 hover:scale-[1.005] shadow-[0_2px_8px_rgba(124,58,237,0.02)]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          isDeposit ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          isWithdraw ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {isDeposit && <ArrowUpRight size={14} className="stroke-[2.5]" />}
                          {isWithdraw && <ArrowDownLeft size={14} className="stroke-[2.5]" />}
                          {!isDeposit && !isWithdraw && <Coins size={14} />}
                        </div>
                        
                        <div>
                          <p className="text-purple-950 font-black text-[12px] leading-snug">
                            {isDeposit ? `${tx.method} Deposit loaded` :
                             isWithdraw ? `MFS Payout to ${tx.method}` :
                             `Service Charge: ${tx.serviceName}`}
                          </p>
                          <p className="text-[10px] text-purple-500 font-mono mt-1">
                            {tx.timestamp} {tx.trxId ? `• ID: ${tx.trxId}` : tx.accountNo ? `• Ref: ${tx.accountNo}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <p className={`font-black font-mono text-xs sm:text-[13px] leading-tight ${
                          isDeposit ? 'text-emerald-600' :
                          isWithdraw ? 'text-rose-600' : 'text-purple-900/80'
                        }`}>
                          {isDeposit ? '+' : '-'} ৳{tx.amount.toFixed(1)}
                        </p>
                        
                        <span className={`inline-flex items-center gap-1.5 text-[8px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-full mt-2 border ${
                          isPending ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' :
                          tx.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {isPending && <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping"></span>}
                          <span>{tx.status}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

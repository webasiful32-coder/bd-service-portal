import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SYSTEM_SERVICES } from '../data';
import { ServiceType, ServiceDefinition } from '../types';

interface ServiceViewsProps {
  activeServiceId: ServiceType;
  walletBalance: number;
  deductFee: (amount: number, service: any) => boolean | Promise<boolean>;
  onBack: () => void;
  triggerToast: (title: string, message: string) => void;
  openWallet?: () => void;
  onOrderPlaced?: (order: any) => void;
}

export default function ServiceViews({
  activeServiceId,
  walletBalance,
  deductFee,
  onBack,
  triggerToast,
  openWallet,
  onOrderPlaced,
}: ServiceViewsProps) {
  // আপনার data.ts থেকে সার্ভিসটি খুঁজে নেওয়া হচ্ছে
  const service: ServiceDefinition = SYSTEM_SERVICES.find((s: any) => s.id === activeServiceId) || {
    id: activeServiceId,
    title: activeServiceId,
    banglaTitle: activeServiceId === 'server_copy' ? 'সার্ভার কপি' : 'ডিজিটাল সেবা',
    category: 'all',
    description: '',
    fee: 18,
    icon: 'file',
    inputLabel: 'প্রয়োজনীয় তথ্য',
    inputPlaceholder: 'এখানে লিখুন...',
  };

  const currentFee = service.fee ?? service.price ?? 18;
  const labelText = service.inputLabel || 'প্রয়োজনীয় তথ্য';
  const placeholderText = service.inputPlaceholder || 'এখানে লিখুন...';

  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{ id: string; info: string; fee: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!info.trim()) {
      setErrorMsg(`অনুগ্রহ করে ${labelText} লিখুন।`);
      return;
    }

    if (walletBalance < currentFee) {
      setErrorMsg(`অপ্রতুল ব্যালেন্স! সার্ভিস চার্জ: ${currentFee} ৳। আপনার বর্তমান ব্যালেন্স: ${walletBalance} ৳।`);
      if (openWallet) openWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      const approved = await deductFee(currentFee, service);
      if (approved) {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const orderData = {
          id: orderId,
          serviceId: service.id,
          serviceBanglaTitle: service.banglaTitle,
          info: info.trim(),
          fee: currentFee,
          status: 'pending',
          createdAt: new Date().toLocaleTimeString('bn-BD'),
        };

        if (onOrderPlaced) onOrderPlaced(orderData);
        setCompletedOrder({ id: orderId, info: info.trim(), fee: currentFee });
        triggerToast('অর্ডার গৃহীত হয়েছে!', `${service.banglaTitle} এর অর্ডার সফলভাবে সাবমিট হয়েছে।`);
      }
    } catch {
      setErrorMsg('সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans">
      {/* স্ক্রিনশটের হুবহু সেন্ট্রাল ইনফরমেশন বক্স */}
      <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-2xl p-6 md:p-7 border border-gray-100 animate-scale-up">
        {completedOrder ? (
          /* অর্ডার সফল হওয়ার রিসিট ভিউ */
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">অর্ডার সফলভাবে জমা হয়েছে</h3>
              <p className="text-xs text-gray-500 mt-1">অর্ডার নম্বর #{completedOrder.id}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>সেবা:</span>
                <span className="font-bold text-gray-900">{service.banglaTitle}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>চার্জ কর্তন:</span>
                <span className="font-bold text-[#8000ff]">{completedOrder.fee} ৳</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500 block mb-1">প্রদত্ত তথ্য:</span>
                <p className="font-mono bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800 break-words">
                  {completedOrder.info}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 bg-[#8000ff] hover:bg-[#7200e6] text-white font-semibold text-xs rounded-2xl shadow-md transition cursor-pointer"
            >
              ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
        ) : (
          /* মেইন বক্স: হেডার + প্রয়োজনীয় তথ্য + বাতিল ও অর্ডার বাটন */
          <div>
            {/* ১. হেডার: ক্লিপবোর্ড আইকন + সার্ভিস নাম + চার্জ */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2.5 shrink-0">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                  <rect x="8" y="10" width="32" height="34" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
                  <rect x="12" y="14" width="24" height="26" rx="2" fill="#FFFFFF" />
                  <rect x="16" y="4" width="16" height="8" rx="2.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                  <circle cx="24" cy="8" r="1.5" fill="#FFFFFF" />
                  <line x1="16" y1="20" x2="32" y2="20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="26" x2="32" y2="26" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="32" x2="26" y2="32" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
                  {service.banglaTitle}
                </h3>
                <div className="text-[15px] font-bold text-[#8000ff] mt-0.5">
                  চার্জ: {currentFee} ৳
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ২. প্রয়োজনীয় তথ্য টেক্সটবক্স */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-gray-500 block mb-2">
                  {labelText}
                </label>
                <textarea
                  rows={3}
                  value={info}
                  onChange={(e) => {
                    setInfo(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={placeholderText}
                  className="w-full bg-[#f8f9fa] border border-gray-200/80 rounded-2xl p-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff] transition resize-none font-sans"
                  autoFocus
                />
              </div>

              {/* ৩. বাটন: বাতিল + অর্ডার করুন */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-[#edf2f7] hover:bg-[#e2e8f0] text-gray-700 font-semibold text-sm rounded-2xl transition cursor-pointer text-center"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-[#8000ff] hover:bg-[#7200e6] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send size={15} className="rotate-12" />
                  <span>{isSubmitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
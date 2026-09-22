import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Upload, Clock, FileText, Sparkles } from 'lucide-react';
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
  // data.ts থেকে সার্ভিসটি খুঁজে নেওয়া
  const service: ServiceDefinition = SYSTEM_SERVICES.find((s: any) => s.id === activeServiceId) || {
    id: activeServiceId,
    title: activeServiceId,
    banglaTitle: activeServiceId === 'server_copy' ? 'সার্ভার কপি' : 'ডিজিটাল সেবা',
    titleEn: 'DIGITAL SERVICE',
    iconType: 'file',
    category: 'all',
    description: '',
    fee: 18,
    price: 18,
    icon: 'file',
    inputLabel: 'প্রয়োজনীয় তথ্য',
    inputPlaceholder: 'এখানে লিখুন...',
  };

  const currentFee = service.fee ?? service.price ?? 18;
  const labelText = service.inputLabel || 'প্রয়োজনীয় তথ্য';
  const placeholderText = service.inputPlaceholder || 'এখানে লিখুন...';

  // সার্ভিস টাইপ ডিটেকশন
  const isNidCorrection = 
    service.id.includes('correction') || 
    service.id.includes('address-transfer') ||
    service.banglaTitle?.includes('সংশোধন') || 
    service.banglaTitle?.includes('স্থানান্তর') ||
    service.title?.toLowerCase().includes('correction');

  const isNewBirth = 
    service.id.includes('new-birth') || 
    service.id.includes('birth-new') ||
    service.banglaTitle?.includes('নতুন জন্মনিবন্ধন');

  // স্ট্যান্ডার্ড সিঙ্গেল ইনপুট স্টেট (সার্ভার কপি, সাইন কপি ইত্যাদির জন্য)
  const [info, setInfo] = useState('');

  // আইডি কার্ড সংশোধনের স্টেট
  const [nidNumber, setNidNumber] = useState('');
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [birthFile, setBirthFile] = useState<File | null>(null);

  // নতুন জন্মনিবন্ধনের ৬টি ফিল্ডের স্টেট
  const [birthForm, setBirthForm] = useState({
    childName: '',
    motherNid: '',
    fatherNid: '',
    birthDetails: '',
    permanentAddress: '',
    guardianPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    info: string;
    fee: number;
    deliveryTime?: string;
    files?: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let compiledInfo = '';
    let uploadedFilesList: string[] = [];
    const deliveryTime = isNewBirth 
      ? '২৪ ঘণ্টার মধ্যেই অনলাইন হবে' 
      : (isNidCorrection ? '৩ দিন সময়' : service.deliveryTime || service.processingTime || 'তাৎক্ষণিক');

    // ১. আইডি কার্ড সংশোধন ভ্যালিডেশন
    if (isNidCorrection) {
      if (!correctionDetails.trim()) {
        setErrorMsg('অনুগ্রহ করে সংশোধিত তথ্য চাহিদা বিস্তারিত লিখুন।');
        return;
      }
      if (!nidFile) {
        setErrorMsg('অনুগ্রহ করে আইডি কার্ডের ছবি আপলোড করুন।');
        return;
      }
      if (!birthFile) {
        setErrorMsg('অনুগ্রহ করে জন্ম নিবন্ধনের ছবি আপলোড করুন।');
        return;
      }

      compiledInfo = `NID নম্বর: ${nidNumber || 'সংযুক্ত ফাইলে আছে'}\nসংশোধিত তথ্য চাহিদা: ${correctionDetails}\nআইডি কার্ড ছবি: ${nidFile.name}\nজন্ম নিবন্ধন ছবি: ${birthFile.name}`;
      uploadedFilesList = [nidFile.name, birthFile.name];
    }
    // ২. নতুন জন্মনিবন্ধন ভ্যালিডেশন (৬টি ফিল্ড)
    else if (isNewBirth) {
      if (!birthForm.childName.trim()) {
        setErrorMsg('অনুগ্রহ করে বাচ্চার নাম (বাংলা ও ইংরেজি) লিখুন।');
        return;
      }
      if (!birthForm.motherNid.trim()) {
        setErrorMsg('অনুগ্রহ করে মাতার NID / জন্মনিবন্ধন নম্বর লিখুন।');
        return;
      }
      if (!birthForm.fatherNid.trim()) {
        setErrorMsg('অনুগ্রহ করে পিতার NID / জন্মনিবন্ধন নম্বর লিখুন।');
        return;
      }
      if (!birthForm.birthDetails.trim()) {
        setErrorMsg('অনুগ্রহ করে জন্মতারিখ, সময় ও স্থান লিখুন।');
        return;
      }
      if (!birthForm.permanentAddress.trim()) {
        setErrorMsg('অনুগ্রহ করে স্থায়ী ঠিকানা লিখুন।');
        return;
      }
      if (!birthForm.guardianPhone.trim()) {
        setErrorMsg('অনুগ্রহ করে অভিভাবকের ফোন নম্বর লিখুন।');
        return;
      }

      compiledInfo = `বাচ্চার নাম: ${birthForm.childName}\nমাতার NID: ${birthForm.motherNid}\nপিতার NID: ${birthForm.fatherNid}\nজন্মতারিখ/সময়/স্থান: ${birthForm.birthDetails}\nস্থায়ী ঠিকানা: ${birthForm.permanentAddress}\nঅভিভাবকের ফোন: ${birthForm.guardianPhone}`;
    }
    // ৩. সাধারণ সার্ভিস (ডিফল্ট)
    else {
      if (!info.trim()) {
        setErrorMsg(`অনুগ্রহ করে ${labelText} লিখুন।`);
        return;
      }
      compiledInfo = info.trim();
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
          serviceBanglaTitle: service.banglaTitle || service.title,
          info: compiledInfo,
          files: uploadedFilesList,
          fee: currentFee,
          status: 'pending',
          deliveryTime: deliveryTime,
          createdAt: new Date().toLocaleTimeString('bn-BD'),
        };

        if (onOrderPlaced) onOrderPlaced(orderData);
        setCompletedOrder({ 
          id: orderId, 
          info: compiledInfo, 
          fee: currentFee,
          deliveryTime: deliveryTime,
          files: uploadedFilesList 
        });
        triggerToast('অর্ডার গৃহীত হয়েছে!', `${service.banglaTitle || service.title} এর অর্ডার সফলভাবে সাবমিট হয়েছে।`);
      }
    } catch {
      setErrorMsg('সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans">
      {/* সেন্ট্রাল ইনফরমেশন বক্স */}
      <div className="w-full max-w-[440px] bg-white rounded-[28px] shadow-2xl p-6 md:p-7 border border-gray-100 animate-scale-up">
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

            {completedOrder.deliveryTime && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                <Clock size={13} />
                <span>ডেলিভারি: {completedOrder.deliveryTime}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>সেবা:</span>
                <span className="font-bold text-gray-900">{service.banglaTitle || service.title}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>চার্জ কর্তন:</span>
                <span className="font-bold text-[#8000ff]">{completedOrder.fee} ৳</span>
              </div>

              {completedOrder.files && completedOrder.files.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block mb-1">সংযুক্ত ফাইলসমূহ:</span>
                  <div className="space-y-1">
                    {completedOrder.files.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <FileText size={12} className="text-purple-600" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500 block mb-1">প্রদত্ত তথ্য:</span>
                <p className="font-mono bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800 break-words whitespace-pre-line text-[11px]">
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
            <div className="flex items-center gap-3.5 mb-4">
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
                  {service.banglaTitle || service.title}
                </h3>
                <div className="text-[15px] font-bold text-[#8000ff] mt-0.5">
                  চার্জ: {currentFee} ৳
                </div>
              </div>
            </div>

            {/* ডেলিভারি সময় ব্যাজ */}
            {isNewBirth ? (
              <div className="mb-4 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <Sparkles size={14} className="text-emerald-600 shrink-0" />
                <span>২৪ ঘণ্টার মধ্যেই অনলাইন হবে</span>
              </div>
            ) : isNidCorrection ? (
              <div className="mb-4 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2 text-purple-800 text-xs font-semibold">
                <Clock size={14} className="text-purple-600 shrink-0" />
                <span>ডেলিভারি সময়: ৩ দিন</span>
              </div>
            ) : (service.deliveryTime || service.processingTime) ? (
              <div className="mb-4 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-700 text-xs font-semibold">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span>সময়: {service.deliveryTime || service.processingTime}</span>
              </div>
            ) : null}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ২. ফর্ম ইনপুট সেকশন */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* অপশন ১: আইডি কার্ড সংশোধন */}
              {isNidCorrection ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      বর্তমান NID / ভোটার নম্বর (যদি থাকে)
                    </label>
                    <input
                      type="text"
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      placeholder="বর্তমান এনআইডি নম্বর লিখুন..."
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      সংশোধিত তথ্য চাহিদা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={correctionDetails}
                      onChange={(e) => {
                        setCorrectionDetails(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="আইডি কার্ডে কী কী তথ্য সংশোধন করতে চান বিস্তারিত লিখুন..."
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff] resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      আইডি কার্ডের ছবি জমা দিন <span className="text-rose-500">*</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition">
                      <Upload size={16} className="text-purple-600 shrink-0" />
                      <span className="text-xs text-gray-700 truncate">
                        {nidFile ? `✅ ${nidFile.name}` : 'আইডি কার্ডের স্পষ্ট ছবি বা PDF নির্বাচন করুন'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setNidFile(e.target.files[0]);
                            if (errorMsg) setErrorMsg('');
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      জন্ম নিবন্ধনের ছবি জমা দিন <span className="text-rose-500">*</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition">
                      <Upload size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-xs text-gray-700 truncate">
                        {birthFile ? `✅ ${birthFile.name}` : 'জন্ম নিবন্ধনের স্পষ্ট ছবি বা PDF নির্বাচন করুন'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setBirthFile(e.target.files[0]);
                            if (errorMsg) setErrorMsg('');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : isNewBirth ? (
                /* অপশন ২: নতুন জন্মনিবন্ধনের ৬টি ফিল্ড */
                <div className="space-y-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      বাচ্চার নাম (বাংলা ও ইংরেজি) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={birthForm.childName}
                      onChange={(e) => setBirthForm({ ...birthForm, childName: e.target.value })}
                      placeholder="বাচ্চার পূর্ণ নাম বাংলা ও ইংরেজিতে লিখুন"
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-medium text-gray-700 block mb-1">
                        মাতার NID / জন্মনিবন্ধন নম্বর <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={birthForm.motherNid}
                        onChange={(e) => setBirthForm({ ...birthForm, motherNid: e.target.value })}
                        placeholder="মাতার এনআইডি/জন্মনিবন্ধন"
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-gray-700 block mb-1">
                        পিতার NID / জন্মনিবন্ধন নম্বর <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={birthForm.fatherNid}
                        onChange={(e) => setBirthForm({ ...birthForm, fatherNid: e.target.value })}
                        placeholder="পিতার এনআইডি/জন্মনিবন্ধন"
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      জন্মতারিখ, সময় ও স্থান <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={birthForm.birthDetails}
                      onChange={(e) => setBirthForm({ ...birthForm, birthDetails: e.target.value })}
                      placeholder="তারিখ, সময় ও হাসপাতালের নাম/স্থান"
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      স্থায়ী ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={birthForm.permanentAddress}
                      onChange={(e) => setBirthForm({ ...birthForm, permanentAddress: e.target.value })}
                      placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা"
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-gray-700 block mb-1">
                      অভিভাবকের ফোন নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={birthForm.guardianPhone}
                      onChange={(e) => setBirthForm({ ...birthForm, guardianPhone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff]"
                      required
                    />
                  </div>
                </div>
              ) : (
                /* অপশন ৩: সাধারণ ডিফল্ট সার্ভিস (সার্ভার কপি, সাইন কপি ইত্যাদি) */
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
              )}

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
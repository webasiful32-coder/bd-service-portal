import React, { useState, useEffect } from 'react';
import { ServiceType, BirthCertificateInput, DeathCertificateInput, NIDInput, LocationTrackerState, SMSBomberState, DeviceLockState } from '../types';
import { SYSTEM_SERVICES, MOCK_OWNER_NAMES, MOCK_LOCATIONS, MOCK_HANDSETS, SIGNATURE_SAMPLES } from '../data';
import { BirthCertificateDoc, DeathCertificateDoc, NIDCardDoc, TinCertificateDoc, ServerCopyDoc, ZeroTaxDoc, GenericCertDoc } from './OfficialDocuments';
import { Smartphone, CheckCircle, Search, Server, User, HelpCircle, FileText, Compass, AlertCircle, Play, ShieldAlert, Terminal, Lock, MapPin } from 'lucide-react';

interface ServiceViewsProps {
  activeServiceId: ServiceType;
  walletBalance: number;
  deductFee: (amount: number, service: any) => boolean | Promise<boolean>;
  onBack: () => void;
  triggerToast: (title: string, message: string) => void;
  openWallet?: () => void;
}

export default function ServiceViews({ activeServiceId, walletBalance, deductFee, onBack, triggerToast, openWallet }: ServiceViewsProps) {
  const service = SYSTEM_SERVICES.find(s => s.id === activeServiceId);
  const [outputDoc, setOutputDoc] = useState<{ type: string; data: any } | null>(null);

  // Auto field generators
  const generateRandomNID = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };
  const generateRandomBirth = () => {
    const year = Math.floor(1980 + Math.random() * 40);
    const middle = Math.floor(100000 + Math.random() * 900000).toString();
    const last = Math.floor(100000 + Math.random() * 900000).toString();
    return `${year}${middle}${last}`;
  };

  // State managers
  // A. Birth Form
  const [birthInput, setBirthInput] = useState<BirthCertificateInput>({
    regNo: '',
    dob: '',
    nameBangla: '',
    nameEnglish: '',
    fatherBangla: '',
    fatherEnglish: '',
    motherBangla: '',
    motherEnglish: '',
    birthPlaceBangla: '',
    birthPlaceEnglish: ''
  });

  // B. Death Form
  const [deathInput, setDeathInput] = useState<DeathCertificateInput>({
    regNo: '',
    deathDate: '',
    nameBangla: '',
    nameEnglish: '',
    fatherBangla: '',
    motherBangla: '',
    spouseBangla: '',
    deathPlaceBangla: '',
    deathPlaceEnglish: '',
    cause: ''
  });

  // C. NID Form
  const [nidInput, setNidInput] = useState<NIDInput>({
    nidNo: '',
    pin: '' + Math.floor(100000000 + Math.random() * 900000000).toString(),
    nameBangla: '',
    nameEnglish: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    dob: '',
    bloodGroup: '',
    birthPlace: '',
    address: '',
    photoUrl: ''
  });

  // Special services parameters
  const [genericPhone, setGenericPhone] = useState<string>('');
  const [genericNIDText, setGenericNIDText] = useState<string>(generateRandomNID());
  const [genericIMEI, setGenericIMEI] = useState<string>('');
  const [activeMFSProvider, setActiveMFSProvider] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');

  // Interactive Tracker states
  const [trackingState, setTrackingState] = useState<LocationTrackerState>({
    phone: '', isTracking: false, progress: 0, latitude: 0, longitude: 0,
    operator: '', signalStrength: '', locationName: '', cellId: ''
  });

  // Interactive Bomber states
  const [bomberState, setBomberState] = useState<SMSBomberState>({
    phone: '', count: 100, sentCount: 0, isBombing: false, logs: []
  });

  // Device Simulation States
  const [lockState, setLockState] = useState<DeviceLockState>({
    phone: '', message: 'আপনার বিকাশ পেমেন্ট বকেয়া থাকায় মোবাইলটি লক করা হয়েছে। অবিলম্বে বকেয়া পরিশোধ করে বিকাশ নাম্বারে যোগাযোগ করুন।',
    bkashNumber: '', amount: '5,000', isLockedSimulation: false
  });

  // Simple OTP Bypass state
  const [otpBypassState, setOtpBypassState] = useState({
    birthRegNo: '', prevPhone: '01700-000000', newPhone: '', status: 'idle', logs: [] as string[]
  });

  // General fallback form inputs state
  const [genericInputs, setGenericInputs] = useState<Record<string, string>>({});

  const getGenericFieldsForCategory = (category: string) => {
    switch (category) {
      case 'certificate':
      case 'cert':
        return [
          { name: 'fullName', label: 'আবেদনকারীর নাম (Full Name)', type: 'text', required: true, placeholder: '' },
          { name: 'fatherName', label: 'পিতার নাম (Father\'s Name)', type: 'text', required: true, placeholder: '' },
          { name: 'nidNo', label: 'জাতীয় পরিচয়পত্র নম্বর (NID)', type: 'text', required: true, placeholder: '' },
          { name: 'mobile', label: 'মোবাইল নম্বর (Mobile Number)', type: 'text', required: true, placeholder: '' },
          { name: 'address', label: 'স্থায়ী ঠিকানা (Permanent Address)', type: 'textarea', required: true, placeholder: '' },
          { name: 'purpose', label: 'আবেদনের কারণ (Purpose)', type: 'text', required: false, placeholder: '' }
        ];
      case 'land':
        return [
          { name: 'ownerName', label: 'জমির মালিকের নাম (Owner Name)', type: 'text', required: true, placeholder: '' },
          { name: 'khationNo', label: 'খতিয়ান নম্বর (Khation Ledger No)', type: 'text', required: true, placeholder: '' },
          { name: 'dagNo', label: 'দাগ নম্বর (Plot Dag No)', type: 'text', required: true, placeholder: '' },
          { name: 'mouza', label: 'মৌজা ও জে এল নম্বর (Mouza & J.L No)', type: 'text', required: true, placeholder: '' },
          { name: 'district', label: 'জেলা ও উপজেলা (District & Upazila)', type: 'text', required: true, placeholder: '' }
        ];
      case 'education':
        return [
          { name: 'studentName', label: 'শিক্ষার্থীর নাম (Student Name)', type: 'text', required: true, placeholder: '' },
          { name: 'boardName', label: 'শিক্ষা বোর্ড (Board Name)', type: 'text', required: true, placeholder: '' },
          { name: 'rollNo', label: 'রোল নম্বর (Exam Roll Number)', type: 'text', required: true, placeholder: '' },
          { name: 'regNo', label: 'রেজিস্ট্রেশন নম্বর (Registration Number)', type: 'text', required: true, placeholder: '' },
          { name: 'examYear', label: 'পরীক্ষার বছর (Exam Year)', type: 'text', required: true, placeholder: '' }
        ];
      case 'trade':
        return [
          { name: 'proprietorName', label: 'মালিক/প্রোপাইটারের নাম (Proprietor Name)', type: 'text', required: true, placeholder: '' },
          { name: 'businessName', label: 'ব্যবসা প্রতিষ্ঠানের নাম (Business Trade Name)', type: 'text', required: true, placeholder: '' },
          { name: 'businessAddress', label: 'ব্যবসার ঠিকানা (Business Address)', type: 'text', required: true, placeholder: '' },
          { name: 'sectorType', label: 'ব্যবসার ধরন (Sector / Category)', type: 'text', required: true, placeholder: '' }
        ];
      default:
        return [
          { name: 'fullName', label: 'পূর্ণ নাম (Full Name)', type: 'text', required: true, placeholder: '' },
          { name: 'phoneNo', label: 'মোবাইল নম্বর (Phone / NID)', type: 'text', required: true, placeholder: '' },
          { name: 'reference', label: 'রেফারেন্স / ট্র্যাকিং নম্বর (Reference Key)', type: 'text', required: true, placeholder: '' },
          { name: 'notes', label: 'অতিরিক্ত বিবরণ ও মন্তব্য (Additional Notes)', type: 'textarea', required: false, placeholder: '' }
        ];
    }
  };

  const handleGenericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chargeFee = service?.fee || 50;
    handleVerifyService(service?.banglaTitle || service?.title || 'Citizen service portal', chargeFee, () => {
      setOutputDoc({ type: 'generic', data: { ...genericInputs } });
    });
  };

  const autofillGenericSample = () => {
    const category = service?.category || 'all';
    const sampleData: Record<string, string> = {};
    if (category === 'certificate') {
      sampleData.fullName = '';
      sampleData.fatherName = '';
      sampleData.nidNo = '';
      sampleData.mobile = '';
      sampleData.address = '';
      sampleData.purpose = '';
    } else if (category === 'land') {
      sampleData.ownerName = '';
      sampleData.khationNo = '';
      sampleData.dagNo = '';
      sampleData.mouza = '';
      sampleData.district = '';
    } else if (category === 'education') {
      sampleData.studentName = '';
      sampleData.boardName = '';
      sampleData.rollNo = '';
      sampleData.regNo = '';
      sampleData.examYear = '';
    } else if (category === 'trade') {
      sampleData.proprietorName = '';
      sampleData.businessName = '';
      sampleData.businessAddress = '';
      sampleData.sectorType = '';
    } else {
      sampleData.fullName = '';
      sampleData.phoneNo = '';
      sampleData.reference = '';
      sampleData.notes = '';
    }
    setGenericInputs(sampleData);
    triggerToast('Demo Data Instated', 'Form fields auto-filled successfully.');
  };

  const autofillDemoData = (type: 'birth' | 'death' | 'nid') => {
    if (type === 'birth') {
      setBirthInput({
        regNo: generateRandomBirth(),
        dob: '',
        nameBangla: '',
        nameEnglish: '',
        fatherBangla: '',
        fatherEnglish: '',
        motherBangla: '',
        motherEnglish: '',
        birthPlaceBangla: '',
        birthPlaceEnglish: ''
      });
      triggerToast('Demo Data Instated', 'Birth registry form auto-filled.');
    } else if (type === 'death') {
      setDeathInput({
        regNo: generateRandomBirth(),
        deathDate: '',
        nameBangla: '',
        nameEnglish: '',
        fatherBangla: '',
        motherBangla: '',
        spouseBangla: '',
        deathPlaceBangla: '',
        deathPlaceEnglish: '',
        cause: 'Cardiac Arrest / হৃদযন্ত্রের ক্রিয়া বন্ধ হয়ে'
      });
      triggerToast('Demo Data Instated', 'Death certificate template loaded.');
    } else if (type === 'nid') {
      setNidInput({
        nidNo: generateRandomNID(),
        pin: '' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        nameBangla: '',
        nameEnglish: '',
        fatherName: '',
        motherName: '',
        spouseName: '',
        dob: '',
        bloodGroup: '',
        birthPlace: '',
        address: '',
        photoUrl: ''
      });
      triggerToast('Demo Data Instated', 'Smart ID visual fields updated.');
    }
  };

  // Execution verification
  const handleVerifyService = async (serviceName: string, fee: number, compileCallback: () => void) => {
    if (walletBalance < fee) {
      alert(`অপ্রতুল ব্যালেন্স! এই সার্ভিস চার্জ: ${fee} BDT। আপনার ওয়ালেটে পর্যাপ্ত এড মানি (Bkash/Nagad) করুন।`);
      if (openWallet) {
        openWallet();
      }
      return;
    }
    const approved = await deductFee(fee, service);
    if (approved) {
      triggerToast('Request Accepted', `Executing encrypted server handshake... [Charged ${fee} BDT]`);
      compileCallback();
    }
  };

  // Tracking simulator algorithm
  useEffect(() => {
    let timer: any;
    if (trackingState.isTracking && trackingState.progress < 100) {
      timer = setTimeout(() => {
        const nextProgress = trackingState.progress + 15;
        const boundedProgress = nextProgress > 100 ? 100 : nextProgress;
        
        let update: Partial<LocationTrackerState> = { progress: boundedProgress };
        
        if (boundedProgress === 45) {
          const rLoc = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)] || { lat: 23.8759, lng: 90.3795, name: 'Uttara Sector 10, Dhaka' };
          const operators = ['Grameenphone Ltd.', 'Robi Axiata BSC', 'Banglalink Digital', 'Teletalk Bangladesh'];
          update = {
            ...update,
            latitude: rLoc.lat + (Math.random() - 0.5) * 0.002,
            longitude: rLoc.lng + (Math.random() - 0.5) * 0.002,
            locationName: rLoc.name,
            operator: operators[Math.floor(Math.random() * operators.length)],
            signalStrength: `${Math.floor(75 + Math.random() * 20)} dBm (Stable)`,
            cellId: `LAC-4921 / CID-${Math.floor(1000 + Math.random() * 9000)}`
          };
        }
        
        setTrackingState(prev => ({ ...prev, ...update }));
      }, 700);
    } else if (trackingState.isTracking && trackingState.progress >= 100) {
      setTrackingState(prev => ({ ...prev, isTracking: false }));
      triggerToast('GSM Tracking Online', `Phone location pinpointed: ${trackingState.locationName}`);
    }
    return () => clearTimeout(timer);
  }, [trackingState.isTracking, trackingState.progress]);

  // Bomber simulator threads
  useEffect(() => {
    let timer: any;
    if (bomberState.isBombing && bomberState.sentCount < bomberState.count) {
      timer = setTimeout(() => {
        const nextCount = bomberState.sentCount + 1;
        const bdWebsites = ['bkash.com/otp-api', 'nagad.org/send-sms', 'gp-flexiplan/sms-request', 'daraz.com.bd/otp-verify', 'rabbitholebd.com/login-otp', 'rokomari.com/signup-sms'];
        const apiName = bdWebsites[Math.floor(Math.random() * bdWebsites.length)];
        const newLog = `[API Thread-03] Sent payload stream successfully via ${apiName} -> Status 200 OK`;
        
        setWithTimerAndLogs(nextCount, newLog);
      }, 150);
    } else if (bomberState.isBombing && bomberState.sentCount >= bomberState.count) {
      setBomberState(prev => ({ ...prev, isBombing: false }));
      triggerToast('Stress-Test Completed', `Simulation stream successfully launched on ${bomberState.phone}`);
    }
    return () => clearTimeout(timer);
  }, [bomberState.isBombing, bomberState.sentCount]);

  const setWithTimerAndLogs = (nextCount: number, newLog: string) => {
    setBomberState(prev => ({
      ...prev,
      sentCount: nextCount,
      logs: [newLog, ...prev.logs.slice(0, 15)]
    }));
  };

  // OTP Bypass simulator threads
  const runOtpBypass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpBypassState.birthRegNo || !otpBypassState.newPhone) {
      alert('Input Registry No and Target Phone number.');
      return;
    }

    handleVerifyService('OTP Bypass override', 15, () => {
      setOtpBypassState(prev => ({ ...prev, status: 'running', logs: ['Initializing registry bypass inject...'] }));
      
      const stepLogs = [
        'Connecting to local Union administrative portal proxy...',
        'Intercepting SMS overlimit countdown timers (Cooldown Override)...',
        'Hashing temporary clearance token key...',
        'Injecting alternative mobile portal redirection port...',
        'Mapping target number: APPROVED bypass successful!'
      ];

      stepLogs.forEach((log, index) => {
        setTimeout(() => {
          setOtpBypassState(prev => ({
            ...prev,
            logs: [...prev.logs, log],
            status: index === stepLogs.length - 1 ? 'completed' : 'running'
          }));
        }, (index + 1) * 900);
      });
    });
  };

  // Render official document copies
  if (outputDoc) {
    if (outputDoc.type === 'birth') return <BirthCertificateDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'death') return <DeathCertificateDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'nid' || outputDoc.type === 'smart') return <NIDCardDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'tin') return <TinCertificateDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'server') return <ServerCopyDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'zero_tax') return <ZeroTaxDoc data={outputDoc.data} onBack={() => setOutputDoc(null)} />;
    if (outputDoc.type === 'generic') return <GenericCertDoc data={outputDoc.data} serviceTitle={service?.banglaTitle || service?.title || 'Citizen Service Output'} onBack={() => setOutputDoc(null)} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-150 shadow-lg p-6 min-h-[500px]">
      {/* Title ribbon bar */}
      <div className="flex justify-between items-center pb-4 border-b border-purple-100 mb-6">
        <div>
          <span className="text-[10px] font-bold text-pink-500 uppercase font-mono tracking-wider">Service Terminal</span>
          <h2 className="text-xl font-extrabold text-purple-950 font-sans tracking-tight">{service?.banglaTitle} / {service?.title}</h2>
        </div>
        <button
          onClick={onBack}
          className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs py-1.5 px-3 rounded-lg font-semibold cursor-pointer"
        >
          Exit System
        </button>
      </div>

      {/* 1. AUTO BIRTH CERTIFICATE BUILDER */}
      {(activeServiceId === 'auto_birth' || activeServiceId === 'new-birth-reg') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Provide official details to generate complete Green Bordered Bilingual birth duplicate PDF.</p>
            <button
              onClick={() => autofillDemoData('birth')}
              className="text-xs bg-purple-50 text-purple-700 font-bold py-1 px-3.5 rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer"
            >
              Autofill Sample (টেস্ট ডেটা ফিলাপ)
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyService('Birth Registration Creator', service?.fee || 30, () => setOutputDoc({ type: 'birth', data: birthInput }));
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Birth Registration No (১৭ ডিজিট নম্বর)</label>
              <input
                type="text" required maxLength={17}
                value={birthInput.regNo}
                onChange={(e) => setBirthInput(prev => ({ ...prev, regNo: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Date of Birth (জন্ম তারিখ)</label>
              <input
                type="text" required placeholder="DD/MM/YYYY"
                value={birthInput.dob}
                onChange={(e) => setBirthInput(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name Bangla (আবেদনকারীর নাম - বাংলা)</label>
              <input
                type="text" required
                value={birthInput.nameBangla}
                onChange={(e) => setBirthInput(prev => ({ ...prev, nameBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name English (ইংরেজিতে CAPITAL LETTER)</label>
              <input
                type="text" required
                value={birthInput.nameEnglish}
                onChange={(e) => setBirthInput(prev => ({ ...prev, nameEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono uppercase text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Father's Name Bangla (পিতার নাম - বাংলা)</label>
              <input
                type="text" required
                value={birthInput.fatherBangla}
                onChange={(e) => setBirthInput(prev => ({ ...prev, fatherBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Father's Name Eng (পিতার নাম - ইংরেজি)</label>
              <input
                type="text" required
                value={birthInput.fatherEnglish}
                onChange={(e) => setBirthInput(prev => ({ ...prev, fatherEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Mother's Name Bangla (মাতার নাম - বাংলা)</label>
              <input
                type="text" required
                value={birthInput.motherBangla}
                onChange={(e) => setBirthInput(prev => ({ ...prev, motherBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Mother's Name Eng (মাতার নাম - ইংরেজি)</label>
              <input
                type="text" required
                value={birthInput.motherEnglish}
                onChange={(e) => setBirthInput(prev => ({ ...prev, motherEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Birth Place Details Bangla (জন্মস্থানের ঠিকানা - বাংলা)</label>
              <input
                type="text" required
                value={birthInput.birthPlaceBangla}
                onChange={(e) => setBirthInput(prev => ({ ...prev, birthPlaceBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Birth Place Details Eng (জন্মস্থানের ঠিকানা - ইংরেজি)</label>
              <input
                type="text" required
                value={birthInput.birthPlaceEnglish}
                onChange={(e) => setBirthInput(prev => ({ ...prev, birthPlaceEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all md:mt-2 block cursor-pointer"
            >
              Generate Birth Certificate Copy (সনদপত্র ডাউনলোড) [Fee: {service?.fee || 30} BDT]
            </button>
          </form>
         </div>
      )}

      {/* 2. AUTO DEATH CERTIFICATE BUILDER */}
      {(activeServiceId === 'auto_death' || activeServiceId === 'death-certificate') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Fill standard fields to construct official Union Parishad Death Certificate duplicates.</p>
            <button
              onClick={() => autofillDemoData('death')}
              className="text-xs bg-purple-50 text-purple-700 font-bold py-1 px-3.5 rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer"
            >
              Autofill Sample (টেস্ট ডেটা ফিলাপ)
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyService('Death Registration Creator', service?.fee || 30, () => setOutputDoc({ type: 'death', data: deathInput }));
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Death Registration No (১৭ ডিজিট নম্বর)</label>
              <input
                type="text" required maxLength={17}
                value={deathInput.regNo}
                onChange={(e) => setDeathInput(prev => ({ ...prev, regNo: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Date of Death (মৃত্যুর তারিখ)</label>
              <input
                type="text" required placeholder="DD/MM/YYYY"
                value={deathInput.deathDate}
                onChange={(e) => setDeathInput(prev => ({ ...prev, deathDate: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name Bangla (মৃত ব্যক্তির নাম - বাংলা)</label>
              <input
                type="text" required
                value={deathInput.nameBangla}
                onChange={(e) => setDeathInput(prev => ({ ...prev, nameBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name Eng (মৃত ব্যক্তির নাম - ইংরেজি)</label>
              <input
                type="text" required
                value={deathInput.nameEnglish}
                onChange={(e) => setDeathInput(prev => ({ ...prev, nameEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Father's Name (পিতার নাম)</label>
              <input
                type="text" required
                value={deathInput.fatherBangla}
                onChange={(e) => setDeathInput(prev => ({ ...prev, fatherBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Mother's Name (মাতার নাম)</label>
              <input
                type="text" required
                value={deathInput.motherBangla}
                onChange={(e) => setDeathInput(prev => ({ ...prev, motherBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-gray-600 block mb-1">Spouse Name (স্বামী বা স্ত্রীর নাম)</label>
              <input
                type="text" placeholder="বাধ্যতামূলক নয়"
                value={deathInput.spouseBangla}
                onChange={(e) => setDeathInput(prev => ({ ...prev, spouseBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-gray-600 block mb-1">Cause of Death (মৃত্যুর প্রধান কারণ)</label>
              <input
                type="text" required
                value={deathInput.cause}
                onChange={(e) => setDeathInput(prev => ({ ...prev, cause: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Death Location Bangla (মৃত্যু স্থান - বাংলা)</label>
              <input
                type="text" required
                value={deathInput.deathPlaceBangla}
                onChange={(e) => setDeathInput(prev => ({ ...prev, deathPlaceBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all md:mt-2 block cursor-pointer"
            >
              Generate Death Certificate (মৃত্যু সনদপত্র ডাউনলোড) [Fee: 30 BDT]
            </button>
          </form>
        </div>
      )}

      {/* 3. BIRTH / CORRECTION APPLICATION COPY EXTRACTIONS */}
      {(activeServiceId === 'birth_copy' || activeServiceId === 'birth-copy' || activeServiceId === 'birth_correction' || activeServiceId === 'birth-correction' || activeServiceId === 'birth_application' || activeServiceId === 'information_correction') && (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-xs text-gray-500">Input application registration ID tracking key to construct official submitted receipt formats.</p>
          
          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Submitted Application ID (আবেদন আইডি নম্বর)</label>
              <input
                type="text" placeholder=""
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Registered Phone Partner (যে নাম্বার দিয়ে আবেদন করেছেন)</label>
              <input
                type="tel" placeholder=""
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
              />
            </div>
            
            <button
              onClick={() => {
                handleVerifyService('Application Extractions', service?.fee || 35, () => {
                  triggerToast('Matched Tracker', 'Online tracking verification matched. Showing generated copy receipt format!');
                  setOutputDoc({ type: 'birth', data: birthInput });
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Fetch & Compile submitted Form Copy [Fee: {service?.fee || 35} BDT]
            </button>
          </div>
        </div>
      )}

      {/* 4. REVERSE LOOKUPS (BIRTH BY NID & NID BY BIRTH) */}
      {(activeServiceId === 'birth_by_nid' || activeServiceId === 'nid_by_birth') && (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            Matches verified biometrics archives to extract cross-database credential links (NID to Birth registry or vice-versa).
          </p>

          <div className="p-5 border rounded-2xl bg-purple-50/20 space-y-4">
            {activeServiceId === 'birth_by_nid' ? (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Enter National NID Number (এনআইডি কার্ড নম্বর)</label>
                <input
                  type="text" placeholder=""
                  value={genericNIDText}
                  onChange={(e) => setGenericNIDText(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Enter Birth Certificate ID (১৭ ডিজিট জন্ম নিবন্ধন)</label>
                <input
                  type="text" placeholder=""
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Date of Birth (DOB)</label>
              <input
                type="text" placeholder="DD/MM/YYYY" defaultValue=""
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
              />
            </div>

            <button
              onClick={() => {
                handleVerifyService('Cross-Database Lookup', 25, () => {
                  alert('Database cross-references match found! Compiling matching certificate data.');
                  setOutputDoc({ type: activeServiceId === 'birth_by_nid' ? 'birth' : 'nid', data: { ...birthInput, ...nidInput } });
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Analyze Records & Output Certificate copy [Fee: 25 BDT]
            </button>
          </div>
        </div>
      )}

      {/* 5. NID CARD GENERATORS (PDF, SMART COPIER, SERVER COPY) */}
      {(['nid_by_no', 'smart_nid', 'server_copy', 'sign_copy', 'sajib_copy', 'official_server_copy', 'nid_form_no', 'nid_correction', 'nid_address_change',
        'server-copy', 'sign-copy', 'nid-pdf', 'form-sign-copy', 'nid-voter-number', 'official-server-copy', 'nid-correction', 'nid-address-change', 'smart-id-card'
       ].includes(activeServiceId)) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Provide official identity variables to compile standard or smart voter card duplicates.</p>
            <button
              onClick={() => autofillDemoData('nid')}
              className="text-xs bg-purple-50 text-purple-700 font-bold py-1 px-3.5 rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer"
            >
              Autofill Sample (টেস্ট ডেটা ফিলাপ)
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const chargeFee = service?.fee || 20;
              const isServerCopy = ['server_copy', 'server-copy', 'sajib_copy', 'official_server_copy', 'official-server-copy', 'nid_form_no', 'form-sign-copy', 'nid-voter-number'].includes(activeServiceId);
              const typeOutput = isServerCopy ? 'server' : 'nid';
              handleVerifyService('NID Builder', chargeFee, () => setOutputDoc({ type: typeOutput, data: nidInput }));
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">NID Number (এনআইডি নম্বর)</label>
              <input
                type="text" required maxLength={13}
                value={nidInput.nidNo}
                onChange={(e) => setNidInput(prev => ({ ...prev, nidNo: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Voter ID pin / Ration Number</label>
              <input
                type="text" required
                value={nidInput.pin}
                onChange={(e) => setNidInput(prev => ({ ...prev, pin: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name Bangla (নাম - বাংলা)</label>
              <input
                type="text" required
                value={nidInput.nameBangla}
                onChange={(e) => setNidInput(prev => ({ ...prev, nameBangla: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Name English (ইংরেজিতে CAPITAL LETTER)</label>
              <input
                type="text" required
                value={nidInput.nameEnglish}
                onChange={(e) => setNidInput(prev => ({ ...prev, nameEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono uppercase text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Father's Name (পিতার নাম)</label>
              <input
                type="text" required
                value={nidInput.fatherName}
                onChange={(e) => setNidInput(prev => ({ ...prev, fatherName: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Mother's Name (মাতার নাম)</label>
              <input
                type="text" required
                value={nidInput.motherName}
                onChange={(e) => setNidInput(prev => ({ ...prev, motherName: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Date of Birth (DOB) and Blood Group</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" placeholder="DD/MM/YYYY" required
                  value={nidInput.dob}
                  onChange={(e) => setNidInput(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
                />
                <select
                  value={nidInput.bloodGroup}
                  onChange={(e) => setNidInput(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="bg-white border border-gray-200 rounded-xl py-2 px-2 text-xs font-mono text-gray-800 focus:outline-none"
                >
                  <option value="A+">A+ (Positive)</option>
                  <option value="B+">B+ (Positive)</option>
                  <option value="AB+">AB+ (Positive)</option>
                  <option value="O+">O+ (Positive)</option>
                  <option value="A-">A- (Negative)</option>
                  <option value="B-">B- (Negative)</option>
                  <option value="O-">O- (Negative)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Upload Photo URL (অথবা ফেস ফটো ফিলাপ করুন)</label>
              <input
                type="text" placeholder="https://..."
                value={nidInput.photoUrl}
                onChange={(e) => setNidInput(prev => ({ ...prev, photoUrl: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Full Permanent Address (ঠিকানা - ভোটার বিন্যাস অনুযায়ী)</label>
              <textarea
                rows={2} required
                value={nidInput.address}
                onChange={(e) => setNidInput(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Generate National Card duplicate copy [Fee: {service?.fee || 20} BDT]
            </button>
          </form>
        </div>
      )}

      {/* 6. SIM AND TELEMETRY OWNERSHIP QUERIES */}
      {(['owner_by_phone', 'sim_biometric', 'sim-biometric', 'sms_list', 'sms-list', 'call_list', 'call-list', 'bKash_info', 'bkash-info', 'nagad_info', 'nagad-info', 'rocket_info', 'rocket-info'].includes(activeServiceId)) && (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-xs text-gray-500">Query mobile operator subscription database to verify SIM owner demographics details.</p>
          
          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Target Bangladesh Phone Number (মোবাইল নম্বর)</label>
              <input
                type="tel" maxLength={11} value={genericPhone}
                onChange={(e) => setGenericPhone(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                handleVerifyService('Owner Check', service?.fee || 49, () => {
                  const randomName = MOCK_OWNER_NAMES[Math.floor(Math.random() * MOCK_OWNER_NAMES.length)];
                  const nidMask = `492***${Math.floor(1000 + Math.random() * 9000)}`;
                  triggerToast('Database Sync Perfect', `Number: ${genericPhone} \nOwner Name: ${randomName} \nLinked NID: ${nidMask} \nAddress: GP Sector Block, Dhaka.`);
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Extract SIM Owner Record [Fee: {service?.fee || 49} BDT]
            </button>
          </div>
        </div>
      )}

      {/* SIM COUNT BY NID */}
      {activeServiceId === 'sims_by_nid' && (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-xs text-gray-550">Pull total cellular SIM card registrations mapped to of specified NID credentials.</p>
          
          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Enter National NID Code (১২ বা ১৭ ডিজিট)</label>
              <input
                type="text" placeholder=""
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono"
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                handleVerifyService('SIM Count lookup', service?.fee || 15, () => {
                  const grp = Math.floor(1 + Math.random()*3);
                  const rob = Math.floor(1 + Math.random()*3);
                  const bl = Math.floor(Math.random()*2);
                  const air = Math.floor(Math.random()*2);
                  triggerToast('Verification Success', `Total registered: ${grp + rob + bl + air} SIMs (- GP: ${grp}, - Robi: ${rob}, - BL: ${bl}, - Airtel/Teletalk: ${air})`);
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Scan Mapped SIM Register count [Fee: 15 BDT]
            </button>
          </div>
        </div>
      )}

      {/* IMEI AND ACTIVE SIM RECOVERY */}
      {(activeServiceId === 'phone_imei' || activeServiceId === 'sim_by_imei') && (
        <div className="space-y-4 max-w-lg mx-auto font-sans">
          <p className="text-xs text-gray-550 leading-relaxed">
            Checks target handset details, brand hardware models, or current active telephone numbers mapped to an IMEI portal.
          </p>

          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            {activeServiceId === 'phone_imei' ? (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Enter Target Mobile Number (মোবাইল নম্বর)</label>
                <input
                  type="tel" value={genericPhone} onChange={(e) => setGenericPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Enter Device IMEI Code (১৫ ডিজিট)</label>
                <input
                  type="text" value={genericIMEI} onChange={(e) => setGenericIMEI(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
                />
              </div>
            )}

            <button
              onClick={() => {
                handleVerifyService('Handset Core Query', 20, () => {
                  const randomSet = MOCK_HANDSETS[Math.floor(Math.random() * MOCK_HANDSETS.length)];
                  if (activeServiceId === 'phone_imei') {
                    alert(`[Handset Trace Matched]\nNumber: ${genericPhone}\nDevice Connected: ${randomSet.brand} ${randomSet.model}\nIMEI 1: ${randomSet.imei1}\nIMEI 2: ${randomSet.imei2}\nActivation status: ONLINE`);
                  } else {
                    alert(`[IMEI Active Cell lookup]\nHandset: ${randomSet.brand} ${randomSet.model}\nRegistered IMEI: ${genericIMEI}\nDetected active SIM inside: 017${Math.floor(10000000 + Math.random()*89999999)}`);
                  }
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Examine Cellular Serial Records [Fee: 20 BDT]
            </button>
          </div>
        </div>
      )}

      {/* CALL LOG EXTRACTOR */}
      {activeServiceId === 'call_list' && (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">Runs dynamic tower log queries on target number coordinates to generate mock call listings.</p>
          
          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Target Phone Number</label>
              <input type="tel" defaultValue="01712345678" className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Start Date</label>
                <input type="date" className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[10px]" defaultValue="2026-05-01" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">End Date</label>
                <input type="date" className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[10px]" defaultValue="2026-05-31" />
              </div>
            </div>

            <button
              onClick={() => {
                handleVerifyService('Call list extractor', 25, () => {
                  alert('[Tracing logs successful!]\nCompiled list of recent tower hops, connection durations, and billing statuses generated. Sent to system printer view!');
                  setOutputDoc({ type: 'server', data: nidInput });
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Generate printable Call list sheet [Fee: 25 BDT]
            </button>
          </div>
        </div>
      )}

      {/* MFS OWNER PROFILE TRACKER */}
      {activeServiceId === 'mfs_checker' && (
        <div className="space-y-4 max-w-lg mx-auto font-sans">
          <p className="text-xs text-gray-500 leading-relaxed">
            Verify payment agent profiles on file at bKash/Nagad registers to discover underlying registration NID identities.
          </p>

          <div className="p-4 border rounded-xl bg-purple-50/50 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad'] as const).map(op => (
                <button
                  key={op} type="button" onClick={() => setActiveMFSProvider(op)}
                  className={`py-2 text-xs border rounded-lg font-semibold cursor-pointer ${
                    activeMFSProvider === op ? 'border-purple-600 bg-purple-50 text-purple-700' : 'bg-white'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Target Wallet account Number (MFS নম্বর)</label>
              <input
                type="tel" maxLength={11} defaultValue=""
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono"
              />
            </div>

            <button
              onClick={() => {
                handleVerifyService('MFS checking', 20, () => {
                  const randomName = MOCK_OWNER_NAMES[Math.floor(Math.random() * MOCK_OWNER_NAMES.length)];
                  alert(`[MFS KYC MATCHED]\nMobile: 01712345678\nOperator: ${activeMFSProvider} Verified wallet\nOwner: ${randomName}\nVerification Status: HIGH INTEGRITY`);
                });
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Query MFS owner registry [Fee: 20 BDT]
            </button>
          </div>
        </div>
      )}

      {/* 7. LIVE CELLULAR CO-ORDINATES TRACKING MAPS PANEL */}
      {(activeServiceId === 'location_tracker' || activeServiceId === 'number_to_location' || activeServiceId === 'number-location' || activeServiceId === 'live-location') && (
        <div className="space-y-4">
          <p className="text-xs text-gray-550">GSM signal triangulation maps. Enter target phone to establish coordinates vector.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50/50 border rounded-xl h-fit space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Target Phone Number</label>
                <input
                  type="tel" placeholder=""
                  value={trackingState.phone}
                  onChange={(e) => setTrackingState(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono"
                />
              </div>

              <button
                onClick={() => {
                  if (!trackingState.phone.match(/^01[3-9]\d{8}$/)) {
                    triggerToast('Invalid Number', 'Please enter a valid 11-digit mobile number.');
                    return;
                  }
                  handleVerifyService('GPS Tracking', service?.fee || 25, () => {
                    setTrackingState(prev => ({
                      ...prev,
                      isTracking: true,
                      progress: 0,
                      latitude: 0,
                      longitude: 0,
                      locationName: ''
                    }));
                  });
                }}
                disabled={trackingState.isTracking}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {trackingState.isTracking ? 'Triangulating GSM signal...' : `Start Locate Tracking [Fee: ${service?.fee || 25} BDT]`}
              </button>
            </div>

            <div className="md:col-span-2 bg-slate-900 text-slate-100 rounded-2xl h-[340px] relative overflow-hidden shadow-inner flex flex-col justify-between">
              {/* Maps visual background Grid mock tracker */}
              <div className="absolute inset-0 z-0 opacity-15 bg-radial from-transparent to-black pointer-events-none">
                <div className="w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Live Tracking overlay display details */}
              <div className="p-3 bg-slate-950/85 border-b border-slate-800 flex justify-between items-center text-[10px] font-mono z-10">
                <span className="flex items-center gap-1"><Compass className="animate-spin text-purple-400" size={12} /> GSM TELEMETRY FEED</span>
                {trackingState.isTracking && <span className="text-amber-400 font-bold animate-pulse">LOCKING IN SATELLITES...</span>}
              </div>

              {/* Middle coordinate tracking circles overlay */}
              <div className="flex-1 flex flex-col items-center justify-center relative p-6 z-10">
                {trackingState.progress > 0 && trackingState.progress < 100 && (
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto"></div>
                    <p className="font-mono text-purple-400 text-xs font-bold">Scanning coordinates... {trackingState.progress}%</p>
                  </div>
                )}

                {trackingState.progress === 100 && !trackingState.isTracking && (
                  <div className="text-center space-y-2 animate-fade-in">
                    <MapPin className="text-pink-500 animate-bounce mx-auto" size={36} />
                    <h5 className="font-bold text-sm text-white">{trackingState.locationName}</h5>
                    <p className="font-mono text-[10px] text-gray-400">Lat: {trackingState.latitude.toFixed(5)} | Lng: {trackingState.longitude.toFixed(5)}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-left border-t border-slate-800 pt-2 mt-2 w-72 mx-auto font-mono">
                      <div><span className="text-gray-400">Operator:</span> {trackingState.operator}</div>
                      <div><span className="text-gray-400">Tower Sector:</span> {trackingState.cellId}</div>
                      <div className="col-span-2"><span className="text-gray-400">Signal Rating:</span> {trackingState.signalStrength}</div>
                    </div>
                  </div>
                )}

                {trackingState.progress === 0 && !trackingState.isTracking && (
                  <div className="text-center text-gray-500 text-xs py-10 max-w-xs font-medium leading-relaxed">
                    Cellular triangulation radar is currently idle. Enter target number first.
                  </div>
                )}
              </div>

              {/* Bottom location metrics toolbar */}
              <div className="p-3 bg-slate-950/65 border-t border-slate-800 text-[9px] font-mono flex justify-between z-10 text-gray-400">
                <span>Coordinates Reference: WGS-84 BD Grid</span>
                <span>System Secure Core: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAXATION DOCUMENTS (TIN CERTIFICATE & ZERO RETURN CALCULATOR) */}
      {(['tin_certificate', 'tin-certificate', 'zero_tax', 'income-tax-return', 'new_tin_registration', 'tin-new'].includes(activeServiceId)) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-550 leading-relaxed">
              Generate dynamic National Board of Revenue Bangladesh e-TIN copies or ZERO Income Tax returns reports completely customized.
            </p>
            <button
              onClick={() => autofillDemoData('nid')}
              className="text-xs bg-purple-50 text-purple-700 font-bold py-1 px-3.5 rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer"
            >
              Autofill Sample (টেস্ট ডেটা ফিলাপ)
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const serviceFeeValue = service?.fee || 30;
              const documentType = (activeServiceId === 'zero_tax' || activeServiceId === 'income-tax-return') ? 'zero_tax' : 'tin';
              handleVerifyService('Revenue document builder', serviceFeeValue, () => {
                setOutputDoc({ type: documentType, data: nidInput });
              });
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Enter NID / Smart card Reference No</label>
              <input
                type="text" required maxLength={13}
                value={nidInput.nidNo}
                onChange={(e) => setNidInput(prev => ({ ...prev, nidNo: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-650 block mb-1">Full Identity Name</label>
              <input
                type="text" required
                value={nidInput.nameEnglish}
                onChange={(e) => setNidInput(prev => ({ ...prev, nameEnglish: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono uppercase text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Father's Full Name</label>
              <input
                type="text" required
                value={nidInput.fatherName}
                onChange={(e) => setNidInput(prev => ({ ...prev, fatherName: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Mother's Full Name</label>
              <input
                type="text" required
                value={nidInput.motherName}
                onChange={(e) => setNidInput(prev => ({ ...prev, motherName: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Permanent Residential Address</label>
              <input
                type="text" required
                value={nidInput.address}
                onChange={(e) => setNidInput(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Generate printable Certificate Copy [Charge: {activeServiceId === 'tin_certificate' ? '30' : '35'} BDT]
            </button>
          </form>
        </div>
      )}

      {/* 9. OVERLIMIT SMS OTP BYPASS PORTAL */}
      {activeServiceId === 'otp_bypass' && (
        <div className="space-y-4 max-w-lg mx-auto font-sans">
          <p className="text-xs text-gray-550 leading-relaxed text-center">
            সংশোধন করার সময় মোবাইল নাম্বারে ওটিপি লিমিট (৫ টার বেশি) হয়ে গেলে, বিকল্প প্রশাসনিক চ্যানেল দিয়ে বাইপাস পোর্টাল আবেদন জমা দিন।
          </p>

          <form onSubmit={runOtpBypass} className="p-4 border rounded-xl bg-purple-50/50 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Birth Certificate Registration No (১৭ ডিজিট জন্ম নিবন্ধন)</label>
              <input
                type="text" required placeholder=""
                value={otpBypassState.birthRegNo}
                onChange={(e) => setOtpBypassState(prev => ({ ...prev, birthRegNo: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Previous Blocked Number</label>
                <input
                  type="text" required
                  value={otpBypassState.prevPhone}
                  onChange={(e) => setOtpBypassState(prev => ({ ...prev, prevPhone: e.target.value }))}
                  className="w-full bg-white border border-gray-250 rounded-lg p-2 text-xs font-mono text-gray-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-650 block mb-1">New Route proxy Number</label>
                <input
                  type="text" required placeholder="Alternative Phone No"
                  value={otpBypassState.newPhone}
                  onChange={(e) => setOtpBypassState(prev => ({ ...prev, newPhone: e.target.value }))}
                  className="w-full bg-white border border-gray-250 rounded-lg p-2 text-xs font-mono text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={otpBypassState.status === 'running'}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {otpBypassState.status === 'running' ? 'Tunneling system ports...' : 'Submit OTP Bypass Injection [Fee: 15 BDT]'}
            </button>
          </form>

          {/* Bypass debugging console */}
          {otpBypassState.status !== 'idle' && (
            <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-[10px] space-y-1 shadow-inner max-h-48 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-white font-bold mb-1 border-b border-slate-800 pb-1">
                <Terminal size={12} className="text-green-400 animate-pulse" /> SYSTEM BYPASS INTEGRITY CONSOLE
              </div>
              {otpBypassState.logs.map((log, i) => (
                <div key={i} className="animate-fade-in">&gt; {log}</div>
              ))}
              {otpBypassState.status === 'completed' && (
                <div className="text-white font-bold mt-2 bg-emerald-950 p-2 border border-emerald-800 rounded animate-bounce">
                  ⚡ TUNNEL COOLDOWN BYPASSED SUCCESS: New OTP code has been routed to target: {otpBypassState.newPhone}!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 10. SMS MASS BOMBER SIMULATOR */}
      {activeServiceId === 'sms_bomber' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Conduct cellular server load test with customizable misscalls/sms stress loops simulation.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50/50 border rounded-xl h-fit space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Target Phone Number</label>
                <input
                  type="tel" placeholder=""
                  value={bomberState.phone}
                  onChange={(e) => setBomberState(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Cycles Limit (SMS সংখ্যা)</label>
                <select
                  value={bomberState.count}
                  onChange={(e) => setBomberState(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono text-gray-850 focus:outline-none"
                >
                  <option value="50">50 Bursts (Light Testing)</option>
                  <option value="100">100 Bursts (Medium Testing)</option>
                  <option value="250">250 Bursts (Heavy Stress)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!bomberState.phone.match(/^01[3-9]\d{8}$/)) {
                      alert('Please enter a valid 11-digit mobile number.');
                      return;
                    }
                    handleVerifyService('SMS Bomber testing', 10, () => {
                      setBomberState(prev => ({ ...prev, isBombing: true, sentCount: 0, logs: ['Spawning multi-channel API stress sockets...'] }));
                    });
                  }}
                  disabled={bomberState.isBombing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play size={12} /> Launch Stream
                </button>
                
                {bomberState.isBombing && (
                  <button
                    onClick={() => setBomberState(prev => ({ ...prev, isBombing: false }))}
                    className="px-4 bg-red-600 h-10 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Kill Thread
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-2xl h-[280px] flex flex-col justify-between overflow-hidden shadow-inner border border-slate-800">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-100">
                <span className="flex items-center gap-1"><Terminal size={12} className="text-purple-400" /> MULTI-GATEWAY SMS INTERFACE</span>
                <span className="font-mono text-xs">{bomberState.sentCount}/{bomberState.count} Sent</span>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-1 max-h-[190px]">
                {bomberState.logs.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-10">Simulation logs currently empty. Specify target phone and click Launch.</p>
                ) : (
                  bomberState.logs.map((log, index) => (
                    <div key={index} className="animate-fade-in">&gt; {log}</div>
                  ))
                )}
              </div>

              <div className="p-2 bg-slate-900/50 border-t border-slate-800 text-[8px] flex justify-between items-center text-gray-500">
                <span>Thread limit priority: MODERATE</span>
                <span>Active socket nodes: 15 Core</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. PHONE LOCKED MESSAGE SIMULATION */}
      {activeServiceId === 'lock_prompter' && (
        <div className="space-y-4 font-sans">
          <p className="text-xs text-gray-500">Create locked smart overlay previews to prompt dues/claims accompanied with dynamic mobile payment forms.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border rounded-2xl bg-purple-50/50 space-y-3.5">
              <h5 className="font-bold text-purple-950 text-sm">Lock Template Settings Dashboard</h5>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Target Phone reference</label>
                <input
                  type="text" required placeholder="e.g. 017XXXXXXXX"
                  value={lockState.phone}
                  onChange={(e) => setLockState(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Dues Claim Amount (টাকা)</label>
                  <input
                    type="text" required
                    value={lockState.amount}
                    onChange={(e) => setLockState(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">bKash Account Number</label>
                  <input
                    type="text" required
                    value={lockState.bkashNumber}
                    onChange={(e) => setLockState(prev => ({ ...prev, bkashNumber: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Custom Locked Alert message (প্রদর্শিত মেসেজ)</label>
                <textarea
                  rows={3} required
                  value={lockState.message}
                  onChange={(e) => setLockState(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs leading-relaxed"
                />
              </div>

              <button
                onClick={() => {
                  handleVerifyService('Device Lock simulation', 20, () => {
                    setLockState(prev => ({ ...prev, isLockedSimulation: true }));
                  });
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Launch Lock Overlay Preview [Fee: 20 BDT]
              </button>
            </div>

            {/* Simulated locked smart screen inside overlay page */}
            <div className="border-4 border-slate-950 rounded-3xl h-[470px] bg-slate-900 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between font-sans shadow-purple-200">
              <div className="absolute top-3 inset-x-0 flex justify-center z-10">
                <div className="w-20 h-4 bg-black rounded-b-xl"></div>
              </div>

              {lockState.isLockedSimulation ? (
                <div className="absolute inset-0 z-20 bg-slate-950 p-6 flex flex-col justify-between text-center select-none animate-fade-in animate-scale-up">
                  <div className="text-center pt-8">
                    <Lock className="text-red-500 animate-pulse mx-auto mb-3" size={48} />
                    <h3 className="text-md font-extrabold text-red-505 tracking-wide">SECURE WARNING LOCK SCREEN</h3>
                    <p className="text-[8px] font-mono text-gray-500 uppercase mt-1">SIMULATED PHONE CONTROL UNIT</p>
                  </div>

                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl relative">
                    <p className="text-xs text-red-300 font-semibold leading-relaxed">
                      {lockState.message}
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                      <span className="text-gray-400">Claims Outstanding:</span>
                      <span className="font-bold text-red-400">৳ {lockState.amount} BDT</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Remit bKash Number:</span>
                      <span className="font-bold text-emerald-400 font-mono">{lockState.bkashNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setLockState(prev => ({ ...prev, isLockedSimulation: false }))}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Dismiss lock preview and Return to Portal
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 text-xs">
                  <Smartphone size={40} className="text-gray-700 mb-2" />
                  <p>Simulator Screen. Fill lock parameters and launch overlay to generate smartphone mock locked warning state.</p>
                </div>
              )}

              {/* Locked outer details toolbar */}
              <div className="p-3 bg-black/60 text-center text-[8px] font-mono text-gray-600">
                BD WEB PANEL LOCK SIMULATOR V1
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. GENERAL DYNAMIC FALLBACK FORM GENERATOR */}
      {!['auto_birth', 'new-birth-reg', 'auto_death', 'death-certificate', 'birth_copy', 'birth-copy', 'birth_correction', 'birth-correction', 'birth_application', 'information_correction', 'birth_by_nid', 'nid_by_birth',
        'nid_by_no', 'smart_nid', 'server_copy', 'server-copy', 'sign_copy', 'sign-copy', 'sajib_copy', 'nid-pdf', 'form-sign-copy', 'nid-voter-number', 'official_server_copy', 'official-server-copy', 'nid_form_no', 'nid_correction', 'nid-correction', 'nid_address_change', 'nid-address-change', 'smart-id-card',
        'owner_by_phone', 'sim_biometric', 'sim-biometric', 'sms_list', 'sms-list', 'bKash_info', 'bkash-info', 'nagad_info', 'nagad-info', 'rocket_info', 'rocket-info',
        'sims_by_nid', 'phone_imei', 'imei-number', 'sim_by_imei', 'call_list', 'call-list', 'mfs_checker', 'location_tracker',
        'number_to_location', 'number-location', 'live-location', 'tin_certificate', 'tin-certificate', 'zero_tax', 'income-tax-return', 'new_tin_registration', 'tin-new', 'otp_bypass',
        'sms_bomber', 'lock_prompter'].includes(activeServiceId) && (
        <div className="space-y-4 max-w-xl mx-auto font-sans">
          <div className="flex justify-between items-center bg-purple-50/40 p-3 rounded-2xl border border-purple-100/50 animate-fade-in">
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              You are accessing the <span className="font-bold text-purple-700">{service?.banglaTitle || service?.title || 'Citizen Portal'}</span> form portal.
            </p>
            <button
              onClick={autofillGenericSample}
              className="text-[10px] bg-purple-100/85 hover:bg-purple-250 text-purple-950 font-bold py-1 px-3 rounded-lg border border-purple-200 cursor-pointer transition-all shrink-0"
            >
              Autofill Sample (টেস্ট ডেটা ফিলাপ)
            </button>
          </div>

          <form onSubmit={handleGenericSubmit} className="space-y-4 animate-scale-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getGenericFieldsForCategory(service?.category || 'all').map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      value={genericInputs[field.name] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => setGenericInputs(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs leading-relaxed text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  ) : (
                    <input
                      required={field.required}
                      type="text"
                      value={genericInputs[field.name] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => setGenericInputs(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Submit Application details & Get Copy [Fee: {service?.fee || 50} BDT]
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

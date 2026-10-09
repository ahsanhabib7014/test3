// 'use client';
// import { useState, useEffect } from 'react';

// export default function UserDepositPage() {
//   const [activeMethods, setActiveMethods] = useState([]);
//   const [selectedMethod, setSelectedMethod] = useState(null);
  
//   const [amount, setAmount] = useState('');
//   const [senderNumber, setSenderNumber] = useState('');
//   const [transactionId, setTransactionId] = useState('');
  
//   const [trxError, setTrxError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // স্ক্রিনের মাঝখানে টোস্ট মেসেজ দেখানোর জন্য স্টেট
//   const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

//   const showToast = (message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => {
//       setToast({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   // অ্যাডমিন প্যানেল থেকে অন থাকা পেমেন্ট মেথডগুলো ফেচ করা (credentials সহ)
//   useEffect(() => {
//     fetch('/api/admin/settings', { credentials: 'include' })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           const active = data.settings.filter(s => s.isActive);
//           setActiveMethods(active);
//           if (active.length > 0) setSelectedMethod(active[0]);
//         }
//       })
//       .catch(err => console.error(err));
//   }, []);

//   // ট্রানজেকশন আইডি রিয়েল-টাইম চেক ও ফ্রন্টএন্ড স্যানিটাইজেশন
//   useEffect(() => {
//     const checkTrx = async () => {
//       const cleanTrxId = transactionId.trim();
      
//       if (!cleanTrxId || cleanTrxId.length < 5) {
//         setTrxError('');
//         return;
//       }

//       // শুধুমাত্র অ্যালফানিউমারিক চেক (স্পেশাল ক্যারেক্টার বা ইনজেকশন রোধে)
//       if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
//         setTrxError('ট্রানজেকশন আইডিতে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!');
//         return;
//       }

//       try {
//         const res = await fetch('/api/game/check-trx', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ transactionId: cleanTrxId })
//         });
//         const data = await res.json();
//         if (data.exists) {
//           setTrxError(data.message);
//         } else {
//           setTrxError('');
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     const timer = setTimeout(checkTrx, 500);
//     return () => clearTimeout(timer);
//   }, [transactionId]);

//   // নম্বর কপি করার ফাংশন
//   const handleCopy = (num) => {
//     navigator.clipboard.writeText(num);
//     showToast('নম্বর সফলভাবে কপি করা হয়েছে!', 'success');
//   };

//   // ডিপোজিট সাবমিট হ্যান্ডলার (HttpOnly কুকি সহ)
//   const handleSubmitDeposit = async (e) => {
//     e.preventDefault();
//     if (trxError) {
//       showToast('দয়া করে সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!', 'error');
//       return;
//     }

//     const cleanAmount = Number(amount);
//     if (isNaN(cleanAmount) || cleanAmount <= 0) {
//       showToast('দয়া করে সঠিক টাকার পরিমাণ দিন!', 'error');
//       return;
//     }

//     if (cleanAmount < (selectedMethod?.minDeposit || 500)) {
//       showToast(`সর্বনিম্ন ডিপোজিট ${selectedMethod?.minDeposit || 500} টাকা!`, 'error');
//       return;
//     }

//     const cleanSenderNumber = senderNumber.trim();
//     if (!/^\d{11}$/.test(cleanSenderNumber)) {
//       showToast('সঠিক ১১ সংখ্যার বিকাশ/নগদ নম্বর প্রদান করুন!', 'error');
//       return;
//     }

//     const cleanTrxId = transactionId.trim().toUpperCase();

//     try {
//       setLoading(true);
//       const res = await fetch('/api/game/deposit', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         credentials: 'include', // অতি জরুরি: কুকি ব্যাকএন্ডে পাঠানোর জন্য
//         body: JSON.stringify({
//           amount: cleanAmount,
//           method: selectedMethod ? `${selectedMethod.methodName} (${selectedMethod.accountType})` : 'bkash',
//           accountNumber: cleanSenderNumber,
//           transactionId: cleanTrxId
//         })
//       });
//       const data = await res.json();
      
//       showToast(data.message, data.success ? 'success' : 'error');
      
//       if (data.success) {
//         setAmount('');
//         setSenderNumber('');
//         setTransactionId('');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('সার্ভার ত্রুটি দেখা দিয়েছে!', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6 shadow-xl relative">
      
//       {/* স্ক্রিনের মাঝখানে পপআপ / টোস্ট নোটিফিকেশন */}
//       {toast.show && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className={`px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white border border-emerald-400' : 'bg-rose-600 text-white border border-rose-400'}`}>
//             {toast.message}
//           </div>
//         </div>
//       )}

//       <h2 className="text-xl font-bold text-emerald-400 text-center">ডিপোজিট করুন</h2>

//       <form onSubmit={handleSubmitDeposit} className="space-y-4">
//         <div>
//           <label className="text-xs text-slate-400 block mb-1">পেমেন্ট মেথড সিলেক্ট করুন</label>
//           <select 
//             onChange={(e) => {
//               const m = activeMethods.find(item => item._id === e.target.value);
//               setSelectedMethod(m);
//             }}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
//           >
//             {activeMethods.map(m => (
//               <option key={m._id} value={m._id}>
//                 {m.methodName} ({m.accountType})
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedMethod && (
//           <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
//             <div className="flex justify-between text-xs text-slate-400">
//               <span>অ্যাডমিন নম্বর ({selectedMethod.accountType}):</span>
//               <span className="text-amber-400 font-bold">মিনিমাম: ৳{selectedMethod.minDeposit || 500}</span>
//             </div>
//             <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
//               <span className="font-mono text-lg font-bold text-emerald-400">{selectedMethod.accountNumber}</span>
//               <button 
//                 type="button"
//                 onClick={() => handleCopy(selectedMethod.accountNumber)}
//                 className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition"
//               >
//                 কপি করুন
//               </button>
//             </div>
//           </div>
//         )}

//         <div>
//           <label className="text-xs text-slate-400 block mb-1">টাকার পরিমাণ</label>
//           <input 
//             type="number" 
//             min="1"
//             placeholder="পরিমাণ লিখুন" 
//             value={amount}
//             onChange={(e) => {
//               const val = e.target.value;
//               if (val === '' || Number(val) >= 0) {
//                 setAmount(val);
//               }
//             }}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="text-xs text-slate-400 block mb-1">যে নাম্বার থেকে টাকা পাঠিয়েছেন</label>
//           <input 
//             type="text" 
//             maxLength={11}
//             placeholder="আপনার বিকাশ/নগদ নম্বর লিখুন" 
//             value={senderNumber}
//             onChange={(e) => {
//               const numericValue = e.target.value.replace(/\D/g, '');
//               setSenderNumber(numericValue);
//             }}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="text-xs text-slate-400 block mb-1">ট্রানজাকশন আইডি (TrxID)</label>
//           <input 
//             type="text" 
//             placeholder="M4K8..." 
//             value={transactionId}
//             onChange={(e) => {
//               const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
//               setTransactionId(sanitizedValue);
//             }}
//             className={`w-full bg-slate-950 border p-3 rounded-xl text-sm outline-none uppercase ${trxError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-emerald-500'}`}
//             required
//           />
//           {trxError && <p className="text-xs text-rose-400 mt-1 font-bold">{trxError}</p>}
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading || !!trxError}
//           className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 p-3 rounded-xl font-bold text-sm transition shadow-lg"
//         >
//           {loading ? 'সাবমিট হচ্ছে...' : 'ডিপোজিট রিকোয়েস্ট পাঠান'}
//         </button>
//       </form>
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ ফিরে যান বাটনের জন্য ইমপোর্ট

export default function UserDepositPage() {
  const router = useRouter(); // ✅ রাউটার ইনিশিয়ালাইজ

  const [activeMethods, setActiveMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  const [trxError, setTrxError] = useState('');
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const active = data.settings.filter(s => s.isActive);
          setActiveMethods(active);
          if (active.length > 0) setSelectedMethod(active[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const checkTrx = async () => {
      const cleanTrxId = transactionId.trim();
      
      if (!cleanTrxId || cleanTrxId.length < 5) {
        setTrxError('');
        return;
      }

      if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
        setTrxError('ট্রানজেকশন আইডিতে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!');
        return;
      }

      try {
        const res = await fetch('/api/game/check-trx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ transactionId: cleanTrxId })
        });
        const data = await res.json();
        if (data.exists) {
          setTrxError(data.message);
        } else {
          setTrxError('');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(checkTrx, 500);
    return () => clearTimeout(timer);
  }, [transactionId]);

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    showToast('নম্বর সফলভাবে কপি করা হয়েছে!', 'success');
  };

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (trxError) {
      showToast('দয়া করে সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!', 'error');
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      showToast('দয়া করে সঠিক টাকার পরিমাণ দিন!', 'error');
      return;
    }

    if (cleanAmount < (selectedMethod?.minDeposit || 500)) {
      showToast(`সর্বনিম্ন ডিপোজিট ${selectedMethod?.minDeposit || 500} টাকা!`, 'error');
      return;
    }

    const cleanSenderNumber = senderNumber.trim();
    if (!/^\d{11}$/.test(cleanSenderNumber)) {
      showToast('সঠিক ১১ সংখ্যার বিকাশ/নগদ নম্বর প্রদান করুন!', 'error');
      return;
    }

    const cleanTrxId = transactionId.trim().toUpperCase();

    try {
      setLoading(true);
      const res = await fetch('/api/game/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: cleanAmount,
          method: selectedMethod ? `${selectedMethod.methodName} (${selectedMethod.accountType})` : 'bkash',
          accountNumber: cleanSenderNumber,
          transactionId: cleanTrxId
        })
      });
      const data = await res.json();
      
      showToast(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        setAmount('');
        setSenderNumber('');
        setTransactionId('');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার ত্রুটি দেখা দিয়েছে!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* টোস্ট নোটিফিকেশন (মডার্ন স্টাইল) */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-slate-900 border-emerald-500 text-emerald-400' 
              : 'bg-slate-900 border-rose-500 text-rose-400'
          }`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check text-3xl' : 'fa-circle-exclamation text-3xl'}`}></i>
            <span className="leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-xl space-y-4">
        
        {/* হেডার সেকশন (কমপ্যাক্ট) */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-download"></i> ডিপোজিট করুন
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* ডিপোজিট ফর্ম কার্ড */}
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <form onSubmit={handleSubmitDeposit} className="space-y-5">
            
            {/* পেমেন্ট মেথড সিলেক্ট */}
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">পেমেন্ট মেথড সিলেক্ট করুন</label>
              <select 
                onChange={(e) => {
                  const m = activeMethods.find(item => item._id === e.target.value);
                  setSelectedMethod(m);
                }}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                {activeMethods.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.methodName} ({m.accountType})
                  </option>
                ))}
              </select>
            </div>

            {/* অ্যাডমিন পেমেন্ট নম্বর ডিসপ্লে */}
            {selectedMethod && (
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex justify-between text-xs md:text-sm text-slate-400">
                  <span>অ্যাডমিন নম্বর ({selectedMethod.accountType}):</span>
                  <span className="text-amber-400 font-bold">মিনিমাম: ৳{selectedMethod.minDeposit || 500}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="font-mono text-base md:text-lg font-bold text-emerald-400">{selectedMethod.accountNumber}</span>
                  <button 
                    type="button"
                    onClick={() => handleCopy(selectedMethod.accountNumber)}
                    className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-copy"></i> কপি
                  </button>
                </div>
              </div>
            )}

            {/* অ্যামাউন্ট এবং সেন্ডার নম্বর (ডেস্কটপে পাশাপাশি) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">টাকার পরিমাণ</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="পরিমাণ লিখুন" 
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) setAmount(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">যে নাম্বার থেকে টাকা পাঠিয়েছেন</label>
                <input 
                  type="text" 
                  maxLength={11}
                  placeholder="আপনার নম্বর লিখুন" 
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* ট্রানজেকশন আইডি */}
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">ট্রানজেকশন আইডি (TrxID)</label>
              <input 
                type="text" 
                placeholder="M4K8..." 
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none uppercase font-mono ${
                  trxError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                }`}
                required
              />
              {trxError && <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i> {trxError}</p>}
            </div>

            {/* সাবমিট বাটন */}
            <button 
              type="submit" 
              disabled={loading || !!trxError}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg shadow-emerald-950/50 cursor-pointer flex justify-center items-center gap-2 mt-2 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  সাবমিট হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> ডিপোজিট রিকোয়েস্ট পাঠান
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
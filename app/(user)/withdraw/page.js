// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function UserWithdrawPage() {
//   const [user, setUser] = useState({ balance: 0, turnover: 0, phone: '', uid: '' });
//   const [activeMethods, setActiveMethods] = useState([]);
//   const [method, setMethod] = useState('');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [amount, setAmount] = useState('');
//   const [pin, setPin] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const [toast, setToast] = useState({ show: false, message: '', type: '' });
//   const router = useRouter();

//   const showToast = (message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => {
//       setToast({ show: false, message: '', type: '' });
//     }, 3000);
//   };

//   const handlePinChange = (e) => {
//     const val = e.target.value.replace(/\D/g, '');
//     if (val.length <= 4) {
//       setPin(val);
//     }
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (!savedUser.uid) {
//       router.push('/login');
//       return;
//     }

//     setUser(savedUser);
    
//     // লোকালস্টোরেজ থেকে সরাসরি ফোন নম্বর সেট করা যাতে পেজ লোড হওয়ার সাথে সাথেই দেখায়
//     if (savedUser.phone) {
//       setAccountNumber(savedUser.phone);
//     }

//     // সার্ভার থেকে ইউজারের রিয়েল-টাইম ডেটা এবং ফোন নম্বর সিঙ্ক করা
//     fetch(`/api/admin/users?search=${savedUser.uid}`, {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success && data.users && data.users.length > 0) {
//           const currentUser = data.users.find(u => u.uid === savedUser.uid) || data.users[0];
//           setUser(currentUser);
          
//           // ইউজার মডেলের 'phone' প্রপার্টি থেকে নম্বর সেট করা
//           if (currentUser.phone) {
//             setAccountNumber(currentUser.phone);
//           }

//           localStorage.setItem('user', JSON.stringify({ ...savedUser, ...currentUser }));
//         }
//       })
//       .catch(err => console.error(err));

//     // অ্যাডমিন প্যানেল থেকে শুধুমাত্র Active পেমেন্ট মেথডগুলো ফেচ করা
//     fetch('/api/admin/payment-methods', {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success && data.methods) {
//           const activeList = data.methods.filter(m => m.isActive);
//           setActiveMethods(activeList);
//           if (activeList.length > 0) {
//             setMethod(activeList[0].methodName);
//           }
//         }
//       })
//       .catch(err => console.error(err));
//   }, [router]);

//   const handleSubmitWithdraw = async (e) => {
//     e.preventDefault();

//     if (user.turnover && user.turnover > 0) {
//       showToast(`আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি রয়েছে!`, 'error');
//       return;
//     }

//     const targetNumber = user.phone;
//     const cleanAccountNumber = accountNumber.trim();
    
//     if (cleanAccountNumber !== targetNumber) {
//       showToast('আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!', 'error');
//       return;
//     }

//     if (!/^\d{11}$/.test(cleanAccountNumber)) {
//       showToast('অ্যাকাউন্ট নম্বর অবশ্যই সঠিক ১১ সংখ্যার হতে হবে!', 'error');
//       return;
//     }

//     if (pin.length !== 4) {
//       showToast('উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!', 'error');
//       return;
//     }

//     const cleanAmount = Number(amount);
//     if (isNaN(cleanAmount) || cleanAmount < 500) {
//       showToast('সর্বনিম্ন উইথড্র ৫০০ টাকা হতে হবে!', 'error');
//       return;
//     }

//     if (cleanAmount > user.balance) {
//       showToast('আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!', 'error');
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch('/api/game/withdraw', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({
//           uid: user.uid,
//           amount: cleanAmount,
//           method,
//           accountNumber: cleanAccountNumber,
//           pin
//         })
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', 'success');
//         setAmount('');
//         setPin('');

//         if (data.newBalance !== undefined) {
//           setUser(prev => ({ ...prev, balance: data.newBalance }));
//           const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//           savedUser.balance = data.newBalance;
//           localStorage.setItem('user', JSON.stringify(savedUser));
//         }

//         router.refresh();
//       } else {
//         showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('সার্ভার এরর!', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6 shadow-xl relative">
      
//       {toast.show && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
//           <div className={`px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full transform scale-100 transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white border border-emerald-400' : 'bg-rose-600 text-white border border-rose-400'}`}>
//             {toast.message}
//           </div>
//         </div>
//       )}

//       <h2 className="text-xl font-bold text-rose-400 text-center">উইথড্র করুন</h2>

//       <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
//         <div>
//           <p className="text-xs text-slate-400">মূল ব্যালেন্স</p>
//           <p className="text-lg font-bold text-amber-400">৳{user.balance || 0}</p>
//         </div>
//         <div className="text-right">
//           <p className="text-xs text-slate-400">টার্নওভার বাকি</p>
//           <p className={`text-lg font-bold ${user.turnover > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
//             ৳{user.turnover || 0}
//           </p>
//         </div>
//       </div>

//       {user.turnover > 0 && (
//         <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-400 text-center font-bold leading-relaxed">
//           🚫 আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
//         </div>
//       )}

//       <form onSubmit={handleSubmitWithdraw} className="space-y-4">
//         <div>
//           <label className="text-xs text-slate-400 block mb-1">পেমেন্ট মেথড সিলেক্ট করুন</label>
//           <select 
//             value={method} 
//             onChange={(e) => setMethod(e.target.value)}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-rose-500 cursor-pointer"
//             required
//           >
//             {activeMethods.length === 0 ? (
//               <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
//             ) : (
//               activeMethods.map((m) => (
//                 <option key={m._id} value={m.methodName}>{m.methodName}</option>
//               ))
//             )}
//           </select>
//         </div>

//         <div>
//           <div className="flex justify-between items-center mb-1">
//             <label className="text-xs text-slate-400">অ্যাকাউন্ট নম্বর (আপনার রেজিস্টার্ড নম্বর)</label>
//             <span className="text-[10px] text-emerald-400 font-semibold">🔒 লক করা (পরিবর্তন করা যাবে না)</span>
//           </div>
//           <input 
//             type="text" 
//             value={accountNumber}
//             readOnly
//             className="w-full bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-sm text-slate-300 font-mono cursor-not-allowed outline-none select-none"
//             title="নিরাপত্তার জন্য অ্যাকাউন্ট নম্বর পরিবর্তন করা নিষেধ"
//           />
//         </div>

//         <div>
//           <label className="text-xs text-slate-400 block mb-1">উইথড্রর পরিমাণ (মিনিমাম ৫০০ টাকা)</label>
//           <input 
//             type="number" 
//             min="500"
//             placeholder="পরিমাণ লিখুন" 
//             value={amount}
//             onChange={(e) => {
//               const val = e.target.value;
//               if (val === '' || Number(val) >= 0) {
//                 setAmount(val);
//               }
//             }}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-rose-500 font-mono"
//             required
//           />
//         </div>

//         <div>
//           <label className="text-xs text-slate-400 block mb-1">৪ ডিজিটের সিকিউরিটি পিন</label>
//           <input 
//             type="password" 
//             maxLength={4}
//             placeholder="আপনার ৪ ডিজিটের পিন দিন" 
//             value={pin}
//             onChange={handlePinChange}
//             className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-rose-500 font-mono tracking-widest"
//             required
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading || (user.turnover && user.turnover > 0) || activeMethods.length === 0}
//           className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-950/50 cursor-pointer"
//         >
//           {loading ? 'প্রসেস হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
//         </button>
//       </form>
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserWithdrawPage() {
  const [user, setUser] = useState({ balance: 0, turnover: 0, phone: '', uid: '' });
  const [activeMethods, setActiveMethods] = useState([]);
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) {
      setPin(val);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.uid) {
      router.push('/login');
      return;
    }

    setUser(savedUser);
    
    if (savedUser.phone) {
      setAccountNumber(savedUser.phone);
    }

    fetch(`/api/admin/users?search=${savedUser.uid}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users && data.users.length > 0) {
          const currentUser = data.users.find(u => u.uid === savedUser.uid) || data.users[0];
          setUser(currentUser);
          
          if (currentUser.phone) {
            setAccountNumber(currentUser.phone);
          }

          localStorage.setItem('user', JSON.stringify({ ...savedUser, ...currentUser }));
        }
      })
      .catch(err => console.error(err));

    fetch('/api/admin/payment-methods', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.methods) {
          const activeList = data.methods.filter(m => m.isActive);
          setActiveMethods(activeList);
          if (activeList.length > 0) {
            setMethod(activeList[0].methodName);
          }
        }
      })
      .catch(err => console.error(err));
  }, [router]);

  const handleSubmitWithdraw = async (e) => {
    e.preventDefault();

    if (user.turnover && user.turnover > 0) {
      showToast(`আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি রয়েছে!`, 'error');
      return;
    }

    const targetNumber = user.phone;
    const cleanAccountNumber = accountNumber.trim();
    
    if (cleanAccountNumber !== targetNumber) {
      showToast('আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!', 'error');
      return;
    }

    if (!/^\d{11}$/.test(cleanAccountNumber)) {
      showToast('অ্যাকাউন্ট নম্বর অবশ্যই সঠিক ১১ সংখ্যার হতে হবে!', 'error');
      return;
    }

    if (pin.length !== 4) {
      showToast('উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!', 'error');
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount < 500) {
      showToast('সর্বনিম্ন উইথড্র ৫০০ টাকা হতে হবে!', 'error');
      return;
    }

    if (cleanAmount > user.balance) {
      showToast('আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/game/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: user.uid,
          amount: cleanAmount,
          method,
          accountNumber: cleanAccountNumber,
          pin
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', 'success');
        setAmount('');
        setPin('');

        if (data.newBalance !== undefined) {
          setUser(prev => ({ ...prev, balance: data.newBalance }));
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          savedUser.balance = data.newBalance;
          localStorage.setItem('user', JSON.stringify(savedUser));
        }

        router.refresh();
      } else {
        showToast(data.message || 'কিছু সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* মডার্ন টোস্ট নোটিফিকেশন */}
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
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-arrow-up-from-bracket"></i> উইথড্র করুন
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* ব্যালেন্স ও টার্নওভার কার্ড (রেসপনসিভ গ্রিড) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">মূল ব্যালেন্স</p>
            <p className="text-lg md:text-2xl font-black text-amber-400 font-mono mt-1">৳{user.balance || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-center relative overflow-hidden">
            <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 ${user.turnover > 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5'} rounded-full blur-2xl pointer-events-none`}></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">টার্নওভার বাকি</p>
            <p className={`text-lg md:text-2xl font-black font-mono mt-1 ${user.turnover > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>৳{user.turnover || 0}</p>
          </div>
        </div>

        {/* টার্নওভার ওয়ার্নিং */}
        {user.turnover > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-400 shadow-lg">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 text-base"></i>
            <p className="text-[11px] md:text-xs font-bold leading-relaxed">
              আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
            </p>
          </div>
        )}

        {/* উইথড্র ফর্ম কার্ড */}
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <form onSubmit={handleSubmitWithdraw} className="space-y-4 md:space-y-5">
            
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">পেমেন্ট মেথড সিলেক্ট করুন</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 cursor-pointer"
                required
              >
                {activeMethods.length === 0 ? (
                  <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
                ) : (
                  activeMethods.map((m) => (
                    <option key={m._id} value={m.methodName}>{m.methodName}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs md:text-sm text-slate-400 font-semibold">অ্যাকাউন্ট নম্বর (রেজিস্টার্ড)</label>
                <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                  <i className="fa-solid fa-lock"></i> লক করা
                </span>
              </div>
              <input 
                type="text" 
                value={accountNumber}
                readOnly
                className="w-full bg-slate-950/60 border border-slate-800 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-slate-400 font-mono cursor-not-allowed outline-none select-none"
                title="নিরাপত্তার জন্য অ্যাকাউন্ট নম্বর পরিবর্তন করা নিষেধ"
              />
            </div>

            {/* অ্যামাউন্ট এবং পিন (ডেস্কটপে পাশাপাশি) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">উইথড্র পরিমাণ (মিনিমাম ৫০০)</label>
                <input 
                  type="number" 
                  min="500"
                  placeholder="৳ পরিমাণ লিখুন" 
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) setAmount(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">৪ ডিজিটের সিকিউরিটি পিন</label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="• • • •" 
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono tracking-widest text-center"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || (user.turnover && user.turnover > 0) || activeMethods.length === 0}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 md:p-4 rounded-xl font-bold text-sm md:text-base transition shadow-lg shadow-rose-950/50 cursor-pointer flex justify-center items-center gap-2 mt-2 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  প্রসেস হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট পাঠান
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
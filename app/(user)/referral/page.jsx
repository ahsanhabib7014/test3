// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ReferralPage() {
//   const [user, setUser] = useState({ uid: '', phone: '', referralBalance: 0, referralCode: '' });
//   const [amount, setAmount] = useState('');
//   const [paymentMethods, setPaymentMethods] = useState([]); 
//   const [method, setMethod] = useState('');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [pin, setPin] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({ show: false, text: '', success: false });
//   const [copied, setCopied] = useState(false);
  
//   const router = useRouter();

//   const showToast = (text, success = true) => {
//     setToast({ show: true, text, success });
//     setTimeout(() => {
//       setToast({ show: false, text: '', success: false });
//     }, 3500);
//   };

//   const handlePinChange = (e) => {
//     const val = e.target.value.replace(/\D/g, '');
//     if (val.length <= 4) {
//       setPin(val);
//     }
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (!savedUser.uid && !savedUser.phone) {
//       router.push('/login');
//       return;
//     }

//     setUser(savedUser);
//     setAccountNumber(savedUser.phone || savedUser.uid || '');

//     // ✅ FIX 1: Admin API-র বদলে user API ব্যবহার
//     fetch('/api/game/get-user', {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           const freshUser = {
//             ...savedUser,
//             uid: data.uid,
//             phone: data.phone,
//             balance: data.balance,
//             turnover: data.turnover,
//             referralBalance: data.referralBalance || 0,
//             referralCode: data.referralCode || data.uid
//           };
//           setUser(freshUser);
//           setAccountNumber(freshUser.phone || freshUser.uid || '');
//           localStorage.setItem('user', JSON.stringify(freshUser));
//         }
//       })
//       .catch(err => console.error('Referral fetch error:', err));

//     // ✅ FIX 2: সঠিক settings API — active মেথডগুলো রিটার্ন করে
//     fetch('/api/admin/settings', {
//       credentials: 'include'
//     })
//       .then(res => res.json())
//       .then(data => {
//         // admin/settings returns { success, settings } — settings array
//         const allSettings = data.settings || data.methods || [];
//         const activeMethods = allSettings.filter(m => m.isActive);
//         setPaymentMethods(activeMethods);
//         if (activeMethods.length > 0) {
//           setMethod(activeMethods[0].methodName);
//         }
//       })
//       .catch(err => console.error('Payment methods fetch error:', err));
//   }, [router]);

//   const referralLink = typeof window !== 'undefined' 
//     ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}` 
//     : '';

//   const copyReferralLink = () => {
//     navigator.clipboard.writeText(referralLink);
//     setCopied(true);
//     showToast('রেফারেল লিংক সফলভাবে কপি করা হয়েছে!', true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleReferralWithdraw = async (e) => {
//     e.preventDefault();

//     const cleanAmount = Number(amount);
//     const registeredNumber = user.phone || user.uid;

//     if (!accountNumber) {
//       showToast('রেজিস্টার্ড অ্যাকাউন্ট নম্বর পাওয়া যায়নি।', false);
//       return;
//     }

//     if (isNaN(cleanAmount) || cleanAmount < 500) {
//       showToast('সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।', false);
//       return;
//     }

//     if (pin.length !== 4) {
//       showToast('উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!', false);
//       return;
//     }

//     if (cleanAmount > (Number(user.referralBalance) || 0)) {
//       showToast('আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!', false);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/user/referral-withdraw', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           amount: cleanAmount,
//           method,
//           accountNumber: registeredNumber,
//           pin
//         })
//       });

//       const data = await res.json();
//       if (data.success) {
//         showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', true);
//         setAmount('');
//         setPin(''); 
        
//         const updatedBalance = (Number(user.referralBalance) || 0) - cleanAmount;
//         const updatedUser = { ...user, referralBalance: updatedBalance };
//         setUser(updatedUser);
//         localStorage.setItem('user', JSON.stringify(updatedUser));
//       } else {
//         showToast(data.message || 'উইথড্র ব্যর্থ হয়েছে।', false);
//       }
//     } catch (err) {
//       showToast('সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।', false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6 shadow-xl relative">
      
//       {toast.show && (
//         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
//           <div className={`p-3.5 rounded-xl shadow-2xl text-xs font-bold text-center border flex items-center justify-center space-x-2 ${
//             toast.success 
//               ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md' 
//               : 'bg-rose-950/90 text-rose-300 border-rose-500/50 backdrop-blur-md'
//           }`}>
//             <span>{toast.success ? '✅' : '⚠️'}</span>
//             <span>{toast.text}</span>
//           </div>
//         </div>
//       )}

//       <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
//         <h2 className="text-lg font-bold text-emerald-400">রেফারেল সিস্টেম ও বোনাস</h2>
//         <button 
//           onClick={() => router.back()} 
//           className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition cursor-pointer"
//         >
//           ফিরে যান
//         </button>
//       </div>

//       <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-center shadow-inner">
//         <div>
//           <p className="text-xs text-slate-400 uppercase tracking-wider">উপলব্ধ রেফারেল বোনাস</p>
//           <h1 className="text-3xl font-extrabold text-amber-400 font-mono mt-1">৳{user.referralBalance || 0}</h1>
//         </div>

//         <div className="pt-3 border-t border-slate-800 space-y-2 text-left">
//           <label className="text-xs text-slate-400 font-semibold block">আপনার রেফারেল লিংক:</label>
//           <div className="flex items-center space-x-2">
//             <input 
//               type="text" 
//               readOnly 
//               value={referralLink} 
//               className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
//             />
//             <button 
//               onClick={copyReferralLink}
//               className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-md cursor-pointer"
//             >
//               {copied ? 'কপি হয়েছে! ✓' : 'কপি করুন'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <form onSubmit={handleReferralWithdraw} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
//         <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">রেফারেল বোনাস উইথড্র করুন</h3>

//         <div className="space-y-1">
//           <label className="text-xs text-slate-400">উইথড্র পদ্ধতি</label>
//           <select 
//             value={method} 
//             onChange={(e) => setMethod(e.target.value)}
//             className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
//             required
//           >
//             {paymentMethods.length === 0 ? (
//               <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
//             ) : (
//               paymentMethods.map((m) => (
//                 <option key={m._id} value={m.methodName}>
//                   {m.methodName}
//                 </option>
//               ))
//             )}
//           </select>
//         </div>

//         <div className="space-y-1">
//           <label className="text-xs text-slate-400">একাউন্ট নাম্বার (আপনার রেজিস্টার্ড নাম্বার - অপরিবর্তনীয়)</label>
//           <input 
//             type="text" 
//             value={accountNumber}
//             readOnly
//             className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 font-mono cursor-not-allowed select-none"
//           />
//         </div>

//         <div className="space-y-1">
//           <label className="text-xs text-slate-400">অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)</label>
//           <input 
//             type="number" 
//             placeholder="সর্বনিম্ন ৫০০ টাকা লিখুন" 
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             required
//             min="500"
//             className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
//           />
//         </div>

//         <div className="space-y-1">
//           <label className="text-xs text-slate-400">৪ ডিজিটের সিকিউরিটি পিন</label>
//           <input 
//             type="password" 
//             maxLength={4}
//             placeholder="আপনার ৪ ডিজিটের পিন দিন" 
//             value={pin}
//             onChange={handlePinChange}
//             className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
//             required
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading || paymentMethods.length === 0}
//           className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
//         >
//           {loading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
//         </button>
//       </form>

//     </div>
//   );
// }
// ..............................................................................

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ReferralPage() {
//   const [user, setUser] = useState({ uid: '', phone: '', referralBalance: 0, referralCode: '' });
//   const [amount, setAmount] = useState('');
//   const [paymentMethods, setPaymentMethods] = useState([]); 
//   const [method, setMethod] = useState('');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [pin, setPin] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({ show: false, text: '', success: false });
//   const [copied, setCopied] = useState(false);
  
//   const router = useRouter();

//   const showToast = (text, success = true) => {
//     setToast({ show: true, text, success });
//     setTimeout(() => {
//       setToast({ show: false, text: '', success: false });
//     }, 3500);
//   };

//   const handlePinChange = (e) => {
//     const val = e.target.value.replace(/\D/g, '');
//     if (val.length <= 4) {
//       setPin(val);
//     }
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (!savedUser.uid && !savedUser.phone) {
//       router.push('/login');
//       return;
//     }

//     setUser(savedUser);
//     setAccountNumber(savedUser.phone || savedUser.uid || '');

//     fetch('/api/game/get-user', { credentials: 'include' })
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) {
//           const freshUser = {
//             ...savedUser,
//             uid: data.uid,
//             phone: data.phone,
//             balance: data.balance,
//             turnover: data.turnover,
//             referralBalance: data.referralBalance || 0,
//             referralCode: data.referralCode || data.uid
//           };
//           setUser(freshUser);
//           setAccountNumber(freshUser.phone || freshUser.uid || '');
//           localStorage.setItem('user', JSON.stringify(freshUser));
//         }
//       })
//       .catch(err => console.error('Referral fetch error:', err));

//     fetch('/api/admin/settings', { credentials: 'include' })
//       .then(res => res.json())
//       .then(data => {
//         const allSettings = data.settings || data.methods || [];
//         const activeMethods = allSettings.filter(m => m.isActive);
//         setPaymentMethods(activeMethods);
//         if (activeMethods.length > 0) {
//           setMethod(activeMethods[0].methodName);
//         }
//       })
//       .catch(err => console.error('Payment methods fetch error:', err));
//   }, [router]);

//   const referralLink = typeof window !== 'undefined' 
//     ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}` 
//     : '';

//   const copyReferralLink = () => {
//     navigator.clipboard.writeText(referralLink);
//     setCopied(true);
//     showToast('রেফারেল লিংক সফলভাবে কপি করা হয়েছে!', true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleReferralWithdraw = async (e) => {
//     e.preventDefault();

//     const cleanAmount = Number(amount);
//     const registeredNumber = user.phone || user.uid;

//     if (!accountNumber) {
//       showToast('রেজিস্টার্ড অ্যাকাউন্ট নম্বর পাওয়া যায়নি।', false);
//       return;
//     }

//     if (isNaN(cleanAmount) || cleanAmount < 500) {
//       showToast('সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।', false);
//       return;
//     }

//     if (pin.length !== 4) {
//       showToast('উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!', false);
//       return;
//     }

//     if (cleanAmount > (Number(user.referralBalance) || 0)) {
//       showToast('আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!', false);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/user/referral-withdraw', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({
//           amount: cleanAmount,
//           method,
//           accountNumber: registeredNumber,
//           pin
//         })
//       });

//       const data = await res.json();
//       if (data.success) {
//         showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', true);
//         setAmount('');
//         setPin(''); 
        
//         const updatedBalance = (Number(user.referralBalance) || 0) - cleanAmount;
//         const updatedUser = { ...user, referralBalance: updatedBalance };
//         setUser(updatedUser);
//         localStorage.setItem('user', JSON.stringify(updatedUser));
//       } else {
//         showToast(data.message || 'উইথড্র ব্যর্থ হয়েছে।', false);
//       }
//     } catch (err) {
//       showToast('সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।', false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
//       {toast.show && (
//         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
//           <div className={`p-3.5 rounded-xl shadow-2xl text-xs md:text-sm font-bold text-center border flex items-center justify-center space-x-2 ${
//             toast.success 
//               ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md' 
//               : 'bg-rose-950/90 text-rose-300 border-rose-500/50 backdrop-blur-md'
//           }`}>
//             <span>{toast.success ? '✅' : '⚠️'}</span>
//             <span>{toast.text}</span>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
        
//        {/* হেডার সেকশন (কমপ্যাক্ট ও এক লাইনে) */}
// <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
//   <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
//     <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
//   </h2>
//   <button
//     onClick={() => router.back()}
//     className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
//   >
//     <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
//   </button>
// </div>

//         {/* মেইন গ্রিড: মোবাইলে ১ কলাম, ডেস্কটপে ২ কলাম */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
//           {/* বাম কলাম: রেফারেল ইনফরমেশন */}
//           <div className="space-y-4 md:space-y-6">
            
//             {/* রেফারেল ব্যালেন্স কার্ড */}
//             <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
//               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
//               <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ রেফারেল বোনাস</p>
//               <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-2">৳{user.referralBalance || 0}</h1>
//             </div>

//             {/* রেফারেল লিংক কার্ড */}
//             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
//               <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
//                 <i className="fa-solid fa-link text-emerald-400"></i> আপনার রেফারেল লিংক
//               </h3>
//               <div className="flex flex-col gap-2">
//                 <input 
//                   type="text" 
//                   readOnly 
//                   value={referralLink} 
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
//                 />
//                 <button 
//                   onClick={copyReferralLink}
//                   className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition shadow-md cursor-pointer flex justify-center items-center gap-2 active:scale-95"
//                 >
//                   <i className="fa-solid fa-copy"></i> {copied ? 'কপি হয়েছে! ✓' : 'কপি করুন'}
//                 </button>
//               </div>
//             </div>

//           </div>

//           {/* ডান কলাম: উইথড্র ফর্ম */}
//           <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
//             <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
//               <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস উইথড্র
//             </h3>

//             <form onSubmit={handleReferralWithdraw} className="space-y-4">
              
//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">উইথড্র পদ্ধতি</label>
//                 <select 
//                   value={method} 
//                   onChange={(e) => setMethod(e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
//                   required
//                 >
//                   {paymentMethods.length === 0 ? (
//                     <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
//                   ) : (
//                     paymentMethods.map((m) => (
//                       <option key={m._id} value={m.methodName}>{m.methodName}</option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">একাউন্ট নাম্বার (রেজিস্টার্ড)</label>
//                 <input 
//                   type="text" 
//                   value={accountNumber}
//                   readOnly
//                   className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-400 font-mono cursor-not-allowed select-none"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)</label>
//                 <input 
//                   type="number" 
//                   placeholder="সর্বনিম্ন ৫০০ টাকা লিখুন" 
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   required
//                   min="500"
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">৪ ডিজিটের সিকিউরিটি পিন</label>
//                 <input 
//                   type="password" 
//                   maxLength={4}
//                   placeholder="আপনার ৪ ডিজিটের পিন দিন" 
//                   value={pin}
//                   onChange={handlePinChange}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
//                   required
//                 />
//               </div>

//               <button 
//                 type="submit" 
//                 disabled={loading || paymentMethods.length === 0}
//                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 active:scale-95 mt-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     প্রসেসিং হচ্ছে...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট পাঠান
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// .............................................................................
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReferralPage() {
  const [user, setUser] = useState({ uid: '', phone: '', referralBalance: 0, referralCode: '' });
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]); 
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', success: false });
  const [copied, setCopied] = useState(false);
  
  const router = useRouter();

  const showToast = (text, success = true) => {
    setToast({ show: true, text, success });
    setTimeout(() => {
      setToast({ show: false, text: '', success: false });
    }, 3500);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) {
      setPin(val);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.uid && !savedUser.phone) {
      router.push('/login');
      return;
    }

    setUser(savedUser);
    setAccountNumber(savedUser.phone || savedUser.uid || '');

    fetch('/api/game/get-user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const freshUser = {
            ...savedUser,
            uid: data.uid,
            phone: data.phone,
            balance: data.balance,
            turnover: data.turnover,
            referralBalance: data.referralBalance || 0,
            referralCode: data.referralCode || data.uid
          };
          setUser(freshUser);
          setAccountNumber(freshUser.phone || freshUser.uid || '');
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      })
      .catch(err => console.error('Referral fetch error:', err));

    // ✅ FIX: admin/settings এর বদলে admin/payment-methods ব্যবহার করা হয়েছে
    fetch('/api/admin/payment-methods', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('🔵 API Response:', data);
        
        if (data.success && data.methods && data.methods.length > 0) {
          const activeMethods = data.methods.filter(m => m.isActive);
          
          console.log('🟢 Active Methods:', activeMethods.map(m => m.methodName));
          
          setPaymentMethods(activeMethods);
          
          if (activeMethods.length > 0) {
            setMethod(activeMethods[0].methodName);
          }
        } else {
          setPaymentMethods([]);
          setMethod('');
        }
      })
      .catch(err => {
        console.error('❌ Payment methods fetch error:', err);
        setPaymentMethods([]);
        setMethod('');
      });
  }, [router]);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}` 
    : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('রেফারেল লিংক সফলভাবে কপি করা হয়েছে!', true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReferralWithdraw = async (e) => {
    e.preventDefault();

    const cleanAmount = Number(amount);
    const registeredNumber = user.phone || user.uid;

    if (!accountNumber) {
      showToast('রেজিস্টার্ড অ্যাকাউন্ট নম্বর পাওয়া যায়নি।', false);
      return;
    }

    if (isNaN(cleanAmount) || cleanAmount < 500) {
      showToast('সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।', false);
      return;
    }

    if (pin.length !== 4) {
      showToast('উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!', false);
      return;
    }

    if (cleanAmount > (Number(user.referralBalance) || 0)) {
      showToast('আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!', false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/referral-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: cleanAmount,
          method,
          accountNumber: registeredNumber,
          pin
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!', true);
        setAmount('');
        setPin(''); 
        
        const updatedBalance = (Number(user.referralBalance) || 0) - cleanAmount;
        const updatedUser = { ...user, referralBalance: updatedBalance };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        showToast(data.message || 'উইথড্র ব্যর্থ হয়েছে।', false);
      }
    } catch (err) {
      showToast('সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
          <div className={`p-3.5 rounded-xl shadow-2xl text-xs md:text-sm font-bold text-center border flex items-center justify-center space-x-2 ${
            toast.success 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md' 
              : 'bg-rose-950/90 text-rose-300 border-rose-500/50 backdrop-blur-md'
          }`}>
            <span>{toast.success ? '✅' : '⚠️'}</span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
        
        {/* হেডার সেকশন (কমপ্যাক্ট ও এক লাইনে) */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* মেইন গ্রিড: মোবাইলে ১ কলাম, ডেস্কটপে ২ কলাম */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* বাম কলাম: রেফারেল ইনফরমেশন */}
          <div className="space-y-4 md:space-y-6">
            
            {/* রেফারেল ব্যালেন্স কার্ড */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">উপলব্ধ রেফারেল বোনাস</p>
              <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono mt-2">৳{user.referralBalance || 0}</h1>
            </div>

            {/* রেফারেল লিংক কার্ড */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-link text-emerald-400"></i> আপনার রেফারেল লিংক
              </h3>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={copyReferralLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition shadow-md cursor-pointer flex justify-center items-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-copy"></i> {copied ? 'কপি হয়েছে! ✓' : 'কপি করুন'}
                </button>
              </div>
            </div>

          </div>

          {/* ডান কলাম: উইথড্র ফর্ম */}
          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
            <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস উইথড্র
            </h3>

            <form onSubmit={handleReferralWithdraw} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">উইথড্র পদ্ধতি</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                >
                  {paymentMethods.length === 0 ? (
                    <option value="">কোনো পেমেন্ট মেথড চালু নেই</option>
                  ) : (
                    paymentMethods.map((m) => (
                      <option key={m._id} value={m.methodName}>{m.methodName}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">একাউন্ট নাম্বার (রেজিস্টার্ড)</label>
                <input 
                  type="text" 
                  value={accountNumber}
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-400 font-mono cursor-not-allowed select-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)</label>
                <input 
                  type="number" 
                  placeholder="সর্বনিম্ন ৫০০ টাকা লিখুন" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="500"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">৪ ডিজিটের সিকিউরিটি পিন</label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="আপনার ৪ ডিজিটের পিন দিন" 
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || paymentMethods.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 active:scale-95 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    প্রসেসিং হচ্ছে...
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
    </div>
  );
}
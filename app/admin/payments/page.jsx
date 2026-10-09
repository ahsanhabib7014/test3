// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function PaymentGatewayPage() {
//   const router = useRouter();
//   const [paymentSettings, setPaymentSettings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // নতুন পেমেন্ট ফর্ম স্টেট
//   const [methodName, setMethodName] = useState('bKash');
//   const [accountType, setAccountType] = useState('Personal');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [minDeposit, setMinDeposit] = useState(500);
//   const [minWithdraw, setMinWithdraw] = useState(500);

//   // ডাটা ফেচ এবং হাই সিকিউরিটি চেক
//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const settingsRes = await fetch(`/api/admin/settings?t=${Date.now()}`);

//       // সিকিউরিটি চেক: সেশন বা কুকি এক্সপায়ার হলে লগইন পেজে রিডাইরেক্ট
//       if (settingsRes.status === 401 || settingsRes.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const settingsData = await settingsRes.json();
//       if (settingsData.success) {
//         setPaymentSettings(settingsData.settings);
//       }
//     } catch (err) {
//       console.error('Payment fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, [router]);

//   // পেমেন্ট নম্বর অ্যাড হ্যান্ডলার (সিকিউরিটি সহ)
//   const handleAddPaymentNumber = async (e) => {
//     e.preventDefault();
//     if (accountNumber.length !== 11 && methodName !== 'USDT' && methodName !== 'TRX') {
//       alert('অ্যাকাউন্ট নম্বর অবশ্যই ১১ সংখ্যার হতে হবে!');
//       return;
//     }

//     try {
//       const res = await fetch('/api/admin/settings', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ methodName, accountType, accountNumber, minDeposit, minWithdraw })
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         alert(data.message);
//         setAccountNumber('');
//         fetchPayments();
//       } else {
//         alert(data.message || 'সমস্যা হয়েছে!');
//       }
//     } catch (err) { 
//       console.error(err); 
//     }
//   };

//   // পেমেন্ট টগল হ্যান্ডলার (সিকিউরিটি সহ)
//   const handleTogglePayment = async (id, currentStatus) => {
//     try {
//       const res = await fetch('/api/admin/settings', {
//         method: 'PATCH',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ id, isActive: !currentStatus })
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         fetchPayments();
//       } else {
//         alert(data.message || 'সমস্যা হয়েছে!');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // পেমেন্ট ডিলিট হ্যান্ডলার (সিকিউরিটি সহ)
//   const handleDeletePayment = async (id) => {
//     if (!confirm('আপনি কি এই পেমেন্ট মেথডটি ডিলিট করতে চান?')) return;

//     try {
//       const res = await fetch(`/api/admin/settings?id=${id}`, { 
//         method: 'DELETE'
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         fetchPayments();
//       } else {
//         alert(data.message || 'সমস্যা হয়েছে!');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) {
//     return <div className="p-8 text-white bg-[#030712] min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-8 text-white min-h-screen bg-[#07090e]">
      
//       {/* পেজ হেডার ও নেভিগেশন */}
//       <div className="flex items-center justify-between bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
//         <div>
//           <h1 className="text-xl font-extrabold text-emerald-400">পেমেন্ট গেটওয়ে ম্যানেজমেন্ট</h1>
//           <p className="text-xs text-slate-400 mt-1">বিকাশ, নগদ, রকেট, উপায় এবং ক্রিপ্টো গেটওয়ে ও লিমিট নিয়ন্ত্রণ করুন।</p>
//         </div>
//         <button 
//           onClick={() => router.back()} 
//           className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer border border-slate-700"
//         >
//           ফিরে যান
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* ফর্ম সেকশন */}
//         <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//           <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">নতুন নম্বর ও লিমিট যোগ করুন</h2>
//           <form onSubmit={handleAddPaymentNumber} className="space-y-4">
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">পেমেন্ট মেথড</label>
//               <select value={methodName} onChange={(e) => setMethodName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                 <option value="bKash">বিকাশ (bKash)</option>
//                 <option value="Nagad">নগদ (Nagad)</option>
//                 <option value="Rocket">রকেট (Rocket)</option>
//                 <option value="Upay">উপায় (Upay)</option>
//                 <option value="USDT">ইউএসডিটি (Binance Pay)</option>
//                 <option value="TRX">টিআরএক্স (TRX)</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">অ্যাকাউন্ট টাইপ</label>
//               <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                 <option value="Personal">পার্সোনাল (Personal)</option>
//                 <option value="Agent/Cashout">ক্যাশআউট / এজেন্ট (Agent/Cashout)</option>
//                 <option value="Crypto">ক্রিপ্টো ওয়ালেট (Crypto)</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">নম্বর (সর্বোচ্চ ১১ সংখ্যা)</label>
//               <input type="text" maxLength={11} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="01700000000" className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" required />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-slate-400 block mb-1">মিনিমাম ডিপোজিট</label>
//                 <input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-xs text-slate-400 block mb-1">মিনিমাম উইথড্র</label>
//                 <input type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//               </div>
//             </div>
//             <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer">সেভ করুন</button>
//           </form>
//         </div>

//         {/* লিস্ট বা টেবিল সেকশন */}
//         <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//           <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">গেটওয়ে লিস্ট (অন/অফ কন্ট্রোল)</h2>
//           <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
//             <table className="w-full text-left text-xs text-slate-300">
//               <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
//                 <tr>
//                   <th className="p-4">মেথড</th>
//                   <th className="p-4">টাইপ</th>
//                   <th className="p-4">নম্বর</th>
//                   <th className="p-4">স্ট্যাটাস</th>
//                   <th className="p-4 text-center">অ্যাকশন</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800">
//                 {paymentSettings.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="p-8 text-center text-slate-500">কোনো পেমেন্ট গেটওয়ে পাওয়া যায়নি।</td>
//                   </tr>
//                 ) : (
//                   paymentSettings.map((p) => (
//                     <tr key={p._id} className="hover:bg-slate-900/50 transition">
//                       <td className="p-4 font-bold text-white">{p.methodName}</td>
//                       <td className="p-4 text-[11px] text-slate-400">{p.accountType}</td>
//                       <td className="p-4 font-mono text-emerald-400 font-semibold">{p.accountNumber}</td>
//                       <td className="p-4">
//                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
//                           {p.isActive ? 'ON' : 'OFF'}
//                         </span>
//                       </td>
//                       <td className="p-4 text-center space-x-2">
//                         <button onClick={() => handleTogglePayment(p._id, p.isActive)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${p.isActive ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border-amber-500/20' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'}`}>{p.isActive ? 'OFF করুন' : 'ON করুন'}</button>
//                         <button onClick={() => handleDeletePayment(p._id)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border border-rose-500/20">ডিলিট</button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>

//     </div>
//   );
// }

// ...............................................................................................

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function PaymentGatewayPage() {
//   const router = useRouter();
//   const [paymentSettings, setPaymentSettings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // নতুন পেমেন্ট ফর্ম স্টেট
//   const [methodName, setMethodName] = useState('bKash');
//   const [accountType, setAccountType] = useState('Personal');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [minDeposit, setMinDeposit] = useState(500);
//   const [minWithdraw, setMinWithdraw] = useState(500);

//   // Toast state
//   const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
//   // Confirm modal state
//   const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

//   const showToast = (message, type = 'success') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
//   };

//   // ডাটা ফেচ এবং হাই সিকিউরিটি চেক
//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const settingsRes = await fetch(`/api/admin/settings?t=${Date.now()}`);

//       if (settingsRes.status === 401 || settingsRes.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const settingsData = await settingsRes.json();
//       if (settingsData.success) {
//         setPaymentSettings(settingsData.settings);
//       }
//     } catch (err) {
//       console.error('Payment fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, [router]);

//   // পেমেন্ট নম্বর অ্যাড হ্যান্ডলার
//   const handleAddPaymentNumber = async (e) => {
//     e.preventDefault();
//     if (accountNumber.length !== 11 && methodName !== 'USDT' && methodName !== 'TRX') {
//       showToast('অ্যাকাউন্ট নম্বর অবশ্যই ১১ সংখ্যার হতে হবে!', 'error');
//       return;
//     }

//     try {
//       const res = await fetch('/api/admin/settings', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ methodName, accountType, accountNumber, minDeposit, minWithdraw })
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         showToast(data.message, 'success');
//         setAccountNumber('');
//         fetchPayments();
//       } else {
//         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) { 
//       console.error(err); 
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     }
//   };

//   // পেমেন্ট টগল হ্যান্ডলার
//   const handleTogglePayment = async (id, currentStatus) => {
//     try {
//       const res = await fetch('/api/admin/settings', {
//         method: 'PATCH',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ id, isActive: !currentStatus })
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         showToast('স্ট্যাটাস পরিবর্তন হয়েছে!', 'success');
//         fetchPayments();
//       } else {
//         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     }
//   };

//   // ডিলিট কনফার্ম ওপেন
//   const openDeleteConfirm = (id) => {
//     setConfirmModal({ show: true, id });
//   };

//   // পেমেন্ট ডিলিট হ্যান্ডলার
//   const handleDeletePayment = async () => {
//     const id = confirmModal.id;
//     setConfirmModal({ show: false, id: null });

//     try {
//       const res = await fetch(`/api/admin/settings?id=${id}`, { 
//         method: 'DELETE'
//       });

//       if (res.status === 401 || res.status === 403) {
//         router.push('/admin/login');
//         return;
//       }

//       const data = await res.json();
//       if (data.success) {
//         showToast('সফলভাবে ডিলিট হয়েছে!', 'success');
//         fetchPayments();
//       } else {
//         showToast(data.message || 'সমস্যা হয়েছে!', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ত্রুটি ঘটেছে!', 'error');
//     }
//   };

//   if (loading) {
//     return <div className="p-8 text-white bg-[#030712] min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
//   }

//   return (
//     <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-8 text-white min-h-screen bg-[#07090e] relative">

//       {/* Toast (মাঝখানে) */}
//       {toast.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none px-4">
//           <div className={`px-5 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl font-bold text-sm sm:text-base text-center max-w-xs sm:max-w-sm ${
//             toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
//           }`}>
//             {toast.message}
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal (মাঝখানে) */}
//       {confirmModal.show && (
//         <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 px-4">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center shadow-2xl">
//             <i className="fa-solid fa-triangle-exclamation text-rose-400 text-3xl mb-3"></i>
//             <h3 className="text-sm sm:text-base font-bold text-white mb-4">
//               আপনি কি নিশ্চিত এই পেমেন্ট মেথডটি ডিলিট করতে চান?
//             </h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setConfirmModal({ show: false, id: null })}
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition"
//               >
//                 না
//               </button>
//               <button
//                 onClick={handleDeletePayment}
//                 className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition"
//               >
//                 হ্যাঁ, ডিলিট
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* পেজ হেডার ও নেভিগেশন */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl">
//         <div>
//           <h1 className="text-base sm:text-xl font-extrabold text-emerald-400">পেমেন্ট গেটওয়ে ম্যানেজমেন্ট</h1>
//           <p className="text-[11px] sm:text-xs text-slate-400 mt-1">বিকাশ, নগদ, রকেট, উপায় এবং ক্রিপ্টো গেটওয়ে ও লিমিট নিয়ন্ত্রণ করুন।</p>
//         </div>
//         <button 
//           onClick={() => router.back()} 
//           className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer border border-slate-700 self-start sm:self-auto"
//         >
//           ফিরে যান
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
//         {/* ফর্ম সেকশন */}
//         <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//           <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">নতুন নম্বর ও লিমিট যোগ করুন</h2>
//           <form onSubmit={handleAddPaymentNumber} className="space-y-4">
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">পেমেন্ট মেথড</label>
//               <select value={methodName} onChange={(e) => setMethodName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                 <option value="bKash">বিকাশ (bKash)</option>
//                 <option value="Nagad">নগদ (Nagad)</option>
//                 <option value="Rocket">রকেট (Rocket)</option>
//                 <option value="Upay">উপায় (Upay)</option>
//                 <option value="USDT">ইউএসডিটি (Binance Pay)</option>
//                 <option value="TRX">টিআরএক্স (TRX)</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">অ্যাকাউন্ট টাইপ</label>
//               <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                 <option value="Personal">পার্সোনাল (Personal)</option>
//                 <option value="Agent/Cashout">ক্যাশআউট / এজেন্ট (Agent/Cashout)</option>
//                 <option value="Crypto">ক্রিপ্টো ওয়ালেট (Crypto)</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 block mb-1">নম্বর (সর্বোচ্চ ১১ সংখ্যা)</label>
//               <input type="text" maxLength={11} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="01700000000" className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" required />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-slate-400 block mb-1">মিনিমাম ডিপোজিট</label>
//                 <input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-xs text-slate-400 block mb-1">মিনিমাম উইথড্র</label>
//                 <input type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//               </div>
//             </div>
//             <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer">সেভ করুন</button>
//           </form>
//         </div>

//         {/* লিস্ট বা টেবিল সেকশন */}
//         <div className="lg:col-span-2 bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
//           <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">গেটওয়ে লিস্ট (অন/অফ কন্ট্রোল)</h2>
//           <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
//             <table className="w-full text-left text-xs text-slate-300">
//               <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
//                 <tr>
//                   <th className="p-3 sm:p-4">মেথড</th>
//                   <th className="p-3 sm:p-4">টাইপ</th>
//                   <th className="p-3 sm:p-4">নম্বর</th>
//                   <th className="p-3 sm:p-4">স্ট্যাটাস</th>
//                   <th className="p-3 sm:p-4 text-center">অ্যাকশন</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800">
//                 {paymentSettings.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="p-8 text-center text-slate-500">কোনো পেমেন্ট গেটওয়ে পাওয়া যায়নি।</td>
//                   </tr>
//                 ) : (
//                   paymentSettings.map((p) => (
//                     <tr key={p._id} className="hover:bg-slate-900/50 transition">
//                       <td className="p-3 sm:p-4 font-bold text-white">{p.methodName}</td>
//                       <td className="p-3 sm:p-4 text-[11px] text-slate-400">{p.accountType}</td>
//                       <td className="p-3 sm:p-4 font-mono text-emerald-400 font-semibold">{p.accountNumber}</td>
//                       <td className="p-3 sm:p-4">
//                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
//                           {p.isActive ? 'ON' : 'OFF'}
//                         </span>
//                       </td>
//                       <td className="p-3 sm:p-4 text-center">
//                         <div className="flex items-center justify-center gap-1 sm:gap-2">
//                           <button onClick={() => handleTogglePayment(p._id, p.isActive)} className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer border whitespace-nowrap ${p.isActive ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border-amber-500/20' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'}`}>{p.isActive ? 'OFF' : 'ON'}</button>
//                           <button onClick={() => openDeleteConfirm(p._id)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer border border-rose-500/20 whitespace-nowrap">ডিলিট</button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>

//     </div>
//   );
// }

// ...........................................................................................

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentGatewayPage() {
  const router = useRouter();
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  // নতুন পেমেন্ট ফর্ম স্টেট
  const [methodName, setMethodName] = useState('bKash');
  const [accountType, setAccountType] = useState('Personal');
  const [accountNumber, setAccountNumber] = useState('');
  const [minDeposit, setMinDeposit] = useState(500);
  const [minWithdraw, setMinWithdraw] = useState(500);

  // 🔔 কাস্টম কনফার্ম মডাল স্টেট
  const [confirmData, setConfirmData] = useState(null);

  // 🍞 টোস্ট স্টেট
  const [toasts, setToasts] = useState([]);

  // 🍞 টোস্ট দেখানোর ফাংশন (মাঝখানে)
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 🔔 কাস্টম কনফার্ম ওপেন করার হেল্পার
  const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
    setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
  };

  // ডাটা ফেচ এবং হাই সিকিউরিটি চেক
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const settingsRes = await fetch(`/api/admin/settings?t=${Date.now()}`);
      if (settingsRes.status === 401 || settingsRes.status === 403) {
        router.push('/admin/login');
        return;
      }
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setPaymentSettings(settingsData.settings);
      }
    } catch (err) {
      console.error('Payment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [router]);

  // ✅ আসল সেভ করার কাজ (কনফার্মের পরে)
  const performAddPayment = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodName, accountType, accountNumber, minDeposit, minWithdraw })
      });

      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'সফলভাবে যোগ করা হয়েছে!', 'success');
        setAccountNumber('');
        fetchPayments();
      } else {
        showToast(data.message || 'সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    }
  };

  // 🎯 সেভ করুন — কনফার্ম সহ
  const handleAddPaymentNumber = (e) => {
    e.preventDefault();
    if (accountNumber.length !== 11 && methodName !== 'USDT' && methodName !== 'TRX') {
      showToast('অ্যাকাউন্ট নম্বর অবশ্যই ১১ সংখ্যার হতে হবে!', 'error');
      return;
    }

    askConfirm({
      title: 'নতুন গেটওয়ে যোগ নিশ্চিত করুন',
      message: `${methodName} (${accountType}) - ${accountNumber} নাম্বারটি যোগ করতে চান?`,
      icon: '➕',
      iconColor: 'emerald',
      confirmText: 'হ্যাঁ, সেভ করুন',
      confirmClass: 'emerald',
      onYes: performAddPayment
    });
  };

  // ✅ আসল টগল করার কাজ (কনফার্মের পরে)
  const performTogglePayment = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });

      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast(currentStatus ? 'মেথড OFF করা হয়েছে!' : 'মেথড ON করা হয়েছে!', 'success');
        fetchPayments();
      } else {
        showToast(data.message || 'সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    }
  };

  // 🎯 টগল — কনফার্ম সহ
  const handleTogglePayment = (id, currentStatus) => {
    askConfirm({
      title: currentStatus ? 'OFF নিশ্চিত করুন' : 'ON নিশ্চিত করুন',
      message: currentStatus
        ? 'আপনি কি এই পেমেন্ট গেটওয়েটি OFF করতে চান?'
        : 'আপনি কি এই পেমেন্ট গেটওয়েটি ON করতে চান?',
      icon: currentStatus ? '🚫' : '✅',
      iconColor: currentStatus ? 'rose' : 'emerald',
      confirmText: currentStatus ? 'হ্যাঁ, OFF করুন' : 'হ্যাঁ, ON করুন',
      confirmClass: currentStatus ? 'rose' : 'emerald',
      onYes: () => performTogglePayment(id, currentStatus)
    });
  };

  // ✅ আসল ডিলিট করার কাজ (কনফার্মের পরে)
  const performDeletePayment = async (id) => {
    try {
      const res = await fetch(`/api/admin/settings?id=${id}`, { method: 'DELETE' });

      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast('সফলভাবে ডিলিট হয়েছে!', 'success');
        fetchPayments();
      } else {
        showToast(data.message || 'সমস্যা হয়েছে!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('ত্রুটি ঘটেছে!', 'error');
    }
  };

  // 🎯 ডিলিট — কনফার্ম সহ
  const handleDeletePayment = (id) => {
    askConfirm({
      title: 'গেটওয়ে ডিলিট নিশ্চিত করুন',
      message: 'আপনি কি নিশ্চিত এই পেমেন্ট গেটওয়েটি ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।',
      icon: '🗑️',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, ডিলিট',
      confirmClass: 'rose',
      onYes: () => performDeletePayment(id)
    });
  };

  // 🎨 কালার ম্যাপ
  const iconColorMap = {
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const confirmBtnMap = {
    emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40',
    rose:    'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40',
    blue:    'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40',
  };

  const toastStyleMap = {
    success: { bg: 'bg-emerald-950/95 border-emerald-500/40', icon: '✅', iconBg: 'bg-emerald-500/20 text-emerald-400' },
    error:   { bg: 'bg-rose-950/95 border-rose-500/40',       icon: '❌', iconBg: 'bg-rose-500/20 text-rose-400' },
    info:    { bg: 'bg-blue-950/95 border-blue-500/40',       icon: 'ℹ️', iconBg: 'bg-blue-500/20 text-blue-400' },
  };

  if (loading) {
    return <div className="p-8 text-white bg-[#030712] min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-8 text-white min-h-screen bg-[#07090e] relative">

      {/* 🍞 টোস্ট কন্টেইনার — মাঝখানে */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = toastStyleMap[t.type] || toastStyleMap.success;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
              style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}>
                {s.icon}
              </div>
              <p className="flex-1 text-xs font-semibold text-white leading-relaxed">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* CSS অ্যানিমেশন */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* পেজ হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-base sm:text-xl font-extrabold text-emerald-400">পেমেন্ট গেটওয়ে ম্যানেজমেন্ট</h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">বিকাশ, নগদ, রকেট, উপায় এবং ক্রিপ্টো গেটওয়ে ও লিমিট নিয়ন্ত্রণ করুন।</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-300 transition cursor-pointer border border-slate-700 self-start sm:self-auto"
        >
          ফিরে যান
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* ফর্ম সেকশন */}
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">নতুন নম্বর ও লিমিট যোগ করুন</h2>
          <form onSubmit={handleAddPaymentNumber} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">পেমেন্ট মেথড</label>
              <select value={methodName} onChange={(e) => setMethodName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
                <option value="Rocket">রকেট (Rocket)</option>
                <option value="Upay">উপায় (Upay)</option>
                <option value="USDT">ইউএসডিটি (Binance Pay)</option>
                <option value="TRX">টিআরএক্স (TRX)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">অ্যাকাউন্ট টাইপ</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
                <option value="Personal">পার্সোনাল (Personal)</option>
                <option value="Agent/Cashout">ক্যাশআউট / এজেন্ট (Agent/Cashout)</option>
                <option value="Crypto">ক্রিপ্টো ওয়ালেট (Crypto)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">নম্বর (সর্বোচ্চ ১১ সংখ্যা)</label>
              <input type="text" maxLength={11} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="01700000000" className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">মিনিমাম ডিপোজিট</label>
                <input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">মিনিমাম উইথড্র</label>
                <input type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer">সেভ করুন</button>
          </form>
        </div>

        {/* লিস্ট বা টেবিল সেকশন */}
        <div className="lg:col-span-2 bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">গেটওয়ে লিস্ট (অন/অফ কন্ট্রোল)</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 sm:p-4">মেথড</th>
                  <th className="p-3 sm:p-4">টাইপ</th>
                  <th className="p-3 sm:p-4">নম্বর</th>
                  <th className="p-3 sm:p-4">স্ট্যাটাস</th>
                  <th className="p-3 sm:p-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paymentSettings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">কোনো পেমেন্ট গেটওয়ে পাওয়া যায়নি।</td>
                  </tr>
                ) : (
                  paymentSettings.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 sm:p-4 font-bold text-white">{p.methodName}</td>
                      <td className="p-3 sm:p-4 text-[11px] text-slate-400">{p.accountType}</td>
                      <td className="p-3 sm:p-4 font-mono text-emerald-400 font-semibold">{p.accountNumber}</td>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {p.isActive ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button onClick={() => handleTogglePayment(p._id, p.isActive)} className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer border whitespace-nowrap ${p.isActive ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border-amber-500/20' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'}`}>{p.isActive ? 'OFF' : 'ON'}</button>
                          <button onClick={() => handleDeletePayment(p._id)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer border border-rose-500/20 whitespace-nowrap">ডিলিট</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🔔 কাস্টম কনফার্ম মডাল */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[90] p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl shadow-emerald-950/40">

            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}>
                {confirmData.icon}
              </div>
              <h3 className="text-base font-extrabold text-white">{confirmData.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{confirmData.message}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmData(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
              >
                না
              </button>
              <button
                onClick={() => {
                  confirmData.onYes?.();
                  setConfirmData(null);
                }}
                className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
                  confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald
                }`}
              >
                {confirmData.confirmText || 'হ্যাঁ, নিশ্চিত'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
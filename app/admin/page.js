// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import LiveBetTrackingCard from '@/components/LiveBetTrackingCard'; // পাথ আপনার প্রজেক্ট অনুযায়ী ঠিক করে নেবেন

// export default function AdminHomePage() {
//   const router = useRouter();
//   const [stats, setStats] = useState({ totalUsers: 0, totalDepositToday: 0, totalWithdrawToday: 0, netProfitOrLoss: 0 });
//   const [users, setUsers] = useState([]);
//   const [paymentSettings, setPaymentSettings] = useState([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);

//   // নোট এবং অ্যাকশন স্টেট
//   const [actionNote, setActionNote] = useState('');
//   const [activeTab, setActiveTab] = useState('users'); // 'users', 'payments', 'payment-methods'

//   // নতুন পেমেন্ট ফর্ম স্টেট
//   const [methodName, setMethodName] = useState('bKash');
//   const [accountType, setAccountType] = useState('Personal');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [minDeposit, setMinDeposit] = useState(500);
//   const [minWithdraw, setMinWithdraw] = useState(500);

//   // ইউজার এডিটিং স্টেট
//   const [editingUser, setEditingUser] = useState(null);
//   const [newBalance, setNewBalance] = useState('');
//   const [newTurnover, setNewTurnover] = useState('');
//   const [newIp, setNewIp] = useState('');

//   const fetchData = async (search = '') => {
//     try {
//       setLoading(true);

//       const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
//       const statsData = await statsRes.json();
//       if (statsData.success) setStats(statsData.stats);

//       const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
//       const usersData = await usersRes.json();
//       if (usersData.success) setUsers(usersData.users);

//       const settingsRes = await fetch(`/api/admin/settings?t=${Date.now()}`);
//       const settingsData = await settingsRes.json();
//       if (settingsData.success) setPaymentSettings(settingsData.settings);

//     } catch (err) {
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();

//     // প্রতি ৫ সেকেন্ড পর পর অটো রিয়েল-টাইম আপডেট
//     const interval = setInterval(() => {
//       fetchData(searchQuery);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [searchQuery]);

//   // পেমেন্ট নম্বর অ্যাড হ্যান্ডলার
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
//       const data = await res.json();
//       if (data.success) {
//         alert(data.message);
//         setAccountNumber('');
//         fetchData();
//       }
//     } catch (err) { console.error(err); }
//   };

//   // পেমেন্ট টগল ও ডিলিট
//   const handleTogglePayment = async (id, currentStatus) => {
//     await fetch('/api/admin/settings', {
//       method: 'PATCH',
//       headers: { 
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ id, isActive: !currentStatus })
//     });
//     fetchData();
//   };

//   const handleDeletePayment = async (id) => {
//     if (!confirm('ডিলিট করতে চান?')) return;

//     await fetch(`/api/admin/settings?id=${id}`, { 
//       method: 'DELETE'
//     });
//     fetchData();
//   };

//   // ইউজার আপডেট ও ডিলিট
//   const handleUpdateUser = async (userId, updateData) => {
//     const res = await fetch('/api/admin/users', {
//       method: 'PATCH',
//       headers: { 
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ userId, ...updateData })
//     });
//     const data = await res.json();
//     alert(data.message);
//     setEditingUser(null);
//     fetchData(searchQuery);
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm('ডিলিট করতে চান?')) return;

//     await fetch(`/api/admin/users?userId=${userId}`, { 
//       method: 'DELETE'
//     });
//     fetchData(searchQuery);
//   };

//   return (
//     <div className="min-h-screen bg-[#030712] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] text-slate-100 p-4 md:p-8 space-y-6 font-sans selection:bg-emerald-500 selection:text-white">
      
//       {/* প্রিমিয়াম গ্লাস হেডার */}
//       <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="space-y-1 relative z-10">
//           <div className="flex items-center gap-2.5">
//             <span className="relative flex h-3 w-3">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
//             </span>
//             <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
//               অ্যাডমিন কন্ট্রোল সেন্টার
//             </h1>
//           </div>
//           <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম বেটিং সিস্টেম, সিকিউরিটি ও ফিন্যান্সিয়াল ওভারভিউ</p>
//         </div>
//         <button 
//           onClick={() => fetchData(searchQuery)} 
//           className="relative z-10 group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/20 transition-all duration-300 active:scale-95"
//         >
//           <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
//           ডেটা সিঙ্ক করুন
//         </button>
//       </div>

//       {/* স্টাইলিশ ও স্লিম স্ট্যাটিস্টিক্স গ্রিড কার্ডস */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
//         {/* মোট ইউজার কার্ড */}
//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
//           <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">মোট ইউজার</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{stats.totalUsers}</h2>
//           </div>
//         </div>

//         {/* আজকের ডিপোজিট কার্ড */}
//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
//           <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">আজকের ডিপোজিট</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">৳{stats.totalDepositToday}</h2>
//           </div>
//         </div>

//         {/* আজকের উইথড্র কার্ড */}
//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
//           <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-all"></div>
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">আজকের উইথড্র</span>
//             <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-rose-400 tracking-tight">৳{stats.totalWithdrawToday}</h2>
//           </div>
//         </div>

//         {/* নিট লাভ / লস কার্ড */}
//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
//           <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">নিট লাভ / লস</span>
//             <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">📊</div>
//           </div>
//           <div className="mt-3">
//             <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${stats.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
//               ৳{stats.netProfitOrLoss}
//             </h2>
//           </div>
//         </div>

//       </div>

//       {/* এক্সটার্নাল লাইভ বেট ট্র্যাকিং কম্পোনেন্ট (সেলফ-কন্টেইন্ড) */}
//       <LiveBetTrackingCard />

//       {/* নেভিগেশন ট্যাব বার */}
//       <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
//         <button onClick={() => setActiveTab('users')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'users' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
//           👤 ইউজার ম্যানেজমেন্ট
//         </button>
        
//         <button 
//           onClick={() => router.push('/admin/deposits')} 
//           className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-2"
//         >
//           📥 ডিপোজিট ম্যানেজমেন্ট
//         </button>

//         <button 
//           onClick={() => router.push('/admin/withdraws')} 
//           className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-2"
//         >
//           📤 উইথড্র ম্যানেজমেন্ট
//         </button>

//         <button 
//           onClick={() => router.push('/admin/referrals')} 
//           className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 flex items-center gap-2"
//         >
//           🤝 রেফারেল ম্যানেজমেন্ট
//         </button>

//         <button onClick={() => setActiveTab('payments')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'payments' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
//           💳 পেমেন্ট গেটওয়ে
//         </button>
        
//         <button 
//           onClick={() => router.push('/admin/payment-methods')} 
//           className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-2"
//         >
//           🌐 মেথডস পেজ
//         </button>
//       </div>

//       {/* ট্যাব ১: ইউজার ম্যানেজমেন্ট */}
//       {activeTab === 'users' && (
//         <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//             <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span> ইউজার লিস্ট ও সার্চ কন্ট্রোল
//             </h2>
//             <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
//               <input 
//                 type="text" 
//                 placeholder="ফোন, আইডি বা আইপি দিয়ে খুঁজুন..." 
//                 value={searchQuery} 
//                 onChange={(e) => {
//                   if (e.target.value.length <= 11) {
//                     setSearchQuery(e.target.value);
//                   }
//                 }} 
//                 maxLength={11}
//                 className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs outline-none w-full md:w-72 text-white focus:border-emerald-500 transition-all font-mono" 
//               />
//               <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-900/30 transition-all">সার্চ</button>
//             </form>
//           </div>
//           <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//             <table className="w-full text-left text-xs text-slate-300">
//               <thead className="bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
//                 <tr>
//                   <th className="p-3.5">ইউজার আইডি (UID)</th>
//                   <th className="p-3.5">ফোন নম্বর</th>
//                   <th className="p-3.5">ব্যালেন্স</th>
//                   <th className="p-3.5">টার্নওভার</th>
//                   <th className="p-3.5">আইপি অ্যাড্রেস</th>
//                   <th className="p-3.5">স্ট্যাটাস</th>
//                   <th className="p-3.5 text-center">অ্যাকশন</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800/60">
//                 {users.map((u) => (
//                   <tr key={u._id} className="hover:bg-slate-900/60 transition-colors">
//                     <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
//                     <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
//                     <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
//                     <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
//                     <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
//                     <td className="p-3.5">
//                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
//                         {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
//                       </span>
//                     </td>
//                     <td className="p-3.5 text-center space-x-1.5">
//                       <button onClick={() => { setEditingUser(u.uid); setNewBalance(u.balance); setNewTurnover(u.turnover || 0); setNewIp(u.ipAddress || ''); }} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all border border-blue-500/20">এডিট</button>
//                       <button onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })} className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${u.isBlocked ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20' : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'}`}>{u.isBlocked ? 'আনব্লক' : 'ব্লক'}</button>
//                       <button onClick={() => handleDeleteUser(u.uid)} className="bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all">ডিলিট</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ট্যাব ৪: পেমেন্ট গেটওয়ে */}
//       {activeTab === 'payments' && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           <div className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
//             <h2 className="text-sm font-bold text-slate-200">নতুন নম্বর ও লিমিট যোগ করুন</h2>
//             <form onSubmit={handleAddPaymentNumber} className="space-y-3.5">
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">পেমেন্ট মেথড</label>
//                 <select value={methodName} onChange={(e) => setMethodName(e.target.value)} className="w-full bg-slate-950/80 border border-slate-700/60 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                   <option value="bKash">বিকাশ (bKash)</option>
//                   <option value="Nagad">নগদ (Nagad)</option>
//                   <option value="Rocket">রকেট (Rocket)</option>
//                   <option value="Upay">উপায় (Upay)</option>
//                   <option value="USDT">ইউএসডিটি (USDT)</option>
//                   <option value="TRX">টিআরএক্স (TRX)</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">অ্যাকাউন্ট টাইপ</label>
//                 <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full bg-slate-950/80 border border-slate-700/60 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500">
//                   <option value="Personal">পার্সোনাল (Personal)</option>
//                   <option value="Agent/Cashout">ক্যাশআউট / এজেন্ট (Agent/Cashout)</option>
//                   <option value="Crypto">ক্রিপ্টো ওয়ালেট (Crypto)</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">নম্বর (সর্বোচ্চ ১১ সংখ্যা)</label>
//                 <input type="text" maxLength={11} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="01700000000" className="w-full bg-slate-950/80 border border-slate-700/60 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" required />
//               </div>
//               <div className="grid grid-cols-2 gap-2.5">
//                 <div>
//                   <label className="text-[11px] font-semibold text-slate-400 block mb-1">মিনিমাম ডিপোজিট</label>
//                   <input type="number" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-slate-950/80 border border-slate-700/60 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//                 </div>
//                 <div>
//                   <label className="text-[11px] font-semibold text-slate-400 block mb-1">মিনিমাম উইথড্র</label>
//                   <input type="number" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} className="w-full bg-slate-950/80 border border-slate-700/60 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono" />
//                 </div>
//               </div>
//               <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-emerald-950/50 transition-all mt-1">সেভ করুন</button>
//             </form>
//           </div>

//           <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
//             <h2 className="text-sm font-bold text-slate-200">গেটওয়ে লিস্ট (অন/অফ কন্ট্রোল)</h2>
//             <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//               <table className="w-full text-left text-xs text-slate-300">
//                 <thead className="bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
//                   <tr>
//                     <th className="p-3.5">মেথড</th>
//                     <th className="p-3.5">টাইপ</th>
//                     <th className="p-3.5">নম্বর</th>
//                     <th className="p-3.5">স্ট্যাটাস</th>
//                     <th className="p-3.5 text-center">অ্যাকশন</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-800/60">
//                   {paymentSettings.map((p) => (
//                     <tr key={p._id} className="hover:bg-slate-900/60 transition-colors">
//                       <td className="p-3.5 font-bold text-white">{p.methodName}</td>
//                       <td className="p-3.5 text-[11px] text-slate-400">{p.accountType}</td>
//                       <td className="p-3.5 font-mono text-emerald-400 font-semibold">{p.accountNumber}</td>
//                       <td className="p-3.5">
//                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
//                           {p.isActive ? 'ON' : 'OFF'}
//                         </span>
//                       </td>
//                       <td className="p-3.5 text-center space-x-1.5">
//                         <button onClick={() => handleTogglePayment(p._id, p.isActive)} className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${p.isActive ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border-amber-500/20' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'}`}>{p.isActive ? 'OFF করুন' : 'ON করুন'}</button>
//                         <button onClick={() => handleDeletePayment(p._id)} className="bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all">ডিলিট</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ইউজার এডিট মডাল */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
//             <h3 className="text-base font-extrabold text-white flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></span> ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span>
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">ব্যালেন্স:</label>
//                 <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">টার্নওভার:</label>
//                 <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">আইপি অ্যাড্রেস:</label>
//                 <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//             </div>
//             <div className="flex gap-2 pt-1">
//               <button onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all">আপডেট করুন</button>
//               <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs transition-all">বাতিল</button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
// // 434 code lines in this file.

// ...................................................

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

// export default function AdminHomePage() {
//   const router = useRouter();
//   const [stats, setStats] = useState({ totalUsers: 0, totalDepositToday: 0, totalWithdrawToday: 0, netProfitOrLoss: 0 });
//   const [users, setUsers] = useState([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState('users'); // শুধু ইউজার ম্যানেজমেন্ট ট্যাব রয়েছে

//   // ইউজার এডিটিং স্টেট
//   const [editingUser, setEditingUser] = useState(null);
//   const [newBalance, setNewBalance] = useState('');
//   const [newTurnover, setNewTurnover] = useState('');
//   const [newIp, setNewIp] = useState('');

//   const fetchData = async (search = '') => {
//     try {
//       setLoading(true);

//       const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
//       const statsData = await statsRes.json();
//       if (statsData.success) setStats(statsData.stats);

//       const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
//       const usersData = await usersRes.json();
//       if (usersData.success) setUsers(usersData.users);

//     } catch (err) {
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();

//     const interval = setInterval(() => {
//       fetchData(searchQuery);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [searchQuery]);

//   // ইউজার আপডেট ও ডিলিট
//   const handleUpdateUser = async (userId, updateData) => {
//     const res = await fetch('/api/admin/users', {
//       method: 'PATCH',
//       headers: { 
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ userId, ...updateData })
//     });
//     const data = await res.json();
//     alert(data.message);
//     setEditingUser(null);
//     fetchData(searchQuery);
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm('ডিলিট করতে চান?')) return;

//     await fetch(`/api/admin/users?userId=${userId}`, { 
//       method: 'DELETE'
//     });
//     fetchData(searchQuery);
//   };

//   return (
//     <div className="min-h-screen bg-[#030712] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] text-slate-100 p-4 md:p-8 space-y-6 font-sans selection:bg-emerald-500 selection:text-white">
      
//       {/* প্রিমিয়াম গ্লাস হেডার */}
//       <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="space-y-1 relative z-10">
//           <div className="flex items-center gap-2.5">
//             <span className="relative flex h-3 w-3">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
//             </span>
//             <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
//               অ্যাডমিন কন্ট্রোল সেন্টার
//             </h1>
//           </div>
//           <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম বেটিং সিস্টেম, সিকিউরিটি ও ফিন্যান্সিয়াল ওভারভিউ</p>
//         </div>
//         <button 
//           onClick={() => fetchData(searchQuery)} 
//           className="relative z-10 group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/25 transition-all duration-300 active:scale-95"
//         >
//           <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
//           ডেটা সিঙ্ক করুন
//         </button>
//       </div>

//       {/* স্ট্যাটিস্টিক্স গ্রিড কার্ডস */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">মোট ইউজার</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{stats.totalUsers}</h2>
//           </div>
//         </div>

//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">আজকের ডিপোজিট</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">৳{stats.totalDepositToday}</h2>
//           </div>
//         </div>

//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">আজকের উইথড্র</span>
//             <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
//           </div>
//           <div className="mt-3">
//             <h2 className="text-2xl md:text-3xl font-black text-rose-400 tracking-tight">৳{stats.totalWithdrawToday}</h2>
//           </div>
//         </div>

//         <div className="relative bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">নিট লাভ / লস</span>
//             <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">📊</div>
//           </div>
//           <div className="mt-3">
//             <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${stats.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
//               ৳{stats.netProfitOrLoss}
//             </h2>
//           </div>
//         </div>
//       </div>

//       {/* লাইভ বেট ট্র্যাকিং কম্পোনেন্ট */}
//       <LiveBetTrackingCard />

//       {/* নেভিগেশন ট্যাব বার (পেমেন্ট গেটওয়ে এখন সরাসরি নতুন পেজে লিংক করা) */}
//       <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
//         <button onClick={() => setActiveTab('users')} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40 flex items-center gap-2">
//           👤 ইউজার ম্যানেজমেন্ট
//         </button>
        
//         <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
//           📥 ডিপোজিট ম্যানেজমেন্ট
//         </button>

//         <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
//           📤 উইথড্র ম্যানেজমেন্ট
//         </button>

//         <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-2">
//           🤝 রেফারেল ম্যানেজমেন্ট
//         </button>

//         {/* পেমেন্ট গেটওয়ে নতুন আলাদা পেজে রাউট হবে */}
//         <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
//           💳 পেমেন্ট গেটওয়ে
//         </button>
        
//         <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
//           🌐 মেথডস পেজ
//         </button>
//       </div>

//       {/* ইউজার ম্যানেজমেন্ট সেকশন */}
//       <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//           <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span> ইউজার লিস্ট ও সার্চ কন্ট্রোল
//           </h2>
//           <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
//             <input 
//               type="text" 
//               placeholder="ফোন, আইডি বা আইপি দিয়ে খুঁজুন..." 
//               value={searchQuery} 
//               onChange={(e) => {
//                 if (e.target.value.length <= 11) {
//                   setSearchQuery(e.target.value);
//                 }
//               }} 
//               maxLength={11}
//               className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs outline-none w-full md:w-72 text-white focus:border-emerald-500 transition-all font-mono" 
//             />
//             <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-900/30 transition-all">সার্চ</button>
//           </form>
//         </div>
//         <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//           <table className="w-full text-left text-xs text-slate-300">
//             <thead className="bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
//               <tr>
//                 <th className="p-3.5">ইউজার আইডি (UID)</th>
//                 <th className="p-3.5">ফোন নম্বর</th>
//                 <th className="p-3.5">ব্যালেন্স</th>
//                 <th className="p-3.5">টার্নওভার</th>
//                 <th className="p-3.5">আইপি অ্যাড্রেস</th>
//                 <th className="p-3.5">স্ট্যাটাস</th>
//                 <th className="p-3.5 text-center">অ্যাকশন</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/60">
//               {users.map((u) => (
//                 <tr key={u._id} className="hover:bg-slate-900/60 transition-colors">
//                   <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
//                   <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
//                   <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
//                   <td className="p-3.5">
//                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
//                       <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
//                       {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
//                     </span>
//                   </td>
//                   <td className="p-3.5 text-center space-x-1.5">
//                     <button onClick={() => { setEditingUser(u.uid); setNewBalance(u.balance); setNewTurnover(u.turnover || 0); setNewIp(u.ipAddress || ''); }} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all border border-blue-500/20">এডিট</button>
//                     <button onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })} className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${u.isBlocked ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20' : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'}`}>{u.isBlocked ? 'আনব্লক' : 'ব্লক'}</button>
//                     <button onClick={() => handleDeleteUser(u.uid)} className="bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all">ডিলিট</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ইউজার এডিট মডাল */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
//             <h3 className="text-base font-extrabold text-white flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></span> ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span>
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">ব্যালেন্স:</label>
//                 <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">টার্নওভার:</label>
//                 <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] font-semibold text-slate-400 block mb-1">আইপি অ্যাড্রেস:</label>
//                 <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs outline-none focus:border-emerald-500 font-mono" />
//               </div>
//             </div>
//             <div className="flex gap-2 pt-1">
//               <button onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all">আপডেট করুন</button>
//               <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs transition-all">বাতিল</button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// .................................................

// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

// export default function AdminHomePage() {
//   const router = useRouter();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalDeposit: 0,
//     totalWithdraw: 0,
//     totalUserBalance: 0,
//     totalReferralBonus: 0,
//     adminNetProfit: 0
//   });
//   const [users, setUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('users');

//   const [editingUser, setEditingUser] = useState(null);
//   const [newBalance, setNewBalance] = useState('');
//   const [newTurnover, setNewTurnover] = useState('');
//   const [newIp, setNewIp] = useState('');

//   const fetchData = async (search = '') => {
//     try {
//       setLoading(true);
//       const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
//       const statsData = await statsRes.json();
//       if (statsData.success) setStats(statsData.stats);

//       const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
//       const usersData = await usersRes.json();
//       if (usersData.success) setUsers(usersData.users);
//     } catch (err) {
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => { fetchData(searchQuery); }, 5000);
//     return () => clearInterval(interval);
//   }, [searchQuery]);

//   const handleUpdateUser = async (userId, updateData) => {
//     const res = await fetch('/api/admin/users', {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ userId, ...updateData })
//     });
//     const data = await res.json();
//     alert(data.message);
//     setEditingUser(null);
//     fetchData(searchQuery);
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm('ডিলিট করতে চান?')) return;
//     await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
//     fetchData(searchQuery);
//   };

//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   return (
//     <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">

//       {/* হেডার */}
//       <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="space-y-1 relative z-10">
//           <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
//             অ্যাডমিন কন্ট্রোল সেন্টার
//           </h1>
//           <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ</p>
//         </div>
//         <button
//           onClick={() => fetchData(searchQuery)}
//           className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
//         >
//           <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
//           ডেটা সিঙ্ক করুন
//         </button>
//       </div>

//       {/* ================= ৬টি লাভ হিসাব কার্ড ================= */}
//       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-white">{fmt(stats.totalUsers)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ডিপোজিট</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-emerald-400">৳{fmt(stats.totalDeposit)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট উইথড্র</span>
//             <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-rose-400">৳{fmt(stats.totalWithdraw)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার বেলেন্স</span>
//             <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">💰</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400">৳{fmt(stats.totalUserBalance)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রেফারেল বোনাস</span>
//             <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20">🤝</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-purple-400">৳{fmt(stats.totalReferralBonus)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-emerald-500/40 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-emerald-300 uppercase">অ্যাডমিনের নিট লাভ</span>
//             <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30">📊</div>
//           </div>
//           <h2 className={`mt-3 text-2xl md:text-3xl font-black ${stats.adminNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
//             ৳{fmt(stats.adminNetProfit)}
//           </h2>
//         </div>

//       </div>

//       <LiveBetTrackingCard />

//       {/* নেভিগেশন */}
//       <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
//         <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
//           👤 ইউজার 
//         </button>
//         <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📥 ডিপোজিট</button>
//         <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📤 উইথড্র</button>
//         <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">🤝 রেফারেল</button>
//         <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">💳 পেমেন্ট</button>
//         <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">🌐 মেথডস</button>
//       </div>

//       {/* ইউজার লিস্ট */}
//       <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//           <h2 className="text-sm font-bold text-slate-200">ইউজার লিস্ট ও সার্চ</h2>
//           <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
//             <input
//               type="text"
//               placeholder="ফোন, আইডি বা আইপি..."
//               value={searchQuery}
//               onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
//               maxLength={11}
//               className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
//             />
//             <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs">সার্চ</button>
//           </form>
//         </div>
//         <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//           <table className="w-full min-w-[900px] text-left text-xs text-slate-300">
//             <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
//               <tr>
//                 <th className="p-3.5">UID</th>
//                 <th className="p-3.5">ফোন</th>
//                 <th className="p-3.5">ব্যালেন্স</th>
//                 <th className="p-3.5">টার্নওভার</th>
//                 <th className="p-3.5">আইপি</th>
//                 <th className="p-3.5">স্ট্যাটাস</th>
//                 <th className="p-3.5 text-center">অ্যাকশন</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/60">
//               {users.map((u) => (
//                 <tr key={u._id} className="hover:bg-slate-900/60">
//                   <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
//                   <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
//                   <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
//                   <td className="p-3.5">
//                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
//                       {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
//                     </span>
//                   </td>
//                   <td className="p-3.5 text-center space-x-1.5">
//                     <button onClick={() => { setEditingUser(u.uid); setNewBalance(u.balance); setNewTurnover(u.turnover || 0); setNewIp(u.ipAddress || ''); }} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold border border-blue-500/20">এডিট</button>
//                     <button onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })} className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${u.isBlocked ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-600/20 text-rose-400 border-rose-500/20'}`}>{u.isBlocked ? 'আনব্লক' : 'ব্লক'}</button>
//                     <button onClick={() => handleDeleteUser(u.uid)} className="bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold">ডিলিট</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* এডিট মডাল */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
//             <h3 className="text-base font-extrabold text-white">ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span></h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">ব্যালেন্স:</label>
//                 <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">টার্নওভার:</label>
//                 <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">আইপি:</label>
//                 <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//             </div>
//             <div className="flex gap-2 pt-1">
//               <button onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs">আপডেট</button>
//               <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs">বাতিল</button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// // .......................................................
// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

// export default function AdminHomePage() {
//   const router = useRouter();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalDeposit: 0,
//     totalWithdraw: 0,
//     totalUserBalance: 0,
//     totalReferralBonus: 0,
//     adminNetProfit: 0
//   });
//   const [users, setUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('users');

//   const [editingUser, setEditingUser] = useState(null);
//   const [newBalance, setNewBalance] = useState('');
//   const [newTurnover, setNewTurnover] = useState('');
//   const [newIp, setNewIp] = useState('');

//   // 🔔 কাস্টম কনফার্ম মডাল
//   const [confirmData, setConfirmData] = useState(null);

//   // 🍞 টোস্ট স্টেট
//   const [toasts, setToasts] = useState([]);

//   // 🍞 টোস্ট দেখানোর ফাংশন (মাঝখানে)
//   const showToast = (message, type = 'success') => {
//     const id = Date.now() + Math.random();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((t) => t.id !== id));
//     }, 3000);
//   };

//   const removeToast = (id) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   };

//   const fetchData = async (search = '') => {
//     try {
//       setLoading(true);
//       const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
//       const statsData = await statsRes.json();
//       if (statsData.success) setStats(statsData.stats);

//       const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
//       const usersData = await usersRes.json();
//       if (usersData.success) setUsers(usersData.users);
//     } catch (err) {
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(() => { fetchData(searchQuery); }, 5000);
//     return () => clearInterval(interval);
//   }, [searchQuery]);

//   const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
//     setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
//   };

//   // ✅ আসল আপডেট কাজ (alert বাদ — টোস্ট ব্যবহার)
//   const performUpdateUser = async (userId, updateData) => {
//     try {
//       const res = await fetch('/api/admin/users', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, ...updateData })
//       });
//       const data = await res.json();
//       showToast(data.message || 'সফলভাবে আপডেট হয়েছে', 'success');
//       setEditingUser(null);
//       fetchData(searchQuery);
//     } catch (err) {
//       showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
//     }
//   };

//   // ✅ আসল ডিলিট কাজ (alert বাদ — টোস্ট ব্যবহার)
//   const performDeleteUser = async (userId) => {
//     try {
//       await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
//       showToast(`ইউজার ${userId} ডিলিট হয়েছে`, 'success');
//       fetchData(searchQuery);
//     } catch (err) {
//       showToast('ডিলিট করতে সমস্যা হয়েছে', 'error');
//     }
//   };

//   // 🎯 এডিট সেভ / ব্লক / আনব্লক — কনফার্ম সহ
//   const handleUpdateUser = (userId, updateData) => {
//     let title = 'তথ্য আপডেট নিশ্চিত করুন';
//     let message = 'আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?';
//     let icon = '✏️';
//     let iconColor = 'blue';
//     let confirmText = 'হ্যাঁ, আপডেট';
//     let confirmClass = 'blue';

//     if (updateData.isBlocked === true) {
//       title = 'ইউজার ব্লক নিশ্চিত করুন';
//       message = 'আপনি কি এই ইউজারকে ব্লক করতে চান?';
//       icon = '🚫';
//       iconColor = 'rose';
//       confirmText = 'হ্যাঁ, ব্লক';
//       confirmClass = 'rose';
//     }
//     if (updateData.isBlocked === false) {
//       title = 'ইউজার আনব্লক নিশ্চিত করুন';
//       message = 'আপনি কি এই ইউজারকে আনব্লক করতে চান?';
//       icon = '✅';
//       iconColor = 'emerald';
//       confirmText = 'হ্যাঁ, আনব্লক';
//       confirmClass = 'emerald';
//     }

//     askConfirm({
//       title, message, icon, iconColor, confirmText, confirmClass,
//       onYes: () => performUpdateUser(userId, updateData)
//     });
//   };

//   // 🎯 ডিলিট — কনফার্ম সহ
//   const handleDeleteUser = (userId) => {
//     askConfirm({
//       title: 'ইউজার ডিলিট নিশ্চিত করুন',
//       message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
//       icon: '🗑️',
//       iconColor: 'rose',
//       confirmText: 'হ্যাঁ, ডিলিট',
//       confirmClass: 'rose',
//       onYes: () => performDeleteUser(userId)
//     });
//   };

//   // 🎯 এডিট বাটনে ক্লিক — কনফার্ম সহ
//   const handleEditClick = (u) => {
//     askConfirm({
//       title: 'ইউজার এডিট নিশ্চিত করুন',
//       message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
//       icon: '✏️',
//       iconColor: 'blue',
//       confirmText: 'হ্যাঁ, এডিট',
//       confirmClass: 'blue',
//       onYes: () => {
//         setEditingUser(u.uid);
//         setNewBalance(u.balance);
//         setNewTurnover(u.turnover || 0);
//         setNewIp(u.ipAddress || '');
//       }
//     });
//   };

//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   const iconColorMap = {
//     amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
//     emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
//     rose:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
//     blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
//   };

//   const confirmBtnMap = {
//     emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40',
//     rose:    'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40',
//     blue:    'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40',
//   };

//   const toastStyleMap = {
//     success: { bg: 'bg-emerald-950/95 border-emerald-500/40', icon: '✅', iconBg: 'bg-emerald-500/20 text-emerald-400' },
//     error:   { bg: 'bg-rose-950/95 border-rose-500/40',       icon: '❌', iconBg: 'bg-rose-500/20 text-rose-400' },
//     info:    { bg: 'bg-blue-950/95 border-blue-500/40',       icon: 'ℹ️', iconBg: 'bg-blue-500/20 text-blue-400' },
//   };

//   return (
//     <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">

//       {/* 🍞 টোস্ট কন্টেইনার — মাঝখানে */}
//       <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
//         {toasts.map((t) => {
//           const s = toastStyleMap[t.type] || toastStyleMap.success;
//           return (
//             <div
//               key={t.id}
//               className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
//               style={{ animation: 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
//             >
//               <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}>
//                 {s.icon}
//               </div>
//               <p className="flex-1 text-xs font-semibold text-white leading-relaxed">{t.message}</p>
//               <button
//                 onClick={() => removeToast(t.id)}
//                 className="flex-shrink-0 text-slate-400 hover:text-white text-xs transition-colors"
//               >
//                 ✕
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* CSS অ্যানিমেশন — উপর থেকে নিচে */}
//       <style jsx global>{`
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-30px) scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0) scale(1);
//           }
//         }
//       `}</style>

//       {/* হেডার */}
//       <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="space-y-1 relative z-10">
//           <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
//             অ্যাডমিন কন্ট্রোল সেন্টার
//           </h1>
//           <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ</p>
//         </div>
//         <button
//           onClick={() => fetchData(searchQuery)}
//           className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
//         >
//           <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
//           ডেটা সিঙ্ক করুন
//         </button>
//       </div>

//       {/* ================= ৬টি কার্ড ================= */}
//       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-white">{fmt(stats.totalUsers)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ডিপোজিট</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-emerald-400">৳{fmt(stats.totalDeposit)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট উইথড্র</span>
//             <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-rose-400">৳{fmt(stats.totalWithdraw)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার বেলেন্স</span>
//             <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">💰</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400">৳{fmt(stats.totalUserBalance)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রেফারেল বোনাস</span>
//             <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20">🤝</div>
//           </div>
//           <h2 className="mt-3 text-2xl md:text-3xl font-black text-purple-400">৳{fmt(stats.totalReferralBonus)}</h2>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-emerald-500/40 shadow-xl">
//           <div className="flex items-center justify-between">
//             <span className="text-[11px] font-bold text-emerald-300 uppercase">অ্যাডমিনের নিট লাভ</span>
//             <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30">📊</div>
//           </div>
//           <h2 className={`mt-3 text-2xl md:text-3xl font-black ${stats.adminNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
//             ৳{fmt(stats.adminNetProfit)}
//           </h2>
//         </div>

//       </div>

//       <LiveBetTrackingCard />

//       {/* নেভিগেশন */}
//       <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
//         <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
//           👤 ইউজার 
//         </button>
//         <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📥 ডিপোজিট</button>
//         <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📤 উইথড্র</button>
//         <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">🤝 রেফারেল</button>
//         <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">💳 পেমেন্ট</button>
//         <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">🌐 মেথডস</button>
//       </div>

//       {/* ইউজার লিস্ট */}
//       <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//           <h2 className="text-sm font-bold text-slate-200">ইউজার লিস্ট ও সার্চ</h2>
//           <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
//             <input
//               type="text"
//               placeholder="ফোন, আইডি বা আইপি..."
//               value={searchQuery}
//               onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
//               maxLength={11}
//               className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
//             />
//             <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs">সার্চ</button>
//           </form>
//         </div>
//         <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
//           <table className="w-full min-w-[900px] text-left text-xs text-slate-300">
//             <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
//               <tr>
//                 <th className="p-3.5">UID</th>
//                 <th className="p-3.5">ফোন</th>
//                 <th className="p-3.5">ব্যালেন্স</th>
//                 <th className="p-3.5">টার্নওভার</th>
//                 <th className="p-3.5">আইপি</th>
//                 <th className="p-3.5">স্ট্যাটাস</th>
//                 <th className="p-3.5 text-center">অ্যাকশন</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/60">
//               {users.map((u) => (
//                 <tr key={u._id} className="hover:bg-slate-900/60">
//                   <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
//                   <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
//                   <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
//                   <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
//                   <td className="p-3.5">
//                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
//                       {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
//                     </span>
//                   </td>
//                   <td className="p-3.5 text-center">
//                     <div className="inline-flex flex-wrap items-center justify-center gap-1.5">

//                       <button
//                         onClick={() => handleEditClick(u)}
//                         className="whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-500/20 transition-all"
//                       >
//                         এডিট
//                       </button>

//                       <button
//                         onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })}
//                         className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
//                           u.isBlocked
//                             ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
//                             : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'
//                         }`}
//                       >
//                         {u.isBlocked ? 'আনব্লক' : 'ব্লক'}
//                       </button>

//                       <button
//                         onClick={() => handleDeleteUser(u.uid)}
//                         className="whitespace-nowrap bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
//                       >
//                         ডিলিট
//                       </button>

//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* এডিট মডাল */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
//             <h3 className="text-base font-extrabold text-white">ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span></h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">ব্যালেন্স:</label>
//                 <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">টার্নওভার:</label>
//                 <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 block mb-1">আইপি:</label>
//                 <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
//               </div>
//             </div>
//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })}
//                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs"
//               >
//                 আপডেট
//               </button>
//               <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs">বাতিল</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔔 কাস্টম কনফার্ম মডাল */}
//       {confirmData && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
//           <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl shadow-emerald-950/40">

//             <div className="flex flex-col items-center text-center space-y-3">
//               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}>
//                 {confirmData.icon}
//               </div>
//               <h3 className="text-base font-extrabold text-white">{confirmData.title}</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">{confirmData.message}</p>
//             </div>

//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={() => setConfirmData(null)}
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
//               >
//                 না
//               </button>
//               <button
//                 onClick={() => {
//                   confirmData.onYes?.();
//                   setConfirmData(null);
//                 }}
//                 className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
//                   confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald
//                 }`}
//               >
//                 {confirmData.confirmText || 'হ্যাঁ, নিশ্চিত'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }


// ..............................................................................

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiveBetTrackingCard from '@/components/LiveBetTrackingCard';

export default function AdminHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalUserBalance: 0,
    totalReferralBonus: 0,
    adminNetProfit: 0
  });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [newTurnover, setNewTurnover] = useState('');
  const [newIp, setNewIp] = useState('');

  // 🔔 কাস্টম কনফার্ম মডাল
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

  const fetchData = async (search = '') => {
    try {
      setLoading(true);
      const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await fetch(`/api/admin/users?search=${search}&t=${Date.now()}`);
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => { fetchData(searchQuery); }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const askConfirm = ({ title, message, icon = '⚠️', iconColor = 'amber', confirmText = 'হ্যাঁ, নিশ্চিত', confirmClass = 'emerald', onYes }) => {
    setConfirmData({ title, message, icon, iconColor, confirmText, confirmClass, onYes });
  };

  // ✅ আসল আপডেট কাজ (alert বাদ — টোস্ট ব্যবহার)
  const performUpdateUser = async (userId, updateData) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updateData })
      });
      const data = await res.json();
      showToast(data.message || 'সফলভাবে আপডেট হয়েছে', 'success');
      setEditingUser(null);
      fetchData(searchQuery);
    } catch (err) {
      showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // ✅ আসল ডিলিট কাজ (alert বাদ — টোস্ট ব্যবহার)
  const performDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      showToast(`ইউজার ${userId} ডিলিট হয়েছে`, 'success');
      fetchData(searchQuery);
    } catch (err) {
      showToast('ডিলিট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // 🎯 এডিট সেভ / ব্লক / আনব্লক — কনফার্ম সহ
  const handleUpdateUser = (userId, updateData) => {
    let title = 'তথ্য আপডেট নিশ্চিত করুন';
    let message = 'আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?';
    let icon = '✏️';
    let iconColor = 'blue';
    let confirmText = 'হ্যাঁ, আপডেট';
    let confirmClass = 'blue';

    if (updateData.isBlocked === true) {
      title = 'ইউজার ব্লক নিশ্চিত করুন';
      message = 'আপনি কি এই ইউজারকে ব্লক করতে চান?';
      icon = '🚫';
      iconColor = 'rose';
      confirmText = 'হ্যাঁ, ব্লক';
      confirmClass = 'rose';
    }
    if (updateData.isBlocked === false) {
      title = 'ইউজার আনব্লক নিশ্চিত করুন';
      message = 'আপনি কি এই ইউজারকে আনব্লক করতে চান?';
      icon = '✅';
      iconColor = 'emerald';
      confirmText = 'হ্যাঁ, আনব্লক';
      confirmClass = 'emerald';
    }

    askConfirm({
      title, message, icon, iconColor, confirmText, confirmClass,
      onYes: () => performUpdateUser(userId, updateData)
    });
  };

  // 🎯 ডিলিট — কনফার্ম সহ
  const handleDeleteUser = (userId) => {
    askConfirm({
      title: 'ইউজার ডিলিট নিশ্চিত করুন',
      message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
      icon: '🗑️',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, ডিলিট',
      confirmClass: 'rose',
      onYes: () => performDeleteUser(userId)
    });
  };

  // 🎯 এডিট বাটনে ক্লিক — কনফার্ম সহ
  const handleEditClick = (u) => {
    askConfirm({
      title: 'ইউজার এডিট নিশ্চিত করুন',
      message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
      icon: '✏️',
      iconColor: 'blue',
      confirmText: 'হ্যাঁ, এডিট',
      confirmClass: 'blue',
      onYes: () => {
        setEditingUser(u.uid);
        setNewBalance(u.balance);
        setNewTurnover(u.turnover || 0);
        setNewIp(u.ipAddress || '');
      }
    });
  };

  // 🔓 লগআউট হ্যান্ডলার
  const handleLogout = () => {
    askConfirm({
      title: 'লগআউট নিশ্চিত করুন',
      message: 'আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?',
      icon: '🔓',
      iconColor: 'rose',
      confirmText: 'হ্যাঁ, লগআউট',
      confirmClass: 'rose',
      onYes: async () => {
        try {
          const res = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            showToast('সফলভাবে লগআউট হয়েছে', 'success');
            setTimeout(() => {
              router.push('/admin/login'); // প্রয়োজনে পাথ পরিবর্তন করুন
            }, 800);
          } else {
            showToast('লগআউট করতে সমস্যা হয়েছে', 'error');
          }
        } catch (err) {
          console.error('Logout error:', err);
          showToast('নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        }
      }
    });
  };

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

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

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">

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

      {/* CSS অ্যানিমেশন — উপর থেকে নিচে */}
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

      {/* হেডার */}
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            অ্যাডমিন কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ</p>
        </div>

        {/* ডানদিকের বাটন গ্রুপ */}
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => fetchData(searchQuery)}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all active:scale-95"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">🔄</span>
            ডেটা সিঙ্ক করুন
          </button>

          {/* 🆕 লগআউট বাটন */}
          <button
            onClick={handleLogout}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 shadow-lg shadow-rose-950/30 transition-all duration-300 active:scale-95"
            title="লগআউট"
          >
            <span className="text-sm group-hover:-translate-x-0.5 transition-transform">🔓</span>
            লগআউট
          </button>
        </div>
      </div>

      {/* ================= ৬টি কার্ড ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20">👥</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-white">{fmt(stats.totalUsers)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ডিপোজিট</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20">📥</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-emerald-400">৳{fmt(stats.totalDeposit)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট উইথড্র</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">📤</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-rose-400">৳{fmt(stats.totalWithdraw)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট ইউজার বেলেন্স</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20">💰</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400">৳{fmt(stats.totalUserBalance)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট রেফারেল বোনাস</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20">🤝</div>
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-purple-400">৳{fmt(stats.totalReferralBonus)}</h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-emerald-500/40 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase">অ্যাডমিনের নিট লাভ</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30">📊</div>
          </div>
          <h2 className={`mt-3 text-2xl md:text-3xl font-black ${stats.adminNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ৳{fmt(stats.adminNetProfit)}
          </h2>
        </div>

      </div>

      <LiveBetTrackingCard />

      {/* নেভিগেশন */}
      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
          👤 ইউজার 
        </button>
        <button onClick={() => router.push('/admin/deposits')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📥 ডিপোজিট</button>
        <button onClick={() => router.push('/admin/withdraws')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">📤 উইথড্র</button>
        <button onClick={() => router.push('/admin/referrals')} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2">🤝 রেফারেল</button>
        <button onClick={() => router.push('/admin/payments')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">💳 পেমেন্ট</button>
        <button onClick={() => router.push('/admin/payment-methods')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2">🌐 মেথডস</button>
      </div>

      {/* ইউজার লিস্ট */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 className="text-sm font-bold text-slate-200">ইউজার লিস্ট ও সার্চ</h2>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="ফোন, আইডি বা আইপি..."
              value={searchQuery}
              onChange={(e) => { if (e.target.value.length <= 11) setSearchQuery(e.target.value); }}
              maxLength={11}
              className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs">সার্চ</button>
          </form>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full min-w-[900px] text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">UID</th>
                <th className="p-3.5">ফোন</th>
                <th className="p-3.5">ব্যালেন্স</th>
                <th className="p-3.5">টার্নওভার</th>
                <th className="p-3.5">আইপি</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/60">
                  <td className="p-3.5 font-semibold text-white font-mono">{u.uid}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
                  <td className="p-3.5 font-extrabold text-amber-400 font-mono">৳{u.balance}</td>
                  <td className="p-3.5 text-slate-300 font-mono">৳{u.turnover || 0}</td>
                  <td className="p-3.5 text-[11px] font-mono text-slate-400">{u.ipAddress || 'নেই'}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {u.isBlocked ? 'ব্লকড' : 'অ্যাক্টিভ'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5">

                      <button
                        onClick={() => handleEditClick(u)}
                        className="whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-500/20 transition-all"
                      >
                        এডিট
                      </button>

                      <button
                        onClick={() => handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          u.isBlocked
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
                            : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20'
                        }`}
                      >
                        {u.isBlocked ? 'আনব্লক' : 'ব্লক'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="whitespace-nowrap bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      >
                        ডিলিট
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* এডিট মডাল */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">ইউজার এডিট: <span className="text-emerald-400 font-mono text-xs">{editingUser}</span></h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ব্যালেন্স:</label>
                <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">টার্নওভার:</label>
                <input type="number" value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">আইপি:</label>
                <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleUpdateUser(editingUser, { balance: Number(newBalance), turnover: Number(newTurnover), ipAddress: newIp })}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs"
              >
                আপডেট
              </button>
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 কাস্টম কনফার্ম মডাল */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
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
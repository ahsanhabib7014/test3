// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import BackButton from '@/components/BackButton';

// export default function GamePage() {
//   const [periodNumber, setPeriodNumber] = useState('Loading...');
//   const [timeLeft, setTimeLeft] = useState(30);
//   const [choice, setChoice] = useState(null); 
//   const [amount, setAmount] = useState('');
//   const [isLocked, setIsLocked] = useState(false); 
//   const [globalResults, setGlobalResults] = useState([]); 
//   const [toastMessage, setToastMessage] = useState(null);
//   const [userPhone, setUserPhone] = useState(''); 
//   const [userBalance, setUserBalance] = useState('0.00');
//   const [isAuthorized, setIsAuthorized] = useState(false); 

//   const activeBetPeriodRef = useRef(null);

//   const showToast = (text, type = 'info') => {
//     setToastMessage({ text, type });
//     setTimeout(() => {
//       setToastMessage(null);
//     }, 4000);
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     const identifier = savedUser.uid || savedUser.phone;

//     if (!identifier) {
//       showToast('লগইন করা নেই বা ইউজার পাওয়া যায়নি।', 'loss');
//       setTimeout(() => {
//         window.location.replace('/login'); 
//       }, 1500);
//       return;
//     }

//     setUserPhone(identifier);
//     if (savedUser.balance !== undefined) {
//       setUserBalance(savedUser.balance);
//     }
//     setIsAuthorized(true);
//   }, []);

//   const fetchGameStatus = async () => {
//     try {
//       const res = await fetch('/api/game/period', {
//         credentials: 'include'
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         if (data.userBetResult) {
//           if (
//             activeBetPeriodRef.current && 
//             data.userBetResult.periodNumber === activeBetPeriodRef.current
//           ) {
//             if (data.userBetResult.result === 'win' || data.userBetResult.result === 'WIN') {
//               showToast(`অভিনন্দন! আপনি জিতে গেছেন! 🎉`, 'win');
//             } else if (data.userBetResult.result === 'loss' || data.userBetResult.result === 'LOSS') {
//               showToast(`দুঃখিত! আপনি হেরে গেছেন। ❌`, 'loss');
//             }
//             activeBetPeriodRef.current = null;
//           }
//         }

//         if (periodNumber !== 'Loading...' && periodNumber !== data.periodNumber) {
//           setIsLocked(false);
//           setChoice(null);
//           setAmount('');
//           activeBetPeriodRef.current = null;
//         }

//         if (data.hasUserBetForThisPeriod || data.hasUserBet) {
//           setIsLocked(true);
//         }

//         setPeriodNumber(data.periodNumber);
//         setTimeLeft(data.timeLeft);
//         if (data.recentResults) {
//           setGlobalResults(data.recentResults);
//         }

//         // ✅ Balance ও Turnover — দুইটাই localStorage-এ sync করা
//         if (data.balance !== undefined) {
//           setUserBalance(data.balance);
//           const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//           savedUser.balance = data.balance;
//           if (data.turnover !== undefined) {
//             savedUser.turnover = data.turnover;
//           }
//           localStorage.setItem('user', JSON.stringify(savedUser));
//         }
//       }
//     } catch (err) {
//       console.error('Sync error:', err);
//     }
//   };

//   useEffect(() => {
//     if (!isAuthorized) return; 

//     fetchGameStatus();
//     const timerInterval = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           fetchGameStatus();
//           return 30;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timerInterval);
//   }, [periodNumber, isAuthorized]);

//   const handlePlaceBet = async (e) => {
//     e.preventDefault();

//     const sanitizedAmount = Number(amount);
//     if (isNaN(sanitizedAmount) || sanitizedAmount <= 0) {
//       showToast('অনুগ্রহ করে সঠিক পজিটিভ অ্যামাউন্ট ইনপুট দিন!', 'loss');
//       return;
//     }

//     if (!choice) {
//       showToast('দয়া করে প্রথমে Big অথবা Small সিলেক্ট করুন!', 'loss');
//       return;
//     }

//     if (timeLeft <= 5) {
//       showToast('বেড নেওয়ার সময় শেষ! শেষ ৫ সেকেন্ডে বেড প্লেস করা যাবে না।', 'loss');
//       return;
//     }

//     if (isLocked) {
//       showToast('এই রাউন্ডে ইতিমধ্যে আপনার বেট গ্রহণ করা হয়েছে!', 'loss');
//       return;
//     }

//     try {
//       const res = await fetch('/api/game/bet', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include', 
//         body: JSON.stringify({ choice, amount: sanitizedAmount, periodNumber })
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setIsLocked(true); 
//         activeBetPeriodRef.current = periodNumber;
//         showToast(data.message, 'win');
        
//         // ✅ Balance ও Turnover — দুইটাই localStorage-এ sync করা
//         if (data.newBalance !== undefined) {
//           setUserBalance(data.newBalance);
//           const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//           savedUser.balance = data.newBalance;
//           if (data.newTurnover !== undefined) {
//             savedUser.turnover = data.newTurnover;
//           }
//           localStorage.setItem('user', JSON.stringify(savedUser));
//         }
//       } else {
//         showToast(data.message, 'loss');
//         if (data.message && data.message.includes('ইতিমধ্যে বেট করা হয়েছে')) {
//           setIsLocked(true);
//         }
//       }
//     } catch (err) {
//       console.error('Bet error:', err);
//       showToast('সার্ভার এরর হয়েছে!', 'loss');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { 
//         method: 'POST',
//         credentials: 'include' 
//       });
//     } catch (err) {
//       console.error('Logout error:', err);
//     } finally {
//       localStorage.clear();
//       sessionStorage.clear();
//       window.location.replace('/login'); 
//     }
//   };

//   if (!isAuthorized) {
//     return (
//       <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
//         <div className="text-center space-y-2">
//           <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
//           <p className="text-xs font-semibold text-slate-400">যাচাই করা হচ্ছে...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 p-2.5 max-w-md mx-auto space-y-2.5 relative font-sans selection:bg-emerald-500 selection:text-white pb-6">
      
//       {toastMessage && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3">
//           <div className={`p-4 rounded-2xl shadow-xl text-xs font-bold border text-center max-w-xs w-full ${
//             toastMessage.type === 'win' 
//               ? 'bg-emerald-600 border-emerald-400 text-white' 
//               : 'bg-rose-600 border-rose-400 text-white'
//           }`}>
//             {toastMessage.text}
//           </div>
//         </div>
//       )}

//       <div className="px-0.5">
//         <BackButton title="ফিরে যান" />
//       </div>

//       <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        
//         <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
//           <div>
//             <h1 className="text-sm font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GameApp</h1>
//             <p className="text-[10px] text-slate-400 font-mono">{userPhone || 'N/A'}</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-[9px] uppercase text-slate-400 font-semibold">ব্যালেন্স</p>
//               <p className="text-xs font-black text-emerald-400 font-mono">৳ {userBalance}</p>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-bold border border-rose-500/20 transition"
//             >
//               লগআউট
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
//           <div>
//             <p className="text-[10px] text-slate-400">পিরিয়ড নাম্বার</p>
//             <h3 className="text-xs font-bold text-emerald-400 font-mono">{periodNumber}</h3>
//           </div>
//           <div className="text-right">
//             <p className="text-[10px] text-slate-400">সময় বাকি</p>
//             <h3 className={`text-sm font-black font-mono ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
//               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
//             </h3>
//           </div>
//         </div>

//         <form onSubmit={handlePlaceBet} className="space-y-2.5">
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               type="button"
//               disabled={isLocked}
//               onClick={() => setChoice('Big')}
//               className={`py-2.5 rounded-xl font-bold text-xs transition ${
//                 choice === 'Big' 
//                   ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 shadow-md shadow-emerald-900/30' 
//                   : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
//               } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               BIG 🟢
//             </button>
//             <button
//               type="button"
//               disabled={isLocked}
//               onClick={() => setChoice('Small')}
//               className={`py-2.5 rounded-xl font-bold text-xs transition ${
//                 choice === 'Small' 
//                   ? 'bg-rose-600 text-white ring-2 ring-rose-400/50 shadow-md shadow-rose-900/30' 
//                   : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
//               } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               SMALL 🔴
//             </button>
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] text-slate-400 font-semibold block">অ্যামাউন্ট (টাকা)</label>
//             <input
//               type="number"
//               min="1"
//               step="any"
//               disabled={isLocked}
//               value={amount}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 if (val === '' || Number(val) >= 0) {
//                   setAmount(val);
//                 }
//               }}
//               placeholder="পরিমাণ লিখুন..."
//               className={`w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
//               required
//             />
            
//             <div className="grid grid-cols-4 gap-1.5 pt-0.5">
//               {[10, 50, 100, 500].map((val) => (
//                 <button
//                   key={val}
//                   type="button"
//                   disabled={isLocked}
//                   onClick={() => setAmount(prev => (Number(prev || 0) + val).toString())}
//                   className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-1 rounded-lg text-[11px] font-bold transition"
//                 >
//                   +{val}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={timeLeft <= 5 || isLocked}
//             className={`w-full py-3 rounded-xl font-extrabold text-xs transition shadow-md ${
//               timeLeft <= 5 || isLocked 
//                 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
//                 : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-98'
//             }`}
//           >
//             {isLocked ? 'লকড (বেট গৃহীত)' : timeLeft <= 5 ? 'সময় শেষ' : 'বেড কনফার্ম করুন'}
//           </button>
//         </form>

//         <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
//           <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">সাম্প্রতিক ফলাফল ইতিহাস</h4>
          
//           <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
//             <div className="max-h-44 overflow-y-auto custom-scrollbar">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] text-slate-400">
//                     <th className="py-2 px-3 font-semibold">পিরিয়ড নাম্বার</th>
//                     <th className="py-2 px-3 font-semibold text-right">ফলাফল</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-900 text-xs">
//                   {globalResults.length === 0 ? (
//                     <tr>
//                       <td colSpan="2" className="text-center py-3 text-slate-500 text-[11px]">
//                         কোনো ফলাফল নেই এখনো।
//                       </td>
//                     </tr>
//                   ) : (
//                     globalResults.map((item, index) => (
//                       <tr key={index} className="hover:bg-slate-900/40 transition">
//                         <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">{item.periodNumber}</td>
//                         <td className="py-2 px-3 text-right">
//                           <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${
//                             item.result === 'Big' || item.result === 'BIG' 
//                               ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
//                               : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
//                           }`}>
//                             {item.result}
//                           </span>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();
  const [periodNumber, setPeriodNumber] = useState('Loading...');
  const [timeLeft, setTimeLeft] = useState(30);
  const [choice, setChoice] = useState(null); 
  const [amount, setAmount] = useState('');
  const [isLocked, setIsLocked] = useState(false); 
  const [globalResults, setGlobalResults] = useState([]); 
  const [toastMessage, setToastMessage] = useState(null);
  const [userPhone, setUserPhone] = useState(''); 
  const [userBalance, setUserBalance] = useState('0.00');
  const [isAuthorized, setIsAuthorized] = useState(false); 

  const activeBetPeriodRef = useRef(null);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const identifier = savedUser.uid || savedUser.phone;

    if (!identifier) {
      showToast('লগইন করা নেই বা ইউজার পাওয়া যায়নি।', 'loss');
      setTimeout(() => {
        window.location.replace('/login'); 
      }, 1500);
      return;
    }

    setUserPhone(identifier);
    if (savedUser.balance !== undefined) {
      setUserBalance(savedUser.balance);
    }
    setIsAuthorized(true);
  }, []);

  const fetchGameStatus = async () => {
    try {
      const res = await fetch('/api/game/period', {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.userBetResult) {
          if (
            activeBetPeriodRef.current && 
            data.userBetResult.periodNumber === activeBetPeriodRef.current
          ) {
            if (data.userBetResult.result === 'win' || data.userBetResult.result === 'WIN') {
              showToast(`অভিনন্দন! আপনি জিতে গেছেন! 🎉`, 'win');
            } else if (data.userBetResult.result === 'loss' || data.userBetResult.result === 'LOSS') {
              showToast(`দুঃখিত! আপনি হেরে গেছেন। ❌`, 'loss');
            }
            activeBetPeriodRef.current = null;
          }
        }

        if (periodNumber !== 'Loading...' && periodNumber !== data.periodNumber) {
          setIsLocked(false);
          setChoice(null);
          setAmount('');
          activeBetPeriodRef.current = null;
        }

        if (data.hasUserBetForThisPeriod || data.hasUserBet) {
          setIsLocked(true);
        }

        setPeriodNumber(data.periodNumber);
        setTimeLeft(data.timeLeft);
        if (data.recentResults) {
          setGlobalResults(data.recentResults);
        }

        if (data.balance !== undefined) {
          setUserBalance(data.balance);
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          savedUser.balance = data.balance;
          if (data.turnover !== undefined) {
            savedUser.turnover = data.turnover;
          }
          localStorage.setItem('user', JSON.stringify(savedUser));
        }
      }
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return; 

    fetchGameStatus();
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchGameStatus();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [periodNumber, isAuthorized]);

  const handlePlaceBet = async (e) => {
    e.preventDefault();

    const sanitizedAmount = Number(amount);
    if (isNaN(sanitizedAmount) || sanitizedAmount <= 0) {
      showToast('অনুগ্রহ করে সঠিক পজিটিভ অ্যামাউন্ট ইনপুট দিন!', 'loss');
      return;
    }

    if (!choice) {
      showToast('দয়া করে প্রথমে Big অথবা Small সিলেক্ট করুন!', 'loss');
      return;
    }

    if (timeLeft <= 5) {
      showToast('বেড নেওয়ার সময় শেষ! শেষ ৫ সেকেন্ডে বেড প্লেস করা যাবে না।', 'loss');
      return;
    }

    if (isLocked) {
      showToast('এই রাউন্ডে ইতিমধ্যে আপনার বেট গ্রহণ করা হয়েছে!', 'loss');
      return;
    }

    try {
      const res = await fetch('/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ choice, amount: sanitizedAmount, periodNumber })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsLocked(true); 
        activeBetPeriodRef.current = periodNumber;
        showToast(data.message, 'win');
        
        if (data.newBalance !== undefined) {
          setUserBalance(data.newBalance);
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          savedUser.balance = data.newBalance;
          if (data.newTurnover !== undefined) {
            savedUser.turnover = data.newTurnover;
          }
          localStorage.setItem('user', JSON.stringify(savedUser));
        }
      } else {
        showToast(data.message, 'loss');
        if (data.message && data.message.includes('ইতিমধ্যে বেট করা হয়েছে')) {
          setIsLocked(true);
        }
      }
    } catch (err) {
      console.error('Bet error:', err);
      showToast('সার্ভার এরর হয়েছে!', 'loss');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* টোস্ট নোটিফিকেশন */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className={`px-6 py-5 rounded-2xl shadow-2xl text-sm font-bold border text-center max-w-xs w-full flex flex-col items-center gap-3 ${
            toastMessage.type === 'win' 
              ? 'bg-slate-900 border-emerald-500 text-emerald-400' 
              : 'bg-slate-900 border-rose-500 text-rose-400'
          }`}>
            <i className={`fa-solid ${toastMessage.type === 'win' ? 'fa-circle-check text-3xl' : 'fa-circle-exclamation text-3xl'}`}></i>
            <span className="leading-relaxed">{toastMessage.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-5xl space-y-3 md:space-y-4">
        
        {/* হেডার সেকশন (লগআউট বাটন ছাড়া) */}
        <div className="bg-slate-900 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 md:gap-3 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer flex-shrink-0"
            >
              <i className="fa-solid fa-arrow-left text-xs md:text-sm"></i>
            </button>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0 hidden md:flex">
              <i className="fa-solid fa-gamepad text-sm md:text-base"></i>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-emerald-400 truncate">GameApp</h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-mono truncate">{userPhone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[9px] md:text-[10px] uppercase text-slate-400 font-semibold">ব্যালেন্স</p>
              <p className="text-xs md:text-sm font-black text-amber-400 font-mono">৳ {userBalance}</p>
            </div>
          </div>
        </div>

        {/* মেইন গ্রিড: মোবাইলে ১ কলাম, ডেস্কটপে ২ কলাম */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          
          {/* বাম কলাম: পিরিয়ড + বেটিং ফর্ম */}
          <div className="space-y-3 md:space-y-4">
            
            {/* পিরিয়ড ও টাইমার কার্ড */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg text-center">
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold">পিরিয়ড</p>
                <p className="text-xs md:text-sm font-bold text-emerald-400 font-mono mt-1 truncate">{periodNumber}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg text-center">
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold">সময় বাকি</p>
                <p className={`text-sm md:text-base font-black font-mono mt-1 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </p>
              </div>
            </div>

            {/* বেটিং ফর্ম কার্ড */}
            <div className="bg-slate-900 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg">
              <form onSubmit={handlePlaceBet} className="space-y-3 md:space-y-4">
                
                {/* BIG / SMALL বাটন */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setChoice('Big')}
                    className={`py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition cursor-pointer ${
                      choice === 'Big' 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-900/40' 
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    BIG 🟢
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setChoice('Small')}
                    className={`py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition cursor-pointer ${
                      choice === 'Small' 
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white ring-2 ring-rose-400/50 shadow-lg shadow-rose-900/40' 
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    SMALL 🔴
                  </button>
                </div>

                {/* অ্যামাউন্ট ইনপুট */}
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs text-slate-400 font-semibold block">অ্যামাউন্ট (টাকা)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    disabled={isLocked}
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) setAmount(val);
                    }}
                    placeholder="পরিমাণ লিখুন..."
                    className={`w-full bg-slate-950 border border-slate-800 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    required
                  />
                  
                  <div className="grid grid-cols-4 gap-1.5 md:gap-2 pt-1">
                    {[10, 50, 100, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        disabled={isLocked}
                        onClick={() => setAmount(prev => (Number(prev || 0) + val).toString())}
                        className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 rounded-lg text-[11px] md:text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* সাবমিট বাটন */}
                <button
                  type="submit"
                  disabled={timeLeft <= 5 || isLocked}
                  className={`w-full py-3.5 md:py-4 rounded-xl font-extrabold text-xs md:text-sm transition shadow-md cursor-pointer flex justify-center items-center gap-2 active:scale-95 ${
                    timeLeft <= 5 || isLocked 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <i className="fa-solid fa-lock"></i> লকড (বেট গৃহীত)
                    </>
                  ) : timeLeft <= 5 ? (
                    <>
                      <i className="fa-solid fa-clock"></i> সময় শেষ
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt"></i> বেড কনফার্ম করুন
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* ডান কলাম: রেজাল্ট হিস্ট্রি */}
          <div className="bg-slate-900 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h4 className="text-xs md:text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <i className="fa-solid fa-clock-rotate-left text-emerald-400"></i>
                সাম্প্রতিক ফলাফল
              </h4>
              <span className="text-[10px] md:text-xs text-slate-500 font-mono">{globalResults.length} টি</span>
            </div>
            
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
              <div className="max-h-[300px] md:max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-[10px] md:text-xs text-slate-400">
                      <th className="py-2.5 md:py-3 px-3 md:px-4 font-semibold">পিরিয়ড নাম্বার</th>
                      <th className="py-2.5 md:py-3 px-3 md:px-4 font-semibold text-right">ফলাফল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-xs md:text-sm">
                    {globalResults.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-8 text-slate-500 text-[11px] md:text-xs">
                          <i className="fa-solid fa-inbox text-2xl mb-2 block opacity-50"></i>
                          কোনো ফলাফল নেই এখনো।
                        </td>
                      </tr>
                    ) : (
                      globalResults.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-900/40 transition">
                          <td className="py-2.5 md:py-3 px-3 md:px-4 font-mono text-slate-300 text-[11px] md:text-xs">{item.periodNumber}</td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 text-right">
                            <span className={`inline-block px-2.5 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold ${
                              item.result === 'Big' || item.result === 'BIG' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {item.result === 'Big' || item.result === 'BIG' ? '🟢 ' : '🔴 '}
                              {item.result}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
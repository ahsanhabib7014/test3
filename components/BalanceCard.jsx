'use client';
import { useBalance } from '@/hooks/useBalance';

export default function BalanceCard({ userId, initialBalance }) {
  const { balance, lastUpdate, connected } = useBalance(userId, initialBalance);

  return (
    <div className="balance-card">
      <div className="flex items-center gap-2">
        <h2>ব্যালেন্স: ৳{balance}</h2>
        <span className={connected ? 'text-green-500' : 'text-red-500'}>
          {connected ? '🟢 Live' : '🔴 Offline'}
        </span>
      </div>

      {lastUpdate && (
        <p className="text-sm text-gray-500">
          {lastUpdate.type === 'referral_withdraw' && `৳${lastUpdate.amount} উইথড্র হয়েছে`}
          {lastUpdate.type === 'referral_bonus' && `৳${lastUpdate.amount} বোনাস পেয়েছেন 🎉`}
        </p>
      )}
    </div>
  );
}
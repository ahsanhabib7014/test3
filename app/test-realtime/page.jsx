'use client';
import { useBalance } from '@/hooks/useBalance';

export default function TestRealtime() {
  const { balance, connected, lastUpdate } = useBalance('test-user-123', 5000);

  const sendEvent = async () => {
    console.log('🔥 Button clicked! Sending event...');
    const res = await fetch('/api/test-pusher-balance');
    const data = await res.json();
    console.log('📤 Response:', data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Realtime Test</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p style={{ fontSize: 24, fontWeight: 'bold' }}>
        Balance: ৳{balance}
      </p>

      <button
        onClick={sendEvent}
        style={{
          padding: '12px 24px',
          marginTop: 10,
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        🚀 Send Test Event
      </button>

      {lastUpdate && (
        <p style={{ marginTop: 15, color: 'green', fontSize: 14 }}>
          ✅ Last update: {lastUpdate.type} — ৳{lastUpdate.amount}
        </p>
      )}
    </div>
  );
}
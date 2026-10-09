'use client';
import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusherClient';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe('admin-channel');

    channel.bind('new-withdraw', (data) => {
      setNotifications((prev) => [{
        id: data.withdrawId,
        message: `নতুন withdraw: ৳${data.amount} (${data.method})`,
        timestamp: Date.now(),
      }, ...prev].slice(0, 20));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('admin-channel');
    };
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-lg font-bold mb-2">🔔 Live Notifications</h3>
      {notifications.length === 0 && (
        <p className="text-gray-500 text-sm">এখনো কোনো notification নেই</p>
      )}
      {notifications.map((n) => (
        <div key={n.id} className="border-b py-2 text-sm">
          {n.message}
        </div>
      ))}
    </div>
  );
}
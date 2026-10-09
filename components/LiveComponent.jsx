'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function LiveComponent({ initialViews, docId }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    // Pusher Client Setup
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('live-channel');
    channel.bind('view-update', (data) => {
      if (data.docId === docId) {
        setViews(data.views);
      }
    });

    return () => {
      pusher.unsubscribe('live-channel');
    };
  }, [docId]);

  const handleIncrement = async () => {
    await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Live Views: {views}</h2>
      <button 
        onClick={handleIncrement}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Click to Increment
      </button>
    </div>
  );
}
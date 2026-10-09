'use client';
import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '@/lib/pusherClient';

export function useBalance(userId, initialBalance) {
  const [balance, setBalance] = useState(initialBalance);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    console.log('🔵 STEP 1: Subscribing to user-' + userId);
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    const onConnected = () => {
      console.log('🟢 STEP 2: Pusher connected');
      setConnected(true);
    };

    const onSubscribed = () => {
      console.log('🟡 STEP 3: Subscribed to ' + channelName);
    };

    const handleBalanceUpdate = (data) => {
      console.log('🎉 STEP 4: Balance update received!', data);
      setBalance(data.newBalance);
      setLastUpdate({
        type: data.type,
        amount: data.amount,
        timestamp: data.timestamp,
      });
    };

    pusher.connection.bind('connected', onConnected);
    channel.bind('pusher:subscription_succeeded', onSubscribed);
    channel.bind('balance-update', handleBalanceUpdate);
    channel.bind('referral-bonus', handleBalanceUpdate);
    channel.bind('withdraw-approved', handleBalanceUpdate);
    channel.bind('withdraw-rejected', handleBalanceUpdate);

    return () => {
      console.log('🔴 Cleanup: unsubscribing from ' + channelName);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.connection.unbind('connected', onConnected);
    };
  }, [userId]);

  return { balance, lastUpdate, connected };
}
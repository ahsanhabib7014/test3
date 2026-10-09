import { NextResponse } from 'next/server';
import { emitToUser } from '@/lib/pusher';

export async function GET() {
  await emitToUser('test-user-123', 'balance-update', {
    newBalance: Math.floor(Math.random() * 10000),
    type: 'referral_bonus',
    amount: 500,
    timestamp: Date.now(),
  });

  return NextResponse.json({ success: true });
}
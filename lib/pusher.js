import Pusher from 'pusher';

if (!process.env.PUSHER_APP_ID) {
  throw new Error('❌ Pusher env variables missing!');
}

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * User-এর room-এ event পাঠাও
 */
export async function emitToUser(userId, event, data) {
  try {
    await pusher.trigger(`user-${userId}`, event, data);
  } catch (err) {
    console.error('Pusher emit error:', err);
  }
}

/**
 * Admin-দের notify করো
 */
export async function emitToAdmin(event, data) {
  try {
    await pusher.trigger('admin-channel', event, data);
  } catch (err) {
    console.error('Pusher admin emit error:', err);
  }
}
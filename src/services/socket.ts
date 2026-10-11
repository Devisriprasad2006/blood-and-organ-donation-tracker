import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || (
  typeof window !== 'undefined' && window.location.port !== '5173'
    ? window.location.origin
    : 'http://localhost:5000'
);

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const token = localStorage.getItem('lifelink_token');
    socketInstance = io(SOCKET_SERVER_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected to live healthcare event stream:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO Frontend] Disconnected from stream:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO Frontend] Connection error:', err.message);
    });
  }

  return socketInstance;
}

export function updateSocketAuthToken(token: string | null) {
  if (socketInstance) {
    socketInstance.auth = { token };
    socketInstance.disconnect().connect();
  }
}

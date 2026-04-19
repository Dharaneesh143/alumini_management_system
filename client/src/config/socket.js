import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://aluminimanagementsystem.onrender.com'; // Adjust to your production URL

export const initSocket = (userId) => {
  if (!userId) return null;
  
  return io(SOCKET_URL, {
    query: { userId },
    transports: ['websocket', 'polling']
  });
};

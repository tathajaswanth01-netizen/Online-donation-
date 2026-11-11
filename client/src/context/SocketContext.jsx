import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && user) {
      // Connect to backend socket
      socketInstance = io(window.location.origin, {
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        socketInstance.emit('join_user_room', user._id || user.id);
      });

      socketInstance.on('new_notification', (data) => {
        toast((t) => (
          <div className="flex items-start space-x-2">
            <span className="font-semibold text-forest-700">{data.title}:</span>
            <span className="text-sm text-charcoal-700">{data.message}</span>
          </div>
        ), {
          duration: 4000,
          position: 'top-right'
        });
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

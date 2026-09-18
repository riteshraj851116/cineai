import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => {
      setConnected(true);
      if (user?._id || user?.id) {
        s.emit('join_user_channel', user._id || user.id);
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (s.connected) onConnect();

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

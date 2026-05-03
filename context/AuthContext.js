import { clearAuth } from '@/auth/token';
import { router } from 'expo-router';
import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [plant, setPlant] = useState([]);

  const logout = async () => {
    await clearAuth();
    setUser(null);
    setSelectedDevice(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        selectedDevice,
        setSelectedDevice,
        plant,
        setPlant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
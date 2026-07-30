//===== (Imports) ======
import { clearAuth } from '@/auth/token';
import { router } from 'expo-router';
import { createContext, useState } from 'react';

//===== (AuthContext) ======
export const AuthContext = createContext();

//===== (AuthProvider) ======
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [plant, setPlant] = useState([]);

  //===== (logout) ======
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

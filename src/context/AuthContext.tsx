import { createContext, useState, useContext, type ReactNode } from 'react';
import { useGoogleLogin, googleLogout, type TokenResponse } from '@react-oauth/google';

type AuthContextType = {
  accessToken: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse: TokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      console.log("Login bem-sucedido!");
    },
    onError: () => {
      console.error("Login falhou.");
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const logout = () => {
    googleLogout();
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
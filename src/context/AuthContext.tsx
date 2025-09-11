import { createContext, useState, useContext, type ReactNode } from 'react';
import { useGoogleLogin, googleLogout, type TokenResponse } from '@react-oauth/google';
import { toast } from 'sonner';

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
      toast.success("Login bem-sucedido!", {
        description: "Agora você pode salvar seus crafts no Google Drive.",
      });
    },
    onError: () => {
      console.error("Login falhou.");
      toast.error("Falha no Login", {
        description: "Não foi possível autenticar com o Google. Tente novamente.",
      });
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const logout = () => {
    googleLogout();
    setAccessToken(null);
    toast.info("Você saiu da sua conta Google.");
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
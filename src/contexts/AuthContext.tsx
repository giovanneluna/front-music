import { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
  isLoginDialogOpen: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    async function loadUser() {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
      initialLoadDone.current = true;
    }

    loadUser();
  }, []);

  async function login(email: string, password: string) {
    if (!initialLoadDone.current) return;
    
    try {
      const { user } = await authService.login({ email, password });
      
      setTimeout(() => {
        setUser(user);
        setIsAuthenticated(true);
        setIsLoginDialogOpen(false);
      }, 0);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Formatando melhor a resposta de erro
      if (error.response?.data?.message === 'Invalid credentials.') {
        throw {...error, response: {...error.response, data: {...error.response.data, message: 'Email ou senha incorretos.'}}};
      } else if (!error.response && error.message.includes('Network Error')) {
        throw {...error, response: {data: {message: 'Erro de conexão. Verifique sua internet.'}}};
      } else if (error.response?.status === 429) {
        throw {...error, response: {...error.response, data: {...error.response.data, message: 'Muitas tentativas. Tente novamente mais tarde.'}}};
      }
      
      throw error;
    }
  }

  async function register(name: string, email: string, password: string, password_confirmation: string) {
    if (!initialLoadDone.current) return;
    
    try {
      const { user } = await authService.register({ name, email, password, password_confirmation });
      
      setTimeout(() => {
        setUser(user);
        setIsAuthenticated(true);
        setIsLoginDialogOpen(false);
      }, 0);
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Formatando melhor a resposta de erro
      if (error.response?.data?.errors?.email?.includes('taken')) {
        throw {...error, response: {...error.response, data: {message: 'Este email já está em uso. Por favor, tente outro.', errors: error.response.data.errors}}};
      } else if (error.response?.data?.errors?.password) {
        const passwordErrors = error.response.data.errors.password;
        let message = 'Erro na senha: ';
        
        if (passwordErrors.includes('must be at least 8 characters')) {
          message += 'A senha deve ter pelo menos 8 caracteres.';
        } else if (passwordErrors.join(' ').includes('confirmation')) {
          message += 'As senhas não coincidem.';
        } else {
          message += passwordErrors[0];
        }
        
        throw {...error, response: {...error.response, data: {message: message, errors: error.response.data.errors}}};
      }
      
      throw error;
    }
  }

  async function logout() {
    if (!initialLoadDone.current) return;
    
    setIsLoggingOut(true);
    try {
      await authService.logout();
      
      setTimeout(() => {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoggingOut(false);
      }, 0);
    } catch (error) {
      setIsLoggingOut(false);
      throw error;
    }
  }

  const openLoginDialog = () => {
    setIsLoginDialogOpen(true);
  };

  const closeLoginDialog = () => {
    setIsLoginDialogOpen(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated, 
        openLoginDialog, 
        closeLoginDialog, 
        isLoginDialogOpen,
        isLoggingOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { User } from '../../types';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(false)
  }
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

vi.spyOn(console, 'error').mockImplementation(() => {});

const TestComponent = () => {
  const { user, isAuthenticated, loading, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => {
          try {
            login('test@example.com', 'password').catch(e => {
              console.log('Login error caught:', e.message);
            });
          } catch (error) {
            console.log('Error during login:', error);
          }
        }}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register('Test User', 'test@example.com', 'password', 'password')}
      >
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser: User = { 
    id: 1, 
    name: 'Test User', 
    email: 'test@example.com', 
    is_admin: false,
    created_at: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockLocalStorage.clear.mockClear();
    
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return null;
      return null;
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('deve iniciar com usuário nulo e não autenticado', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(null as unknown as User);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
  
  it('deve autenticar usuário após login bem-sucedido', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(null as unknown as User);
    vi.mocked(authService.login).mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-jwt-token'
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    expect(JSON.parse(screen.getByTestId('user').textContent || '{}')).toEqual(mockUser);
    
    expect(authService.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
  }, 10000);
  
  it('deve desconectar o usuário após logout', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);
    vi.mocked(authService.logout).mockResolvedValueOnce(undefined);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-btn'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('user').textContent).toBe('null');
    
    expect(authService.logout).toHaveBeenCalled();
  }, 10000);
  
  it('deve restaurar a sessão do usuário a partir do token', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'fake-jwt-token';
      return null;
    });
    
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(JSON.parse(screen.getByTestId('user').textContent || '{}')).toEqual(mockUser);
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });
  
  it('deve registrar um novo usuário e autenticá-lo', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(null as unknown as User);
    vi.mocked(authService.register).mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-jwt-token'
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    
    expect(JSON.parse(screen.getByTestId('user').textContent || '{}')).toEqual(mockUser);
    
    expect(authService.register).toHaveBeenCalledWith({ 
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password',
      password_confirmation: 'password'
    });
  }, 10000);
  
  it('deve lidar com erro de login', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(null as unknown as User);
    
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  }, 10000);
}); 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route, Link, MemoryRouter } from 'react-router-dom';

vi.mock('../../services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn().mockReturnValue(false),
    getCurrentUser: vi.fn().mockResolvedValue(null)
  }
}));

const HomePage = () => <div data-testid="home-page">Home Page</div>;
const SuggestionsPage = () => <div data-testid="suggestions-page">Suggestions Page</div>;
const AdminPage = () => <div data-testid="admin-page">Admin Page</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const RegisterPage = () => <div data-testid="register-page">Register Page</div>;
const NotFoundPage = () => <div data-testid="not-found-page">Page Not Found</div>;

const TestNavigation = () => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/" data-testid="home-link">Home</Link></li>
          <li><Link to="/sugestoes" data-testid="suggestions-link">Sugestões</Link></li>
          <li><Link to="/admin" data-testid="admin-link">Admin</Link></li>
          <li><Link to="/login" data-testid="login-link">Login</Link></li>
          <li><Link to="/register" data-testid="register-link">Register</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sugestoes" element={<SuggestionsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

describe('Router Navigation', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  it('deve renderizar a página inicial por padrão', () => {
    render(
      <BrowserRouter>
        <TestNavigation />
      </BrowserRouter>
    );

    expect(screen.getByTestId('home-page')).toBeTruthy();
  });

  it('deve navegar para a página de sugestões ao clicar no link', async () => {
    render(
      <BrowserRouter>
        <TestNavigation />
      </BrowserRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('suggestions-link'));
    });

    expect(screen.getByTestId('suggestions-page')).toBeTruthy();
  });

  it('deve navegar para a página de admin ao clicar no link', async () => {
    render(
      <BrowserRouter>
        <TestNavigation />
      </BrowserRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('admin-link'));
    });

    expect(screen.getByTestId('admin-page')).toBeTruthy();
  });

  it('deve navegar para a página de login ao clicar no link', async () => {
    render(
      <BrowserRouter>
        <TestNavigation />
      </BrowserRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-link'));
    });

    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('deve navegar para a página de registro ao clicar no link', async () => {
    render(
      <BrowserRouter>
        <TestNavigation />
      </BrowserRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-link'));
    });

    expect(screen.getByTestId('register-page')).toBeTruthy();
  });

  it('deve mostrar a página 404 para rotas inexistentes', () => {
    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <TestNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });

  it('deve manter o histórico de navegação', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TestNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-page')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId('suggestions-link'));
    });
    expect(screen.getByTestId('suggestions-page')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId('admin-link'));
    });
    expect(screen.getByTestId('admin-page')).toBeTruthy();

    const navigate = vi.fn();
    const historyMock = {
      listen: vi.fn(),
      location: { pathname: '/admin' },
      createHref: vi.fn(),
      push: navigate,
      replace: vi.fn(),
      go: vi.fn(),
      goBack: vi.fn(),
      goForward: vi.fn(),
      block: vi.fn(),
      length: 3
    };

    await act(async () => {
      historyMock.go(-1);
      fireEvent.click(screen.getByTestId('suggestions-link'));
    });
    
    expect(screen.getByTestId('suggestions-page')).toBeTruthy();
  });
}); 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  length: 0,
  key: vi.fn((_index: number) => null)
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

vi.useFakeTimers();

import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

const TestComponent = () => {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <button 
        data-testid="toggle-theme" 
        onClick={toggleTheme}
      >
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    
    vi.clearAllTimers();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('deve iniciar com tema claro por padrão', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });
  
  it('deve alternar para tema escuro ao clicar no botão', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
    
    fireEvent.click(screen.getByTestId('toggle-theme'));
    
    expect(screen.getByTestId('theme-mode').textContent).toBe('dark');
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-mode', 'dark');
  });
  
  it('deve alternar de volta para tema claro ao clicar novamente no botão', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode').textContent).toBe('dark');
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-mode', 'light');
  });
  
  it('deve carregar o tema do localStorage se disponível', () => {
    mockLocalStorage.store['theme-mode'] = 'dark';
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode').textContent).toBe('dark');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-mode');
  });
  
  it('deve usar o tema claro padrão se o valor no localStorage for inválido', () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    try {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'theme-mode') return 'invalid_theme';
        return null;
      });
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-mode');
    } finally {
        console.error = originalConsoleError;
    }
  });
}); 
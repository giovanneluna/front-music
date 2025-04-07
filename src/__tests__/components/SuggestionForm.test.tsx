import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionForm from '../../components/ui/SuggestionForm';
import { validateYoutubeUrl } from '../../services/suggestionService';

vi.mock('../../services/musicService', () => ({
  musicService: {
    getYoutubeVideoInfo: vi.fn(),
  },
  suggestMusic: vi.fn(),
}));

vi.mock('../../services/suggestionService', () => ({
  validateYoutubeUrl: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
  }),
}));


describe('SuggestionForm', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateYoutubeUrl).mockReturnValue(false);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('renderiza o formulário corretamente', () => {
    render(<SuggestionForm open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Sugerir uma música')).toBeTruthy();
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeTruthy();
    expect(screen.getByText('Procurar')).toBeTruthy();
  });
  
  it('valida URL do YouTube', async () => {
    render(<SuggestionForm open={true} onClose={mockOnClose} />);
    
    const urlInput = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...');
    const searchButton = screen.getByText('Procurar');
    
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.click(searchButton);
    
    expect(screen.getByText(/insira um link válido do YouTube/i)).toBeTruthy();
  }, 15000);
  
  
}); 
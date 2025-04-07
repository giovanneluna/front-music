import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '../mocks/mui';
import { MusicFormModal } from '../../components/ui/MusicFormModal';
import { musicService } from '../../services/musicService';
import { validateYoutubeUrl } from '../../services/suggestionService';

vi.mock('../../services/musicService', () => ({
  musicService: {
    getYoutubeVideoInfo: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    createFromYoutubeUrl: vi.fn()
  }
}));

vi.mock('../../services/suggestionService', () => ({
  validateYoutubeUrl: vi.fn()
}));

describe('MusicFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateYoutubeUrl).mockReturnValue(true);
  });
  
  it('renderiza o modal de adicionar música corretamente', () => {
    render(<MusicFormModal open={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    const title = screen.getByTestId('mui-typography-h6');
    expect(title).toBeTruthy();
    
    const urlInput = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...');
    expect(urlInput).toBeTruthy();
    
    const searchButton = screen.getByText('Procurar');
    expect(searchButton).toBeTruthy();
  });
  
  it('renderiza o modal de editar música corretamente', () => {
    const mockMusic = {
      id: 1,
      title: 'Música de Teste',
      youtube_id: 'dQw4w9WgXcQ',
      thumbnail: 'http://example.com/thumb.jpg',
      views: 1000,
      views_formatted: '1K',
      likes: 100,
      likes_formatted: '100',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };
    
    render(<MusicFormModal open={true} onClose={mockOnClose} onSave={mockOnSave} music={mockMusic} />);
    
    expect(screen.getByTestId('mui-typography-h6')).toBeTruthy();
    
    expect(screen.getByTestId('input-title')).toHaveValue('Música de Teste');
    expect(screen.getByTestId('input-views')).toHaveValue(1000);
    expect(screen.getByTestId('input-likes')).toHaveValue(100);
    expect(screen.getByTestId('input-youtube_id')).toHaveValue('dQw4w9WgXcQ');
    expect(screen.getByTestId('input-thumbnail')).toHaveValue('http://example.com/thumb.jpg');
  });
  
  it('busca informações do vídeo do YouTube', async () => {
    vi.mocked(validateYoutubeUrl).mockReturnValue(true);
    
    const mockVideoInfo = {
      titulo: 'Vídeo de Teste',
      visualizacoes: 1000,
      likes: 100,
      youtube_id: 'dQw4w9WgXcQ',
      thumb: 'http://example.com/thumb.jpg'
    };
    
    vi.mocked(musicService.getYoutubeVideoInfo).mockResolvedValue({ 
      status: 'success',
      data: mockVideoInfo
    });
    
    render(<MusicFormModal open={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    const urlInput = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...');
    fireEvent.change(urlInput, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    
    const searchButton = screen.getByText('Procurar');
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    expect(musicService.getYoutubeVideoInfo).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
  
  it('salva um novo registro', async () => {
    const mockCreatedMusic = {
      id: 1,
      title: 'Música de Teste',
      youtube_id: 'dQw4w9WgXcQ',
      thumbnail: 'http://example.com/thumb.jpg',
      views: 1000,
      views_formatted: '1K',
      likes: 100,
      likes_formatted: '100',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };
    
    vi.mocked(musicService.create).mockResolvedValueOnce(mockCreatedMusic);
    
    render(<MusicFormModal open={true} onClose={mockOnClose} onSave={mockOnSave} />);
    
    const titleInput = screen.getByTestId('input-title');
    const viewsInput = screen.getByTestId('input-views'); 
    const likesInput = screen.getByTestId('input-likes');
    const youtubeIdInput = screen.getByTestId('input-youtube_id');
    const thumbnailInput = screen.getByTestId('input-thumbnail');
    
    fireEvent.change(titleInput, { target: { value: 'Música de Teste' } });
    fireEvent.change(viewsInput, { target: { value: '1000' } });
    fireEvent.change(likesInput, { target: { value: '100' } });
    fireEvent.change(youtubeIdInput, { target: { value: 'dQw4w9WgXcQ' } });
    fireEvent.change(thumbnailInput, { target: { value: 'http://example.com/thumb.jpg' } });
    
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(button => button.textContent?.includes('Adicionar Música') && button.getAttribute('variant') === 'contained');
    
    if (saveButton) {
      fireEvent.click(saveButton);
    }
    
    await waitFor(() => {
      expect(musicService.create).toHaveBeenCalledWith({
        title: 'Música de Teste',
        views: 1000,
        likes: 100,
        youtube_id: 'dQw4w9WgXcQ',
        thumbnail: 'http://example.com/thumb.jpg'
      });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  
  it('atualiza um registro existente', async () => {
    const mockMusic = {
      id: 1,
      title: 'Música Original',
      youtube_id: 'dQw4w9WgXcQ',
      thumbnail: 'http://example.com/thumb.jpg',
      views: 1000,
      views_formatted: '1K',
      likes: 100,
      likes_formatted: '100',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };
    
    vi.mocked(musicService.update).mockResolvedValueOnce({
      status: 'success',
      message: 'Música atualizada com sucesso',
      data: { ...mockMusic, title: 'Música Atualizada' }
    });
    
    render(<MusicFormModal open={true} onClose={mockOnClose} onSave={mockOnSave} music={mockMusic} />);
    
    const titleInput = screen.getByTestId('input-title');
    fireEvent.change(titleInput, { target: { value: 'Música Atualizada' } });
    
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons.find(button => button.getAttribute('variant') === 'contained' && button.getAttribute('color') === 'primary');
    
    if (saveButton) {
      fireEvent.click(saveButton);
    }
    
    await waitFor(() => {
      expect(musicService.update).toHaveBeenCalledWith(1, {
        title: 'Música Atualizada',
        views: 1000,
        likes: 100,
        youtube_id: 'dQw4w9WgXcQ',
        thumbnail: 'http://example.com/thumb.jpg'
      });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
}); 
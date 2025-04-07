import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicCard from '../../components/ui/MusicCard';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', is_admin: true },
  }),
}));

const mockOpen = vi.fn();
window.open = mockOpen;

describe('MusicCard', () => {
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
  
  it('renderiza o card corretamente', () => {
    render(<MusicCard music={mockMusic} position={0} />);
    
    expect(screen.getByText('Música de Teste')).toBeTruthy();
    expect(screen.getByText('1K')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
    
    const thumbnail = document.querySelector('img');
    expect(thumbnail).toBeTruthy();
    expect(thumbnail?.getAttribute('src')).toBe('http://example.com/thumb.jpg');
    expect(thumbnail?.getAttribute('alt')).toBe('Música de Teste');
  });
  
  it('mostra a posição quando destacado', () => {
    render(<MusicCard music={mockMusic} position={3} highlighted={true} />);
    
    expect(screen.getByText('3')).toBeTruthy();
  });
  
  it('abre o vídeo do YouTube ao clicar no card', () => {
    render(<MusicCard music={mockMusic} position={0} />);
    
    const cardActionArea = screen.getByText('Música de Teste').closest('button');
    if (cardActionArea) {
      fireEvent.click(cardActionArea);
    }
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      '_blank',
      'noopener,noreferrer'
    );
  });
  
  it('mostra botões de administração para usuário admin', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    
    render(
      <MusicCard 
        music={mockMusic} 
        position={0} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    
    expect(buttons.length).toBeGreaterThan(1);
    
  });
}); 
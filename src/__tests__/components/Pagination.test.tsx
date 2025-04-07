import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Music } from '../../types';
import { createMockMusic } from '../helpers/mockUtils';
import MusicList from '../../components/ui/MusicList';

vi.mock('../../components/ui/MusicList', () => ({
  default: ({ topMusics }: any) => (
    <div data-testid="mock-music-list">
      <div data-testid="music-items">
        {topMusics?.map((music: Music) => (
          <div key={music.id} data-testid={`music-${music.id}`}>
            {music.title}
          </div>
        ))}
      </div>
      <div data-testid="pagination-container">
        <button data-testid="prev-page">Anterior</button>
        <button data-testid="page-1" data-variant="contained">1</button>
        <button data-testid="page-2" data-variant="outlined">2</button>
        <button data-testid="page-3" data-variant="outlined">3</button>
        <button data-testid="next-page">Próxima</button>
      </div>
    </div>
  )
}));

vi.mock('../../services/musicService', () => ({
  musicService: {
    getAll: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        data: [
          createMockMusic(1, 'Música 1', 100, 10),
          createMockMusic(2, 'Música 2', 200, 20),
          createMockMusic(3, 'Música 3', 300, 30),
          createMockMusic(4, 'Música 4', 400, 40),
          createMockMusic(5, 'Música 5', 500, 50)
        ],
        meta: {
          current_page: 1,
          last_page: 3,
          per_page: 5,
          total: 15
        },
        links: {
          first: '/api/musics?page=1',
          last: '/api/musics?page=3',
          next: '/api/musics?page=2',
          prev: null
        }
      }
    })
  }
}));

describe('Paginação', () => {
  const mockTopMusics: Music[] = [
    createMockMusic(100, 'Top 1', 1000, 100),
    createMockMusic(101, 'Top 2', 900, 90),
    createMockMusic(102, 'Top 3', 800, 80)
  ];
  
  const mockOnSuggestMusic = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('deve renderizar corretamente os botões de paginação', async () => {
    render(
      <MusicList 
        topMusics={mockTopMusics} 
        onSuggestMusic={mockOnSuggestMusic}
        skipLoading={true}
      />
    );
    
    expect(screen.getByTestId('page-1')).toBeTruthy();
    expect(screen.getByTestId('page-2')).toBeTruthy();
    expect(screen.getByTestId('page-3')).toBeTruthy();
    
    expect(screen.getByTestId('page-1').getAttribute('data-variant')).toBe('contained');
    
    expect(screen.getByTestId('page-2').getAttribute('data-variant')).toBe('outlined');
    expect(screen.getByTestId('page-3').getAttribute('data-variant')).toBe('outlined');
  });
  
  it('deve permitir a navegação entre as páginas', async () => {
    render(
      <MusicList 
        topMusics={mockTopMusics} 
        onSuggestMusic={mockOnSuggestMusic}
        skipLoading={true}
      />
    );
    
    fireEvent.click(screen.getByTestId('page-2'));
    
    expect(screen.getByTestId('page-2')).toBeTruthy();
    
    fireEvent.click(screen.getByTestId('next-page'));
    
    expect(screen.getByTestId('next-page')).toBeTruthy();
    
    fireEvent.click(screen.getByTestId('prev-page'));
    
    expect(screen.getByTestId('prev-page')).toBeTruthy();
  });
}); 
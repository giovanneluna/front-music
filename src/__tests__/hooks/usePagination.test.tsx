import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../hooks/usePagination';

describe('usePagination', () => {
  const defaultTotalPages = 10;
  
  it('deve inicializar com a página 1 e valores corretos', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.visiblePages.length).toBeGreaterThan(0);
    expect(result.current.visiblePages).toContain(1);
  });
  
  it('deve avançar para a próxima página corretamente', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
  });
  
  it('deve voltar para a página anterior corretamente', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });
  
  it('deve ir para uma página específica corretamente', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    act(() => {
      result.current.goToPage(5);
    });
    
    expect(result.current.currentPage).toBe(5);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
  });
  
  it('não deve ir além da última página', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    act(() => {
      result.current.goToPage(defaultTotalPages);
    });
    
    expect(result.current.currentPage).toBe(defaultTotalPages);
    expect(result.current.hasNextPage).toBe(false);
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(defaultTotalPages);
    expect(result.current.hasNextPage).toBe(false);
  });
  
  it('não deve ir para páginas menores que 1', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
    
    act(() => {
      result.current.goToPage(-1);
    });
    
    expect(result.current.currentPage).toBe(1);
  });
  
  it('deve atualizar corretamente quando o totalPages muda', () => {
    const { result, rerender } = renderHook(
      ({ totalPages }) => usePagination(totalPages),
      { initialProps: { totalPages: defaultTotalPages } }
    );
    
    act(() => {
      result.current.goToPage(7);
    });
    
    expect(result.current.currentPage).toBe(7);
    
    rerender({ totalPages: 5 });
    
    expect(result.current.currentPage).toBe(5);
    expect(result.current.hasNextPage).toBe(false);
  });
  
  it('deve calcular corretamente as páginas visíveis', () => {
    const { result } = renderHook(() => usePagination(defaultTotalPages));
    
    expect(result.current.visiblePages).toContain(1);
    expect(result.current.visiblePages).toContain(2);
    
    act(() => {
      result.current.goToPage(5);
    });
    
    expect(result.current.visiblePages).toContain(4);
    expect(result.current.visiblePages).toContain(5);
    expect(result.current.visiblePages).toContain(6);
    
    act(() => {
      result.current.goToPage(defaultTotalPages);
    });
    
    expect(result.current.visiblePages).toContain(defaultTotalPages - 1);
    expect(result.current.visiblePages).toContain(defaultTotalPages);
  });
}); 
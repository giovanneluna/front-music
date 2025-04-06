import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Button, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Skeleton } from '@mui/material';
import MusicCard from './MusicCard';
import { Music } from '../../types';
import { getMusics, musicService } from '../../services/musicService';
import { useAuth } from '../../contexts/AuthContext';
import { MusicFormModal } from './MusicFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const MusicCardSkeleton = () => {
  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%' }}>
        <Skeleton 
          variant="rectangular" 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%',
            borderRadius: '12px 12px 0 0',
          }} 
          animation="wave"
        />
      </Box>
      
      <Box sx={{ p: 1.5, height: '100px', position: 'relative' }}>
        <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 0.5, width: '100%', borderRadius: '8px' }} animation="wave" />
        <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '80%', mb: 2.5, borderRadius: '8px' }} animation="wave" />
        
        <Box sx={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          width: '80px'
        }}>
          <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '100%', borderRadius: '8px' }} animation="wave" />
        </Box>
      </Box>
    </Box>
  );
};

interface MusicListProps {
  topMusics: Music[];
  onSuggestMusic: () => void;
  onMusicAdded?: () => void;
}

const MusicList = ({ topMusics, onSuggestMusic, onMusicAdded }: MusicListProps) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [musics, setMusics] = useState<Music[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { isAuthenticated, user } = useAuth();
  const musicContainerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const cachedPages = useRef<Record<string, {data: Music[], meta: any}>>({});
  const debounceTimerRef = useRef<number | null>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const topMusicIds = useMemo(() => topMusics.map(music => music.id), [topMusics]);

  const fetchMusics = useCallback(async (currentPage: number, currentSortOrder: 'desc' | 'asc') => {
    const cacheKey = `${currentPage}-${currentSortOrder}-${topMusicIds.join(',')}`;
    
    if (cachedPages.current[cacheKey]) {
      setMusics(cachedPages.current[cacheKey].data);
      setTotalPages(cachedPages.current[cacheKey].meta.last_page);
      return;
    }
    
    setLoading(true);
    try {
      const response = await getMusics(currentPage, 5, currentSortOrder, topMusicIds);
      
      cachedPages.current[cacheKey] = {
        data: response.data,
        meta: response.meta
      };
      
      setMusics(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch musics', error);
    } finally {
      setLoading(false);
    }
  }, [topMusicIds]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      fetchMusics(page, sortOrder);
    }, 100);
    
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [page, sortOrder, fetchMusics]);

  const handlePageChange = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, value: number) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (value === page) return;
    
    setPage(value);
  }, [page]);

  const handleSortChange = useCallback((event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value as 'desc' | 'asc');
    setPage(1);
  }, []);

  const handleEditMusic = useCallback((music: Music) => {
    setSelectedMusic(music);
    setModalOpen(true);
  }, []);

  const handleDeleteMusic = useCallback((music: Music) => {
    setMusicToDelete(music);
    setDeleteModalOpen(true);
  }, []);
  
  const forceFullUpdate = useCallback(async () => {
    try {
      cachedPages.current = {};
      
      await fetchMusics(page, sortOrder);
      
      if (onMusicAdded) {
        onMusicAdded();
      }
    } catch (error) {
    }
  }, [fetchMusics, page, sortOrder, onMusicAdded]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!musicToDelete) return;
    
    setDeleteLoading(true);
    try {
      await musicService.delete(musicToDelete.id);
      
      setTimeout(() => {
        setDeleteModalOpen(false);
        setMusicToDelete(undefined);
        
        setTimeout(() => {
          forceFullUpdate();
        }, 50);
      }, 300);
    } catch (error) {
      console.error('Erro ao excluir música:', error);
      setDeleteModalOpen(false);
      setMusicToDelete(undefined);
    } finally {
      setDeleteLoading(false);
    }
  }, [musicToDelete, forceFullUpdate]);
  
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setMusicToDelete(undefined);
  }, []);
  
  const handleAddMusic = useCallback(() => {
    setSelectedMusic(undefined);
    setModalOpen(true);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedMusic(undefined);
  }, []);
  
  const handleMusicSaved = useCallback(async () => {
    try {
      setModalOpen(false);
      setSelectedMusic(undefined);
      
      setTimeout(() => {
        forceFullUpdate();
      }, 50);
    } catch (error) {
      console.error('Erro ao recarregar lista:', error);
    }
  }, [forceFullUpdate]);

  const renderedTopMusics = useMemo(() => {
    if (topMusics.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              m: 0
            }}
          >
            Top 5 Músicas Mais Tocadas
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={user?.is_admin ? handleAddMusic : onSuggestMusic}
              sx={{ 
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 10
              }}
            >
              {user?.is_admin ? "Adicionar Música" : "Sugerir Música"}
            </Button>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',  
              sm: 'repeat(2, 1fr)',  
              md: 'repeat(3, 1fr)',  
              lg: 'repeat(5, 1fr)'   
            }, 
            gap: { xs: 1, sm: 1 },
            width: '100%',
            overflow: 'visible',  
            pb: 2   
          }}
        >
          {topMusics.map((music, index) => (
            <Box key={music.id} sx={{ 
              height: '100%', 
              width: '100%',
              overflow: 'visible'  
            }}>
              <MusicCard 
                music={music} 
                position={index + 1} 
                highlighted={true}
                onEdit={handleEditMusic}
                onDelete={handleDeleteMusic}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }, [topMusics, user, handleAddMusic, onSuggestMusic, handleEditMusic, handleDeleteMusic]);

  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;
    
    const buttons = [];
    
    buttons.push(
      <Button
        key="prev"
        disabled={page === 1}
        onClick={(e) => handlePageChange(e, page - 1)}
        sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px' }}
      >
        &lt;
      </Button>
    );
    
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handlePageChange(e, i)}
          sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px' }}
        >
          {i}
        </Button>
      );
    }
    
    buttons.push(
      <Button
        key="next"
        disabled={page === totalPages}
        onClick={(e) => handlePageChange(e, page + 1)}
        sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px' }}
      >
        &gt;
      </Button>
    );
    
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {buttons}
      </Box>
    );
  }, [totalPages, page, handlePageChange]);

  const renderSkeletons = useMemo(() => {
    return Array(5).fill(0).map((_, index) => (
      <Box key={index} sx={{ height: '100%' }}>
        <MusicCardSkeleton />
      </Box>
    ));
  }, []);

  return (
    <Box 
      sx={{ 
        width: '100%',
        position: 'relative',
      }} 
      ref={musicContainerRef}
    >
      {renderedTopMusics}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 2
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary'
          }}
        >
          Outras Músicas
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-order-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            label="Ordenar por"
            onChange={handleSortChange}
          >
            <MenuItem value="desc">Maior para menor</MenuItem>
            <MenuItem value="asc">Menor para maior</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',  
            sm: 'repeat(2, 1fr)',  
            md: 'repeat(3, 1fr)',  
            lg: 'repeat(5, 1fr)'   
          }, 
          gap: { xs: 1, sm: 1 },
          pb: 3,
          width: '100%',
          overflow: 'visible',  
          minHeight: '300px'
        }}
      >
        {loading ? (
          renderSkeletons
        ) : musics.length > 0 ? (
          musics.map((music) => (
            <Box key={music.id} sx={{ 
              height: '100%',
              overflow: 'visible'  
            }}>
              <MusicCard 
                music={music} 
                position={0} 
                onEdit={handleEditMusic}
                onDelete={handleDeleteMusic}
              />
            </Box>
          ))
        ) : (
          <Typography variant="subtitle1" sx={{ gridColumn: 'span 5', textAlign: 'center', py: 4 }}>
            Nenhuma música encontrada.
          </Typography>
        )}
      </Box>
      
      {renderPagination}
      
      <MusicFormModal 
        open={modalOpen}
        onClose={handleModalClose}
        music={selectedMusic}
        onSave={handleMusicSaved}
      />
      
      <DeleteConfirmationModal 
        open={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
        itemName={musicToDelete?.title || ''}
      />
    </Box>
  );
};

export default MusicList; 
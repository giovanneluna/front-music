import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Button, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Skeleton } from '@mui/material';
import MusicCard from './MusicCard';
import { Music } from '../../types';
import { getMusics, musicService } from '../../services/musicService';
import { useAuth } from '../../contexts/AuthContext';
import { MusicFormModal } from './MusicFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
  skipLoading?: boolean;
}

const MusicList = ({ topMusics, onSuggestMusic, onMusicAdded, skipLoading = false }: MusicListProps) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [musics, setMusics] = useState<Music[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { user, isLoggingOut } = useAuth();
  const musicContainerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const cachedPages = useRef<Record<string, {data: Music[], meta: any, timestamp: number}>>({});
  const debounceTimerRef = useRef<number | null>(null);
  const initialLoadDone = useRef(false);
  const lastAuthState = useRef<boolean | null>(null);
  const updateInProgress = useRef(false);
  const lastCacheKey = useRef<string | null>(null);
  const isChangingPageRef = useRef(false);

  const shouldShowLoadingState = useCallback(() => {
    return !skipLoading && !isLoggingOut;
  }, [skipLoading, isLoggingOut]);

  const topMusicIds = useMemo(() => topMusics.map(music => music.id), [topMusics]);

  const isCacheValid = useCallback((timestamp: number) => {
    const CACHE_DURATION = 30 * 60 * 1000;
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const getCacheKey = useCallback((currentPage: number, currentSortOrder: 'desc' | 'asc') => {
    return `${currentPage}-${currentSortOrder}-${topMusicIds.join(',')}`;
  }, [topMusicIds]);

  const fetchMusics = useCallback(async (currentPage: number, currentSortOrder: 'desc' | 'asc', force = false) => {
    if (updateInProgress.current || isLoggingOut) return;
    
    const cacheKey = getCacheKey(currentPage, currentSortOrder);
    lastCacheKey.current = cacheKey;
    
    if (!force && cachedPages.current[cacheKey] && isCacheValid(cachedPages.current[cacheKey].timestamp)) {
      if (JSON.stringify(musics) !== JSON.stringify(cachedPages.current[cacheKey].data)) {
        setMusics(cachedPages.current[cacheKey].data);
        setTotalPages(cachedPages.current[cacheKey].meta.last_page);
      }
      return;
    }
    
    if (cachedPages.current[cacheKey]?.data) {
      setMusics(cachedPages.current[cacheKey].data);
      setTotalPages(cachedPages.current[cacheKey].meta.last_page);
    }
    
    const shouldShowLoading = shouldShowLoadingState() && !cachedPages.current[cacheKey]?.data;
    if (shouldShowLoading) {
      setLoading(true);
    }

    updateInProgress.current = true;

    try {
      const response = await getMusics(currentPage, 5, currentSortOrder, topMusicIds);
      
      if (isLoggingOut) {
        updateInProgress.current = false;
        return;
      }
      
      const dataChanged = JSON.stringify(response.data) !== JSON.stringify(cachedPages.current[cacheKey]?.data);
      
      if (dataChanged && lastCacheKey.current === cacheKey) {
        cachedPages.current[cacheKey] = {
          data: response.data,
          meta: response.meta,
          timestamp: Date.now()
        };
        
        setMusics(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error) {
      console.error('Failed to fetch musics', error);
      if (cachedPages.current[cacheKey]) {
        setMusics(cachedPages.current[cacheKey].data);
        setTotalPages(cachedPages.current[cacheKey].meta.last_page);
      }
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
      updateInProgress.current = false;
    }
  }, [topMusicIds, isCacheValid, getCacheKey, musics, shouldShowLoadingState, isLoggingOut]);

  useEffect(() => {
    const isAuthenticated = !!user;
    
    if (lastAuthState.current === null) {
      lastAuthState.current = isAuthenticated;
      return;
    }

    if (lastAuthState.current !== isAuthenticated && !isLoggingOut) {
      lastAuthState.current = isAuthenticated;
      
      const cacheKey = getCacheKey(page, sortOrder);
      if (cachedPages.current[cacheKey]) {
        const currentMusicsStr = JSON.stringify(musics);
        const cachedMusicsStr = JSON.stringify(cachedPages.current[cacheKey].data);
        
        if (currentMusicsStr !== cachedMusicsStr) {
          setMusics(cachedPages.current[cacheKey].data);
          setTotalPages(cachedPages.current[cacheKey].meta.last_page);
        }
      }
      
      if (!updateInProgress.current && !isLoggingOut) {
        setTimeout(() => {
          fetchMusics(page, sortOrder, true);
        }, 100);
      }
    }
  }, [user, page, sortOrder, getCacheKey, fetchMusics, musics, isLoggingOut]);

  useEffect(() => {
    if (isLoggingOut) return;
    
    if (!initialLoadDone.current && !updateInProgress.current) {
      const cacheKey = getCacheKey(page, sortOrder);
      if (skipLoading && cachedPages.current[cacheKey]?.data) {
        setMusics(cachedPages.current[cacheKey].data);
        setTotalPages(cachedPages.current[cacheKey].meta.last_page);
        initialLoadDone.current = true;
      } else {
        fetchMusics(page, sortOrder);
        initialLoadDone.current = true;
      }
    }
  }, [page, sortOrder, fetchMusics, getCacheKey, skipLoading, isLoggingOut]);

  useEffect(() => {
    if (isLoggingOut || !initialLoadDone.current || updateInProgress.current) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      fetchMusics(page, sortOrder);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [page, sortOrder, fetchMusics, isLoggingOut]);

  useEffect(() => {
    if (isLoggingOut || !initialLoadDone.current || updateInProgress.current) return;
    
    const cacheKey = getCacheKey(page, sortOrder);
    const currentCache = cachedPages.current[cacheKey];
    
    if (currentCache) {
      const currentMusicsStr = JSON.stringify(musics);
      const cachedMusicsStr = JSON.stringify(currentCache.data);
      
      if (currentMusicsStr === cachedMusicsStr) {
        return;
      }
    }
    
    fetchMusics(page, sortOrder, true);
  }, [topMusics, page, sortOrder, fetchMusics, musics, getCacheKey, isLoggingOut]);

  const handlePageChange = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, value: number) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (value === page || isChangingPageRef.current) return;
    
    isChangingPageRef.current = true;
    
    setPage(value);
    
    setTimeout(() => {
      const otherMusicsTitleEl = document.getElementById('outras-musicas-title');
      if (otherMusicsTitleEl) {
        otherMusicsTitleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      setTimeout(() => {
        isChangingPageRef.current = false;
      }, 300);
    }, 100);
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
      const cacheKey = getCacheKey(page, sortOrder);
      delete cachedPages.current[cacheKey];
      
      await fetchMusics(page, sortOrder, true);
      
      if (onMusicAdded) {
        onMusicAdded();
      }
    } catch (error) {
      console.error('Error updating music list:', error);
    }
  }, [fetchMusics, page, sortOrder, onMusicAdded, getCacheKey]);

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
                borderRadius: 4
              }}
              startIcon={<AddIcon />}
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
        sx={{ 
          minWidth: '40px', 
          mx: 0.5, 
          borderRadius: '8px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px'
        }}
      >
        <NavigateBeforeIcon fontSize="small" sx={{ display: 'block' }} />
      </Button>
    );
    
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handlePageChange(e, i)}
          sx={{ 
            minWidth: '40px', 
            mx: 0.5, 
            borderRadius: '8px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            lineHeight: 1
          }}
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
        sx={{ 
          minWidth: '40px', 
          mx: 0.5, 
          borderRadius: '8px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px'
        }}
      >
        <NavigateNextIcon fontSize="small" sx={{ display: 'block' }} />
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
          id="outras-musicas-title"
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
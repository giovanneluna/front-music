import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Button, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import MusicCard from './MusicCard';
import { Music } from '../../types';
import { getMusics, musicService } from '../../services/musicService';
import { useAuth } from '../../contexts/AuthContext';
import { MusicFormModal } from './MusicFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { usePagination } from '../../hooks/usePagination';

const MusicCardSkeleton = () => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', bgcolor: 'background.paper' }}>
      <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%' }}>
        <Skeleton variant="rectangular" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px 12px 0 0' }} animation="wave" />
      </Box>
      <Box sx={{ p: 1.5, height: '100px', position: 'relative' }}>
        <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 0.5, width: '100%', borderRadius: '8px' }} animation="wave" />
        <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '80%', mb: 2.5, borderRadius: '8px' }} animation="wave" />
        <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: '80px' }}>
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

const MusicList = ({ topMusics, onSuggestMusic, onMusicAdded = () => {}, skipLoading = false }: MusicListProps) => {
  const [loading, setLoading] = useState(false);
  const [musics, setMusics] = useState<Music[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { user, isLoggingOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const cachedPages = useRef<Record<string, {data: Music[], meta: any, timestamp: number}>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    currentPage, 
    goToPage, 
    hasNextPage, 
    hasPrevPage, 
    visiblePages 
  } = usePagination(totalPages);

  const topMusicIds = useMemo(() => topMusics.map(music => music.id), [topMusics]);

  const getCacheKey = useCallback((page: number, order: 'desc' | 'asc') => {
    return `${page}-${order}-${topMusicIds.join(',')}`;
  }, [topMusicIds]);

  const fetchMusics = useCallback(async (page: number, order: 'desc' | 'asc', force = false) => {
    if (isLoggingOut) return;

    const cacheKey = getCacheKey(page, order);
    if (!force && cachedPages.current[cacheKey]) {
      setMusics(cachedPages.current[cacheKey].data);
      setTotalPages(cachedPages.current[cacheKey].meta.last_page);
      return;
    }

    if (!skipLoading) {
      setLoading(true);
    }
    
    try {
      const response = await getMusics(page, 5, order, topMusicIds);
      cachedPages.current[cacheKey] = {
        data: response.data,
        meta: response.meta,
        timestamp: Date.now()
      };
      setMusics(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch musics:', error);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, [isLoggingOut, topMusicIds, getCacheKey, skipLoading]);

  useEffect(() => {
    if (!isLoggingOut) {
      fetchMusics(currentPage, sortOrder);
    }
  }, [currentPage, sortOrder, fetchMusics, isLoggingOut, skipLoading]);

  const handlePageChange = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, value: number) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    goToPage(value);
    fetchMusics(value, sortOrder, true);
  }, [goToPage, sortOrder, fetchMusics]);

  const handleSortChange = useCallback((event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value as 'desc' | 'asc');
    goToPage(1);
    fetchMusics(1, event.target.value as 'desc' | 'asc', true);
  }, [goToPage, fetchMusics]);

  const handleEditMusic = useCallback((music: Music) => {
    setSelectedMusic(music);
    setModalOpen(true);
  }, []);

  const handleDeleteMusic = useCallback((music: Music) => {
    setMusicToDelete(music);
    setDeleteModalOpen(true);
  }, []);
  
  const handleAddMusic = useCallback(() => {
    setSelectedMusic(undefined);
    setModalOpen(true);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedMusic(undefined);
  }, []);
  
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setMusicToDelete(undefined);
  }, []);

  const handleMusicSaved = useCallback(async () => {
    setModalOpen(false);
    setSelectedMusic(undefined);
    
    if (onMusicAdded) {
      await onMusicAdded();
    }
    
    await fetchMusics(currentPage, sortOrder, true);
  }, [onMusicAdded, currentPage, sortOrder, fetchMusics]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!musicToDelete) return;
    
    setDeleteLoading(true);
    try {
      setMusics((prev) => prev.filter(m => m.id !== musicToDelete.id));
      
      const cacheKey = getCacheKey(currentPage, sortOrder);
      if (cachedPages.current[cacheKey]) {
        cachedPages.current[cacheKey].data = cachedPages.current[cacheKey].data.filter(
          (m: Music) => m.id !== musicToDelete.id
        );
      }
      
      await musicService.delete(musicToDelete.id);
      
      if (onMusicAdded) {
        await onMusicAdded();
      }
      
      setDeleteModalOpen(false);
      setMusicToDelete(undefined);
    } catch (error) {
      console.error('Erro ao excluir música:', error);
      await fetchMusics(currentPage, sortOrder, true);
      setDeleteModalOpen(false);
      setMusicToDelete(undefined);
    } finally {
      setDeleteLoading(false);
    }
  }, [musicToDelete, currentPage, sortOrder, getCacheKey, fetchMusics, onMusicAdded]);

  const renderedTopMusics = useMemo(() => {
    if (topMusics.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary', m: 0 }}>
            Top 5 Músicas Mais Tocadas
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={user?.is_admin ? handleAddMusic : onSuggestMusic} sx={{ fontWeight: 'bold', px: 3, py: 1, borderRadius: 4 }} startIcon={<AddIcon />}>
              {user?.is_admin ? "Adicionar Música" : "Sugerir Música"}
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: { xs: 1, sm: 1 }, width: '100%', overflow: 'visible', pb: 2 }}>
          {topMusics.map((music, index) => (
            <Box key={music.id} sx={{ height: '100%', width: '100%', overflow: 'visible' }}>
              <MusicCard music={music} position={index + 1} highlighted={true} onEdit={handleEditMusic} onDelete={handleDeleteMusic} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }, [topMusics, user, handleAddMusic, onSuggestMusic, handleEditMusic, handleDeleteMusic]);

  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;
    
    if (isMobile) {
      return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2} px={2}>
          <Button variant="outlined" disabled={!hasPrevPage} onClick={(e) => handlePageChange(e, currentPage - 1)} sx={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '8px', padding: 0, color: 'primary.main', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavigateBeforeIcon fontSize="small" />
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Página {currentPage} de {totalPages}
          </Typography>
          
          <Button variant="outlined" disabled={!hasNextPage} onClick={(e) => handlePageChange(e, currentPage + 1)} sx={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '8px', padding: 0, color: 'primary.main', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavigateNextIcon fontSize="small" />
          </Button>
        </Box>
      );
    }
    
    const buttons = [];
    
    buttons.push(
      <Button key="prev" disabled={!hasPrevPage} onClick={(e) => handlePageChange(e, currentPage - 1)} sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px' }}>
        <NavigateBeforeIcon fontSize="small" sx={{ display: 'block' }} />
      </Button>
    );
    
    for (const pageNum of visiblePages) {
      const isCurrentPage = pageNum === currentPage;
      
      buttons.push(
        <Button key={pageNum} variant={isCurrentPage ? 'contained' : 'outlined'} color="primary" onClick={(e) => handlePageChange(e, pageNum)} sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', lineHeight: 1, fontWeight: isCurrentPage ? 'bold' : 'normal', backgroundColor: isCurrentPage ? 'primary.main !important' : 'transparent', color: isCurrentPage ? 'white !important' : 'primary.main', border: isCurrentPage ? '2px solid primary.dark' : undefined, boxShadow: isCurrentPage ? '0 0 5px rgba(0,0,0,0.3)' : 'none', transform: isCurrentPage ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s ease', '&:hover': { backgroundColor: isCurrentPage ? 'primary.dark !important' : undefined, color: isCurrentPage ? 'white !important' : undefined } }}>
          {pageNum}
        </Button>
      );
    }
    
    buttons.push(
      <Button key="next" disabled={!hasNextPage} onClick={(e) => handlePageChange(e, currentPage + 1)} sx={{ minWidth: '40px', mx: 0.5, borderRadius: '8px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px' }}>
        <NavigateNextIcon fontSize="small" sx={{ display: 'block' }} />
      </Button>
    );
    
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {buttons}
      </Box>
    );
  }, [totalPages, currentPage, hasNextPage, hasPrevPage, visiblePages, handlePageChange, isMobile]);

  const renderSkeletons = useMemo(() => {
    return Array(5).fill(0).map((_, index) => (
      <Box key={index} sx={{ height: '100%' }}>
        <MusicCardSkeleton />
      </Box>
    ));
  }, []);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {renderedTopMusics}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }, mb: 2 }}>
        <Typography variant="h5" component="h2" id="outras-musicas-title" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Outras Músicas
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-order-label">Ordenar por</InputLabel>
          <Select labelId="sort-order-label" value={sortOrder} label="Ordenar por" onChange={handleSortChange}>
            <MenuItem value="desc">Maior para menor</MenuItem>
            <MenuItem value="asc">Menor para maior</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: { xs: 1, sm: 1 }, pb: 3, width: '100%', overflow: 'visible', minHeight: '300px' }}>
        {(loading && !skipLoading) ? renderSkeletons : musics.length > 0 ? musics.map((music) => (
          <Box key={music.id} sx={{ height: '100%', overflow: 'visible' }}>
            <MusicCard music={music} position={0} onEdit={handleEditMusic} onDelete={handleDeleteMusic} />
          </Box>
        )) : renderSkeletons}
      </Box>
      
      {renderPagination}

      <MusicFormModal open={modalOpen} onClose={handleModalClose} music={selectedMusic} onSave={handleMusicSaved} />
      
      <DeleteConfirmationModal open={deleteModalOpen} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} loading={deleteLoading} itemName={musicToDelete?.title || ''} />
    </Box>
  );
};

export default MusicList; 
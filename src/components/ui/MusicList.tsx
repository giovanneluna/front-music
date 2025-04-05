import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Pagination, Divider, Button, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Skeleton } from '@mui/material';
import MusicCard from './MusicCard';
import { Music } from '../../types';
import { getMusics } from '../../services/musicService';
import { useAuth } from '../../contexts/AuthContext';

const MusicCardSkeleton = () => {
  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
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
            borderRadius: '8px 8px 0 0',
          }} 
          animation="wave"
        />
      </Box>
      
      <Box sx={{ p: 1.5, height: '100px', position: 'relative' }}>
        <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 0.5, width: '100%' }} animation="wave" />
        <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '80%', mb: 2.5 }} animation="wave" />
        
        <Box sx={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          width: '80px'
        }}>
          <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '100%' }} animation="wave" />
        </Box>
      </Box>
    </Box>
  );
};

interface MusicListProps {
  topMusics: Music[];
  onSuggestMusic: () => void;
}

const MusicList = ({ topMusics, onSuggestMusic }: MusicListProps) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [musics, setMusics] = useState<Music[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { isAuthenticated } = useAuth();
  const musicContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef<number>(0);

  useEffect(() => {
    const fetchMusics = async () => {
      if (musicContainerRef.current) {
        prevScrollY.current = window.scrollY;
      }
      
      setLoading(true);
      try {
        const topMusicIds = topMusics.map(music => music.id);
        
        const response = await getMusics(page, 5, sortOrder, topMusicIds);
        
        setMusics(response.data);
        setTotalPages(response.meta.last_page);
      } catch (error) {
        console.error('Failed to fetch musics', error);
      } finally {
        setLoading(false);
        
        setTimeout(() => {
          window.scrollTo({
            top: prevScrollY.current,
            behavior: 'auto'
          });
        }, 0);
      }
    };

    fetchMusics();
  }, [page, sortOrder, topMusics]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    prevScrollY.current = window.scrollY;
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    prevScrollY.current = window.scrollY;
    setSortOrder(event.target.value as 'desc' | 'asc');
    setPage(1);
  };

  const filteredMusics = musics;

  return (
    <Box sx={{ width: '100%' }}>
      {topMusics.length > 0 && (
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
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onSuggestMusic}
              sx={{ 
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Sugerir Música
            </Button>
          </Box>
          
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)'
              }, 
              gap: 2.5
            }}
          >
            {topMusics.map((music, index) => (
              <Box key={music.id} sx={{ height: '100%' }}>
                <MusicCard 
                  music={music} 
                  position={index + 1} 
                  highlighted={true}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

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
            color: 'text.primary',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Outras Músicas
        </Typography>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sort-order-label">Ordenar por visualizações</InputLabel>
          <Select
            labelId="sort-order-label"
            id="sort-order"
            value={sortOrder}
            onChange={handleSortChange}
            label="Ordenar por visualizações"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="desc">Maior para menor</MenuItem>
            <MenuItem value="asc">Menor para maior</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box 
        ref={musicContainerRef}
        sx={{ 
          minHeight: '269px', 
          position: 'relative'
        }}
      >
        {loading ? (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)'
              }, 
              gap: 2.5
            }}
          >
            {Array.from(new Array(5)).map((_, index) => (
              <Box key={`skeleton-${index}`} sx={{ height: '269px' }}>
                <MusicCardSkeleton />
              </Box>
            ))}
          </Box>
        ) : filteredMusics.length > 0 ? (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)'
              }, 
              gap: 2.5
            }}
          >
            {filteredMusics.map((music, index) => (
              <Box key={music.id} sx={{ height: '269px' }}>
                <MusicCard
                  music={music}
                  position={page === 1 ? index + 6 : (page - 1) * 5 + index + 6}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            Nenhuma música adicional encontrada.
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, height: '40px' }}>
        {!loading && filteredMusics.length > 0 && (
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MusicList; 
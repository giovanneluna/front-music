import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MusicList from '../components/ui/MusicList';
import SuggestionForm from '../components/ui/SuggestionForm';
import { getTopMusics } from '../services/musicService';
import { Music } from '../types';

function Home() {
  const { isAuthenticated, loading: authLoading, isLoggingOut, openLoginDialog } = useAuth();
  const [loading, setLoading] = useState(false);
  const [topMusics, setTopMusics] = useState<Music[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const initialLoadDone = useRef(false);
  const firstRenderDone = useRef(false);

  const fetchTopMusics = useCallback(async (force = false) => {
    if (!force && initialLoadDone.current) return;
    
    if (!initialLoadDone.current) {
      setLoading(true);
    }
    
    try {
      const response = await getTopMusics(5);
      setTopMusics(response.data);
    } catch (err) {
      console.error('Error fetching top musics:', err);
      setError('Não foi possível carregar as músicas. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isLoggingOut) {
      fetchTopMusics();
    }
  }, [authLoading, fetchTopMusics, isLoggingOut]);

  useEffect(() => {
    firstRenderDone.current = true;
  }, []);

  useEffect(() => {
    const handleTopMusicsUpdated = (event: CustomEvent) => {
      if (event.detail && event.detail.musics) {
        setTopMusics(event.detail.musics);
      }
    };

    window.addEventListener('topMusicsUpdated', handleTopMusicsUpdated as EventListener);

    return () => {
      window.removeEventListener('topMusicsUpdated', handleTopMusicsUpdated as EventListener);
    };
  }, []);

  const handleSuggestMusic = () => {
    if (isAuthenticated) {
      setShowSuggestionForm(true);
    } else {
      openLoginDialog();
    }
  };

  const handleCloseSuggestionForm = () => {
    setShowSuggestionForm(false);
  };

  const handleMusicAdded = useCallback(async () => {
    try {
      const response = await getTopMusics(5);
      setTopMusics(response.data);
      return true;
    } catch (err) {
      console.error('Erro ao recarregar lista:', err);
      fetchTopMusics(true);
      return false;
    }
  }, [fetchTopMusics]);

  const profileImageUrl = 'images/foto-perfil.jpg';

  const renderedContent = useMemo(() => {
    return (
      <Box sx={{ minHeight: '300px', position: 'relative' }}>
        {loading && !isLoggingOut && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: theme => theme.palette.background.paper,
            zIndex: 1
          }}>
            <CircularProgress size={60} color="primary" />
            <Typography variant="body1">
              Carregando as músicas...
            </Typography>
          </Box>
        )}
        
        {!loading && error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            position: 'relative', 
            zIndex: loading && !isLoggingOut ? 0 : 1,
            opacity: loading && !isLoggingOut ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            visibility: loading && !isLoggingOut ? 'hidden' : 'visible'
          }}>
            {topMusics.length > 0 && (
              <MusicList 
                topMusics={topMusics}
                onSuggestMusic={handleSuggestMusic}
                onMusicAdded={handleMusicAdded}
                skipLoading={firstRenderDone.current || isLoggingOut}
              />
            )}
          </Box>
        )}
      </Box>
    );
  }, [loading, error, topMusics, handleSuggestMusic, handleMusicAdded, theme, firstRenderDone, isLoggingOut]);

  if (authLoading && !isLoggingOut) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: isDark ? '#121212' : '#f5f5f5',
        color: 'text.primary',
        minHeight: '100vh',
        pt: 2,
        pb: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          zIndex: 1
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%', px: { xs: 1, sm: 2 } }}>
        <Box 
          sx={{ 
            mb: 3, 
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3,
            backgroundColor: isDark ? 'rgba(24, 24, 24, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Box 
            component="img" 
            src={profileImageUrl}
            alt="Tião Carreiro e Pardinho" 
            sx={{ 
              width: { xs: 120, sm: 150 }, 
              height: { xs: 120, sm: 150 }, 
              borderRadius: '50%',
              border: `1px solid ${theme.palette.primary.main}`,
              objectFit: 'cover'
            }}
          />
          
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
              Clube do Tião
            </Typography>
            
            <Typography variant="subtitle1" paragraph>
              A melhor seleção das músicas da dupla caipira mais famosa do Brasil.
            </Typography>
          </Box>
        </Box>

        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            backgroundColor: isDark ? 'rgba(24, 24, 24, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          {renderedContent}
        </Box>
      </Box>
      
      <SuggestionForm 
        open={showSuggestionForm} 
        onClose={handleCloseSuggestionForm} 
      />
    </Box>
  );
}

export default Home; 
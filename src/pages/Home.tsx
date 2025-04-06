import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, CircularProgress, Paper, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MusicList from '../components/ui/MusicList';
import SuggestionForm from '../components/ui/SuggestionForm';
import { getTopMusics } from '../services/musicService';
import { Music } from '../types';

function Home() {
  const { isAuthenticated, user, loading: authLoading, openLoginDialog } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topMusics, setTopMusics] = useState<Music[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fetchTopMusics = async () => {
    setLoading(true);
    try {
      const response = await getTopMusics(5);
      setTopMusics(response.data);
    } catch (err) {
      console.error('Error fetching top musics:', err);
      setError('Não foi possível carregar as músicas. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchTopMusics();
    }
  }, [authLoading]);

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

  const handleMusicAdded = useCallback(() => {
    setLoading(true);
    
    setTimeout(() => {
      fetchTopMusics().then(() => {
      }).catch(err => {
      });
    }, 300);
  }, []);

  const profileImageUrl = 'images/foto-perfil.jpg';

  if (authLoading) {
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', gap: 2 }}>
              <CircularProgress size={60} color="primary" />
              <Typography variant="body1">
                Carregando as músicas...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="error">
                {error}
              </Typography>
            </Box>
          ) : (
            <MusicList 
              topMusics={topMusics}
              onSuggestMusic={handleSuggestMusic}
              onMusicAdded={handleMusicAdded}
            />
          )}
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
import { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Paper, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MusicList from '../components/ui/MusicList';
import SuggestionForm from '../components/ui/SuggestionForm';
import { getTopMusics } from '../services/musicService';
import { Music } from '../types';

function Home() {
  const { isAuthenticated, user, openLoginDialog } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topMusics, setTopMusics] = useState<Music[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
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

    fetchTopMusics();
  }, []);

  const handleSuggestMusic = () => {
    if (isAuthenticated) {
      setShowSuggestionForm(true);
    } else {
      openLoginDialog();
    }
  };

  const handleCancelSuggestion = () => {
    setShowSuggestionForm(false);
  };

  const profileImageUrl = 'images/tiao-carreiro.jpg';

  return (
    <Box 
      sx={{
        backgroundColor: isDark ? '#121212' : '#f5f5f5',
        color: 'text.primary',
        minHeight: '100vh',
        pt: 2,
        pb: 8
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3, 
            backgroundColor: isDark ? '#181818' : '#fff',
            borderRadius: 2,
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3
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
        </Paper>

        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            backgroundColor: isDark ? '#181818' : '#fff',
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
            <>
              <MusicList 
                topMusics={topMusics}
                onSuggestMusic={handleSuggestMusic}
              />
              
              {showSuggestionForm && (
                <SuggestionForm onCancel={handleCancelSuggestion} />
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Home; 
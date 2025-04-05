import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  AlertTitle,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useAuth } from '../../contexts/AuthContext';
import { suggestMusic } from '../../services/musicService';

interface SuggestionFormProps {
  onCancel: () => void;
}

function SuggestionForm({ onCancel }: SuggestionFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateYoutubeUrl = (url: string) => {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O título da música é obrigatório.');
      return;
    }
    
    if (!youtubeUrl.trim()) {
      setError('O link do YouTube é obrigatório.');
      return;
    }
    
    if (!validateYoutubeUrl(youtubeUrl)) {
      setError('Por favor, insira um link válido do YouTube.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await suggestMusic({
        title,
        youtube_url: youtubeUrl,
        user_id: user?.id || 0
      });
      
      setSuccess(true);
      setTitle('');
      setYoutubeUrl('');
      
      setTimeout(() => {
        onCancel();
      }, 2000);
      
    } catch (err) {
      console.error('Error suggesting music:', err);
      setError('Não foi possível enviar sua sugestão. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mt: 3, 
        mb: 2, 
        position: 'relative',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#181818' : '#fff',
        borderRadius: 2,
        border: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <IconButton 
        onClick={onCancel} 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8,
          color: 'text.secondary'
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Sugerir uma música
      </Typography>
      
      {success ? (
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: 1,
            mb: 2 
          }}
        >
          <AlertTitle>Sucesso!</AlertTitle>
          Sua sugestão foi enviada e será analisada em breve.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Título da música"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Link do YouTube"
            name="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <YouTubeIcon color="error" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                px: 3
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                px: 3
              }}
            >
              {loading ? 'Enviando...' : 'Enviar sugestão'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default SuggestionForm; 
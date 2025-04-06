import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  AlertTitle,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useAuth } from '../../contexts/AuthContext';
import { suggestMusic, musicService } from '../../services/musicService';

interface SuggestionFormProps {
  open: boolean;
  onClose: () => void;
}

function SuggestionForm({ open, onClose }: SuggestionFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchingVideo, setSearchingVideo] = useState(false);

  const validateYoutubeUrl = (url: string) => {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/');
  };

  const extractYoutubeInfo = async () => {
    if (!youtubeUrl) {
      setError('Informe a URL do YouTube.');
      return;
    }
    
    if (!validateYoutubeUrl(youtubeUrl)) {
      setError('Por favor, insira um link válido do YouTube.');
      return;
    }

    setSearchingVideo(true);
    setError(null);
    
    try {
      const response = await musicService.getYoutubeVideoInfo(youtubeUrl);
      const videoInfo = response.data;
      
      setTitle(videoInfo.titulo);
    } catch (err) {
      console.error('Erro ao processar URL do YouTube:', err);
      setError(err instanceof Error ? err.message : 'URL inválida ou erro ao processar o vídeo.');
    } finally {
      setSearchingVideo(false);
    }
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
        url: youtubeUrl,
        user_id: user?.id || 0
      });
      
      setSuccess(true);
      
      setTitle('');
      setYoutubeUrl('');
      
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSuccess(false);
        }, 300);
      }, 2000);
      
    } catch (err) {
      console.error('Error suggesting music:', err);
      setError('Não foi possível enviar sua sugestão. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !searchingVideo) {
      onClose();
      
      setTimeout(() => {
        setTitle('');
        setYoutubeUrl('');
        setError(null);
        setSuccess(false);
      }, 300);
    }
  };

  const isProcessing = loading || searchingVideo;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle>
        Sugerir uma música
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={isProcessing}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            borderRadius: 2
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Alert 
            severity="success" 
            sx={{ 
              borderRadius: 12,
              my: 2 
            }}
          >
            <AlertTitle>Sucesso!</AlertTitle>
            Sua sugestão foi enviada e será analisada em breve.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 12
                }}
              >
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Link do YouTube"
              name="youtubeUrl"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isProcessing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon color="error" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={extractYoutubeInfo}
                      variant="contained"
                      disabled={isProcessing || !youtubeUrl}
                      sx={{ whiteSpace: 'nowrap', borderRadius: 10 }}
                    >
                      {searchingVideo ? <CircularProgress size={24} /> : 'Procurar'}
                    </Button>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ 
                mb: 2
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              helperText="Cole a URL do YouTube e clique em 'Procurar' para encontrar automaticamente o título"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Título da música"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              sx={{ 
                mb: 2
              }}
            />
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isProcessing}
            sx={{ 
              borderRadius: 10,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            disabled={isProcessing || !title || !youtubeUrl}
            sx={{ 
              borderRadius: 10,
              px: 3
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar sugestão'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default SuggestionForm; 
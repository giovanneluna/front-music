import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardMedia,
  IconButton,
  InputAdornment
} from '@mui/material';
import { suggestionService } from '../../services/suggestionService';
import { SuggestionFormProps } from './types';
import CloseIcon from '@mui/icons-material/Close';

function SuggestionForm({ open, onClose }: SuggestionFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value);
    setError(null);
    setPreview(null);
  };

  const handleGetInfo = async () => {
    if (!youtubeUrl.trim()) {
      setError('Por favor, informe a URL do vídeo no YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await suggestionService.getVideoInfo(youtubeUrl);
      if (response.status === 'success' && response.data) {
        setPreview(response.data);
      } else {
        setError('Não foi possível obter informações do vídeo');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao obter informações do vídeo');
      console.error('Error fetching video info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!youtubeUrl.trim()) {
      setError('Por favor, informe a URL do vídeo no YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await suggestionService.create(youtubeUrl);
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Não foi possível enviar a sugestão');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar sugestão');
      console.error('Error submitting suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setYoutubeUrl('');
    setError(null);
    setPreview(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Sugerir Vídeo
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.error.main,
            borderRadius: 2
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Sugestão enviada com sucesso! Aguarde a aprovação.
          </Alert>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="URL do YouTube"
              fullWidth
              variant="outlined"
              value={youtubeUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={loading}
              error={!!error}
              helperText={error}
            />
            
            {preview && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Pré-visualização:
                </Typography>
                <Card>
                  <CardMedia
                    component="img"
                    image={preview.thumbnail}
                    alt={preview.title}
                    sx={{ height: 180 }}
                  />
                  <Box p={2}>
                    <Typography variant="h6">{preview.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visualizações: {preview.views_formatted} | 
                      Likes: {preview.likes_formatted}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!preview && !success && (
          <Button 
            onClick={handleGetInfo} 
            color="primary" 
            disabled={loading || !youtubeUrl.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Verificar Vídeo'}
          </Button>
        )}
        {preview && !success && (
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar Sugestão'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SuggestionForm; 
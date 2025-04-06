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
  CircularProgress,
  Stack,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../contexts/AuthContext';
import { suggestMusic, musicService } from '../../services/musicService';

interface SuggestionFormProps {
  open: boolean;
  onClose: () => void;
}

interface VideoPreview {
  titulo: string;
  visualizacoes: number;
  likes: number;
  youtube_id: string;
  thumb: string;
}

function SuggestionForm({ open, onClose }: SuggestionFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchingVideo, setSearchingVideo] = useState(false);
  const [preview, setPreview] = useState<VideoPreview | null>(null);

  const validateYoutubeUrl = (url: string) => {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
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
      
      if (!response || !response.data) {
        throw new Error('Não foi possível obter informações do vídeo');
      }
      
      const videoInfo = response.data;
      setTitle(videoInfo.titulo || '');
      setPreview(videoInfo);
      
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 404) {
        setError('API não encontrada. Verifique a configuração do servidor.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('URL inválida ou erro ao processar o vídeo.');
      }
      setPreview(null);
    } finally {
      setSearchingVideo(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      setPreview(null);
      
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
        setPreview(null);
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
      disableEnforceFocus
      disableAutoFocus
      container={document.body}
      keepMounted={false}
      aria-labelledby="suggestion-dialog-title"
      aria-describedby="suggestion-dialog-description"
    >
      <DialogTitle id="suggestion-dialog-title">
        Sugerir uma música
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={isProcessing}
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
      
      <DialogContent id="suggestion-dialog-description">
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
            
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Link do YouTube *
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <Box sx={{ width: '100%' }}>
                  <TextField
                    required
                    fullWidth
                    name="youtubeUrl"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isProcessing}
                    sx={{ 
                      m: 0
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <YouTubeIcon color="error" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 2,
                        height: '40px'
                      }
                    }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '40%' }, minWidth: '140px' }}>
                  <Button
                    onClick={extractYoutubeInfo}
                    variant="contained"
                    disabled={isProcessing || !youtubeUrl}
                    sx={{ 
                      whiteSpace: 'nowrap', 
                      borderRadius: 2,
                      height: '40px',
                      width: '100%'
                    }}
                    startIcon={searchingVideo ? undefined : <SearchIcon />}
                  >
                    {searchingVideo ? <CircularProgress size={24} /> : 'Procurar'}
                  </Button>
                </Box>
              </Stack>
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', mt: 0.5 }}
              >
                Cole a URL do YouTube e clique em 'Procurar' para encontrar automaticamente o título
              </Typography>
            </Paper>
            
            {preview && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Título da música * 
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label=""
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isProcessing}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    sx={{ 
                      m: 0
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  width: '100%', 
                  mt: 2, 
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box 
                    component="img"
                    src={preview.thumb || ''}
                    alt={title}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: '200px',
                      objectFit: 'cover'
                    }}
                  />
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      {formatNumber(preview.visualizacoes || 0)} visualizações
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      {formatNumber(preview.likes || 0)} curtidas
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, width: '100%' }}>
            <Button
              onClick={handleSubmit}
              type="button"
              variant="contained"
              color="primary"
              disabled={isProcessing || !title || !youtubeUrl}
              sx={{ 
                borderRadius: 10,
                fontWeight: 'bold',
                py: 1.2,
                width: '100%'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Enviar sugestão'
              )}
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default SuggestionForm; 
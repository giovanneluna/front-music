import { useState, useEffect } from 'react';
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
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Paper,
  Stack
} from '@mui/material';
import { suggestionService, validateYoutubeUrl } from '../../services/suggestionService';
import { SuggestionFormProps } from './types';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SendIcon from '@mui/icons-material/Send';

function SuggestionForm({ open, onClose }: SuggestionFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!open) {
      setYoutubeUrl('');
      setPreview(null);
      setEditedTitle('');
      setError(null);
      setSubmitError(null);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (preview) {
      setEditedTitle(preview.titulo || preview.title || '');
    }
  }, [preview]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value);
    setError(null);
    setSubmitError(null);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(event.target.value);
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

  const handleGetInfo = async () => {
    if (!youtubeUrl.trim()) {
      setError('Por favor, informe a URL do vídeo no YouTube');
      return;
    }

    if (!validateYoutubeUrl(youtubeUrl)) {
      setError('URL do YouTube inválida. Utilize um link no formato correto');
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitError(null);
    
    try {
      const response = await suggestionService.getVideoInfo(youtubeUrl);
      if (response.status === 'success' && response.data) {
        setPreview(response.data);
      } else {
        setError('Não foi possível obter informações do vídeo');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao obter informações do vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!youtubeUrl.trim()) {
      setSubmitError('Por favor, informe a URL do vídeo no YouTube');
      return;
    }

    if (!validateYoutubeUrl(youtubeUrl)) {
      setSubmitError('URL do YouTube inválida. Utilize um link no formato correto');
      return;
    }

    if (!preview) {
      setSubmitError('Busque as informações do vídeo antes de enviar');
      return;
    }

    if (!editedTitle.trim()) {
      setSubmitError('O título da música não pode ficar em branco');
      return;
    }

    setLoadingSubmit(true);
    setSubmitError(null);
    
    try {
      const response = await suggestionService.create(youtubeUrl);
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitError('Não foi possível enviar a sugestão');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao enviar sugestão');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: '#fff'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <YouTubeIcon />
          <Typography variant="h6" component="div" fontWeight="bold">
            Sugerir uma música
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading || loadingSubmit}
          size="small"
          sx={{
            color: '#fff',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Sugestão enviada com sucesso! Aguarde a aprovação.
          </Alert>
        ) : (
          <>
            {submitError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  alignItems: 'flex-start',
                  borderRadius: 1
                }}
                icon={<ErrorOutlineIcon />}
              >
                <Typography fontWeight="medium">
                  {submitError}
                </Typography>
              </Alert>
            )}

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <YouTubeIcon fontSize="small" color="error" />
                Link do YouTube *
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                <Box sx={{ width: '100%' }}>
                  <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={loading || loadingSubmit}
                    error={!!error}
                    helperText={error}
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 1.5 }
                    }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', md: '40%' }, minWidth: '140px' }}>
                  {(loading || !youtubeUrl.trim()) ? (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled
                      fullWidth
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                      sx={{
                        height: '40px',
                        borderRadius: 1.5,
                        boxShadow: 2
                      }}
                    >
                      {loading ? 'Buscando...' : 'Procurar'}
                    </Button>
                  ) : (
                    <Tooltip title="Buscar informações do vídeo">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGetInfo}
                        fullWidth
                        startIcon={<SearchIcon />}
                        sx={{
                          height: '40px',
                          borderRadius: 1.5,
                          boxShadow: 2
                        }}
                      >
                        Procurar
                      </Button>
                    </Tooltip>
                  )}
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
              <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Título da música * 
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 1.5 }
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
                  borderColor: theme.palette.divider
                }}>
                  <Box 
                    component="img"
                    src={preview.thumb || ''}
                    alt={editedTitle}
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
                      {formatNumber(preview.visualizacoes || preview.views || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      {formatNumber(preview.likes || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!success && preview && (
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loadingSubmit}
            fullWidth
            startIcon={<SendIcon />}
            sx={{
              borderRadius: 1.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 2
            }}
          >
            {loadingSubmit ? <CircularProgress size={24} /> : 'Enviar sugestão'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SuggestionForm; 
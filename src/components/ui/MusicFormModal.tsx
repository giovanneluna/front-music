import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Alert,
  Typography,
  Paper
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import { Music } from '../../types';
import { musicService } from '../../services/musicService';
import { validateYoutubeUrl } from '../../services/suggestionService';

interface MusicFormModalProps {
  open: boolean;
  onClose: () => void;
  music?: Music;
  onSave?: () => void;
}

interface FormData {
  title: string;
  views: number;
  likes: number;
  youtube_id: string;
  thumbnail: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

export function MusicFormModal({ open, onClose, music, onSave }: MusicFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    views: 0,
    likes: 0,
    youtube_id: '',
    thumbnail: ''
  });
  const [usingYoutubeUrl, setUsingYoutubeUrl] = useState(false);

  const isEditMode = !!music;

  useEffect(() => {
    if (music) {
      setFormData({
        title: music.title,
        views: music.views || 0,
        likes: music.likes || 0,
        youtube_id: music.youtube_id,
        thumbnail: music.thumbnail
      });
      setYoutubeUrl(`https://www.youtube.com/watch?v=${music.youtube_id}`);
    } else {
      setFormData({
        title: '',
        views: 0,
        likes: 0,
        youtube_id: '',
        thumbnail: ''
      });
      setYoutubeUrl('');
      setUsingYoutubeUrl(false);
    }
    setError(null);
    setValidationErrors({});
  }, [music, open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['views', 'likes'].includes(name) ? Number(value) : value
    }));
    
    if (validationErrors[name]) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors[name];
      setValidationErrors(updatedErrors);
    }
  };

  const handleYoutubeUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
    if (validationErrors.youtube_id) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors.youtube_id;
      setValidationErrors(updatedErrors);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const extractYoutubeId = async () => {
    if (!youtubeUrl) {
      setValidationErrors({
        youtube_id: ['A URL do YouTube é obrigatória']
      });
      return;
    }
    
    if (loading) return;
    
    const url = youtubeUrl.trim();
    
    if (!validateYoutubeUrl(url)) {
      setValidationErrors({
        youtube_id: ['A URL do YouTube inválida. Utilize um link no formato correto']
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      const response = await musicService.getYoutubeVideoInfo(url);
      
      if (!response || !response.data) {
        throw new Error('Não foi possível obter informações do vídeo');
      }
      
      const videoInfo = response.data;
      
      setFormData({
        title: videoInfo.titulo || '',
        views: videoInfo.visualizacoes || 0,
        likes: videoInfo.likes || 0,
        youtube_id: videoInfo.youtube_id || '',
        thumbnail: videoInfo.thumb || ''
      });
      
      setUsingYoutubeUrl(false);
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('Não foi possível obter informações do vídeo do YouTube.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (loading) return;
    
    if (!usingYoutubeUrl && (
      !formData.title || 
      !formData.youtube_id || 
      formData.views === 0 || 
      !formData.thumbnail
    )) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      if (isEditMode && music) {
        await musicService.update(music.id, {
          title: formData.title,
          views: formData.views,
          likes: formData.likes,
          youtube_id: formData.youtube_id,
          thumbnail: formData.thumbnail
        });
        onSave?.();
        onClose();
      } else if (usingYoutubeUrl) {
        await musicService.createFromYoutubeUrl(youtubeUrl);
        onSave?.();
        onClose();
      } else {
        await musicService.create({
          title: formData.title,
          youtube_id: formData.youtube_id,
          thumbnail: formData.thumbnail,
          views: formData.views,
          likes: formData.likes
        });
        onSave?.();
        onClose();
      }
    } catch (err: any) {
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        setValidationErrors(err.response.data.errors);
        
        if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Por favor, corrija os erros de validação.');
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao salvar música');
      }
      
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    return validationErrors[fieldName] && validationErrors[fieldName].length > 0
      ? validationErrors[fieldName][0]
      : null;
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: theme => theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <YouTubeIcon />
          <Typography variant="h6">
            {isEditMode ? 'Editar Música' : 'Adicionar Música'}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 2
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, mt: 1 }}>
            {error}
            {error?.includes('já existe') && (
              <Box mt={1} display="flex" justifyContent="flex-end">
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  onClick={() => {
                    setYoutubeUrl('');
                    setError(null);
                    setValidationErrors({});
                    setFormData(prev => ({
                      ...prev,
                      youtube_id: ''
                    }));
                  }}
                  sx={{ borderRadius: 10 }}
                >
                  Tentar outro vídeo
                </Button>
              </Box>
            )}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {!isEditMode && (
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: theme => theme.palette.grey[50], borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ 
                mb: 1.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1
              }}>
                <YouTubeIcon fontSize="small" color="error" />
                URL do YouTube
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <Box sx={{ width: '100%' }}>
                  <TextField
                    value={youtubeUrl}
                    onChange={handleYoutubeUrlChange}
                    fullWidth
                    disabled={loading}
                    placeholder="https://www.youtube.com/watch?v=..."
                    error={!!getFieldError('youtube_id')}
                    InputProps={{
                      sx: { 
                        borderRadius: 2,
                        height: '40px'
                      }
                    }}
                    size="small"
                  />
                  <Typography variant="caption" color={getFieldError('youtube_id') ? "error" : "text.secondary"} sx={{ display: 'block', mt: 1, ml: 1 }}>
                    {getFieldError('youtube_id') || "Cole a URL do YouTube para obter automaticamente as informações do vídeo"}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: { xs: '100%', md: '40%' }, 
                  minWidth: '140px',
                  mt: { xs: 0, md: 0 },
                  alignSelf: { xs: 'stretch', md: 'flex-start' }
                }}>
                  <Button 
                    onClick={extractYoutubeId}
                    variant="contained"
                    disabled={loading || !youtubeUrl}
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    sx={{ 
                      height: '40px',
                      borderRadius: 2,
                      boxShadow: 2,
                      textTransform: 'none',
                      px: 2
                    }}
                  >
                    {loading ? 'Buscando...' : 'Procurar'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}

          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: theme => theme.palette.grey[50], borderRadius: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ 
                  mb: 1.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1
                }}>
                  <LinkIcon fontSize="small" color="primary" />
                  Título
                </Typography>
                <TextField
                  label="Título da música"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  disabled={loading}
                  required
                  error={!!getFieldError('title')}
                  helperText={getFieldError('title')}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  size="small"
                />
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ flex: 1, minWidth: '140px' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ 
                    mb: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1
                  }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    Visualizações
                  </Typography>
                  <TextField
                    label="Visualizações"
                    name="views"
                    value={formData.views}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    type="number"
                    required
                    error={!!getFieldError('views')}
                    helperText={getFieldError('views')}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: formData.views > 0 && (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(formData.views)}
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                    size="small"
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: '140px' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ 
                    mb: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1
                  }}>
                    <ThumbUpIcon fontSize="small" color="primary" />
                    Likes
                  </Typography>
                  <TextField
                    label="Likes"
                    name="likes"
                    value={formData.likes}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    type="number"
                    required
                    error={!!getFieldError('likes')}
                    helperText={getFieldError('likes')}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: formData.likes > 0 && (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(formData.likes)}
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                    size="small"
                  />
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: theme => theme.palette.grey[50], borderRadius: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ 
                  mb: 1.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1
                }}>
                  <YouTubeIcon fontSize="small" color="error" />
                  YouTube ID
                </Typography>
                <TextField
                  label="ID do vídeo"
                  name="youtube_id"
                  value={formData.youtube_id}
                  onChange={handleChange}
                  fullWidth
                  disabled={loading || usingYoutubeUrl}
                  required
                  error={!!getFieldError('youtube_id')}
                  helperText={getFieldError('youtube_id')}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ 
                  mb: 1.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1
                }}>
                  <ImageIcon fontSize="small" color="primary" />
                  Thumbnail
                </Typography>
                <TextField
                  label="URL da thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  fullWidth
                  disabled={loading}
                  required
                  error={!!getFieldError('thumbnail')}
                  helperText={getFieldError('thumbnail')}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  size="small"
                />
              </Box>
            </Paper>

            {formData.thumbnail && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 1
                }}
              >
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 0.5, 
                    maxWidth: '320px',
                    overflow: 'hidden',
                    borderRadius: 3
                  }}
                >
                  <img
                    src={formData.thumbnail}
                    alt={formData.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      display: 'block'
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={loading || (!usingYoutubeUrl && (!formData.title || !formData.youtube_id || formData.views === 0 || !formData.thumbnail))}
          sx={{ 
            borderRadius: 2,
            py: 1.2,
            px: 3,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Música'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
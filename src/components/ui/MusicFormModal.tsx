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
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Music } from '../../types';
import { musicService } from '../../services/musicService';
import api from '../../services/api';

interface MusicFormModalProps {
  open: boolean;
  onClose: () => void;
  music?: Music;
  onSave?: () => void;
}

interface FormData {
  title: string;
  artist?: string;
  duration?: string;
  views: number;
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
    artist: '',
    duration: '',
    views: 0,
    youtube_id: '',
    thumbnail: ''
  });
  const [usingYoutubeUrl, setUsingYoutubeUrl] = useState(false);

  const isEditMode = !!music;

  useEffect(() => {
    if (music) {
      setFormData({
        title: music.title,
        artist: '',
        duration: '',
        views: music.views || 0,
        youtube_id: music.youtube_id,
        thumbnail: music.thumbnail
      });
      setYoutubeUrl(`https://www.youtube.com/watch?v=${music.youtube_id}`);
    } else {
      setFormData({
        title: '',
        artist: '',
        duration: '',
        views: 0,
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
      [name]: name === 'views' ? Number(value) : value
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

  const extractYoutubeId = async () => {
    if (!youtubeUrl) {
      setError('Por favor, insira a URL do YouTube');
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(?:\S+)?$/;
    if (!youtubeRegex.test(youtubeUrl)) {
      setError('URL inválida. Use um formato como: https://www.youtube.com/watch?v=XXXXXXXXXXX ou https://youtu.be/XXXXXXXXXXX');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await musicService.getYoutubeVideoInfo(youtubeUrl);
      
      if (!response || !response.data) {
        setError('Não foi possível obter informações do vídeo');
        setLoading(false);
        return;
      }
      
      const videoInfo = response.data;
      
      const youtubeId = musicService.extractYoutubeId(youtubeUrl);
      
      setFormData({
        title: videoInfo.titulo || '',
        artist: '',
        duration: '',
        views: videoInfo.visualizacoes || 0,
        youtube_id: youtubeId || '',
        thumbnail: videoInfo.thumb || ''
      });
      
      setUsingYoutubeUrl(true);
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 404) {
        setError('API não encontrada. Verifique a configuração do servidor.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao obter informações do YouTube. Tente novamente.');
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
          views: formData.views
        });
        onSave?.();
        onClose();
      }
    } catch (err: any) {
      console.error('Erro ao salvar música:', err);
      
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
      <DialogTitle>
        {isEditMode ? 'Editar Música' : 'Adicionar Música'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
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
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {!isEditMode && (
            <Box mb={2}>
              <TextField
                label="URL do YouTube"
                value={youtubeUrl}
                onChange={handleYoutubeUrlChange}
                fullWidth
                disabled={loading}
                placeholder="https://www.youtube.com/watch?v=..."
                helperText={getFieldError('youtube_id') || "Cole a URL do YouTube para obter automaticamente as informações do vídeo"}
                error={!!getFieldError('youtube_id')}
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      {youtubeUrl && !loading && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setYoutubeUrl('');
                            setError(null);
                            setValidationErrors({});
                            setFormData(prev => ({
                              ...prev,
                              youtube_id: ''
                            }));
                          }}
                          edge="end"
                          sx={{ borderRadius: 2 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                      <Button 
                        onClick={extractYoutubeId}
                        variant="contained"
                        disabled={loading || !youtubeUrl}
                        sx={{ whiteSpace: 'nowrap', ml: 1, borderRadius: 10 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Procurar'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          <Stack spacing={2}>
            <TextField
              label="Título"
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
            />

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
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              label="YouTube ID"
              name="youtube_id"
              value={formData.youtube_id}
              onChange={handleChange}
              fullWidth
              disabled={loading || isEditMode || usingYoutubeUrl}
              required
              error={!!getFieldError('youtube_id')}
              helperText={getFieldError('youtube_id')}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              label="Thumbnail URL"
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
            />

            {formData.thumbnail && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 1
                }}
              >
                <img
                  src={formData.thumbnail}
                  alt={formData.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '12px'
                  }}
                />
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ borderRadius: 10 }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={loading || (!usingYoutubeUrl && (!formData.title || !formData.youtube_id || formData.views === 0 || !formData.thumbnail))}
          sx={{ borderRadius: 10 }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            'Salvar Alterações'
          ) : (
            'Adicionar Música'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
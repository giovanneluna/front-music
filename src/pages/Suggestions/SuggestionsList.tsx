import { useState } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  CircularProgress,
  PaginationItem,
  Card,
  CardContent,
  CardActions,
  Divider,
  alpha
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  YouTube as YouTubeIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Suggestion } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SuggestionsListProps } from './types';

function SuggestionsList({
  suggestions,
  onDelete,
  onStatusChange,
  currentPage,
  totalPages,
  onPageChange,
  isAdmin
}: SuggestionsListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectionError, setRejectionError] = useState(false);

  const handleDeleteClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedSuggestion(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedSuggestion) {
      await onDelete(selectedSuggestion.id);
      handleCloseDeleteDialog();
    }
  };

  const handleActionClick = (suggestion: Suggestion, type: 'approve' | 'reject') => {
    setSelectedSuggestion(suggestion);
    setActionType(type);
    setRejectionReason('');
    setRejectionError(false);
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedSuggestion(null);
    setRejectionReason('');
    setRejectionError(false);
  };

  const handleConfirmAction = async () => {
    if (selectedSuggestion) {
      if (actionType === 'reject' && !rejectionReason.trim()) {
        setRejectionError(true);
        return;
      }
      
      setLoading(true);
      try {
        if (actionType === 'approve') {
          await onStatusChange(selectedSuggestion.id, 'approved');
        } else {
          await onStatusChange(selectedSuggestion.id, 'rejected', rejectionReason);
        }
        handleCloseActionDialog();
      } catch (error) {
        console.error('Erro ao processar ação:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVideoView = (suggestion: Suggestion) => {
    if (suggestion.youtube_id) {
      try {
        setSelectedSuggestion(suggestion);
        setVideoUrl(`https://www.youtube.com/embed/${suggestion.youtube_id}?origin=${window.location.origin}&autoplay=1`);
        setVideoDialogOpen(true);
      } catch (error) {
        console.error('Erro ao abrir vídeo:', error);
        window.open(`https://www.youtube.com/watch?v=${suggestion.youtube_id}`, '_blank');
      }
    }
  };

  const handleCloseVideoDialog = () => {
    setVideoDialogOpen(false);
    setVideoUrl('');
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { label: string, color: 'warning' | 'success' | 'error' | undefined }> = {
      pending: { label: 'Pendente', color: 'warning' }, 
      approved: { label: 'Aprovada', color: 'success' }, 
      rejected: { label: 'Rejeitada', color: 'error' }
    };
    
    const config = statusConfig[status] ?? { label: status, color: undefined };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
    
    setTimeout(() => {
      const container = document.getElementById('suggestions-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const getCardBackgroundColor = (status: string) => {
    switch (status) {
      case 'pending':
        return alpha(theme.palette.warning.main, 0.05);
      case 'approved':
        return alpha(theme.palette.success.main, 0.05);
      case 'rejected':
        return alpha(theme.palette.error.main, 0.05);
      default:
        return theme.palette.background.paper;
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.divider;
    }
  };

  return (
    <>
      <Box id="suggestions-container" sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: { xs: 2, sm: 2, md: 3 }
        }}>
          {suggestions.map((suggestion) => (
            <Card 
              key={suggestion.id}
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                borderLeft: `4px solid ${getCardBorderColor(suggestion.status)}`,
                backgroundColor: getCardBackgroundColor(suggestion.status),
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ 
                flexGrow: 1, 
                pb: 1, 
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 1, 
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Box sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '50%'
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ID: {suggestion.id}
                    </Typography>
                  </Box>
                  <Box>
                    {getStatusChip(suggestion.status)}
                  </Box>
                </Box>
                
                <Tooltip 
                  title={suggestion.title} 
                  enterDelay={700}
                  enterNextDelay={700}
                  placement="top"
                  arrow
                  disableHoverListener={isMobile}
                >
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      lineHeight: 1.3,
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      height: 'auto',
                      flex: '1 0 auto',
                      cursor: 'pointer'
                    }}
                  >
                    {suggestion.title}
                  </Typography>
                </Tooltip>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    mt: 'auto',
                    pt: 0.5
                  }}
                >
                  <CalendarIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                  {formatDate(suggestion.created_at)}
                </Box>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ 
                justifyContent: 'center',
                padding: 1,
                gap: 1
              }}>
                <Tooltip title="Visualizar vídeo">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleVideoView(suggestion)}
                    sx={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {suggestion.status === 'pending' && isAdmin && (
                  <>
                    <Tooltip title="Aprovar sugestão">
                      <IconButton 
                        color="success" 
                        size="small"
                        onClick={() => handleActionClick(suggestion, 'approve')}
                        sx={{
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rejeitar sugestão">
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleActionClick(suggestion, 'reject')}
                        sx={{
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                
                {(suggestion.status === 'approved' || suggestion.status === 'rejected') && (
                  <Tooltip title="Excluir sugestão">
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={() => handleDeleteClick(suggestion)}
                      sx={{
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>

      {totalPages > 1 && (
        <>
          {isMobile ? (
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mt={3} 
              mb={2}
              px={2}
            >
              <IconButton
                onClick={(e) => handlePageChange(e, currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                sx={{
                  color: 'primary.main',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                size="small"
              >
                <NavigateBeforeIcon />
              </IconButton>
              
              <Typography variant="body2" color="text.secondary">
                Página {currentPage} de {totalPages}
              </Typography>
              
              <IconButton
                onClick={(e) => handlePageChange(e, currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                sx={{
                  color: 'primary.main',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                size="small"
              >
                <NavigateNextIcon />
              </IconButton>
            </Box>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              mt={4} 
              mb={2}
              sx={{
                '.MuiPagination-ul': {
                  flexWrap: 'nowrap',
                  gap: 0,
                  margin: 0,
                  padding: 0,
                  width: '100%',
                  justifyContent: 'center'
                },
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange} 
                color="primary"
                size="small"
                siblingCount={1}
                boundaryCount={1}
                renderItem={(item) => (
                  <PaginationItem
                    components={{
                      previous: NavigateBeforeIcon,
                      next: NavigateNextIcon
                    }}
                    {...item}
                    sx={{
                      fontWeight: item.selected ? 'bold' : 'normal',
                      backgroundColor: item.selected ? 'primary.main !important' : 'transparent',
                      color: item.selected ? 'white !important' : 'primary.main',
                      border: item.type === 'page' ? `1px solid ${
                        item.selected 
                          ? 'primary.main' 
                          : theme.palette.divider
                      }` : 'none',
                      boxShadow: item.selected ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                      minWidth: { xs: '22px', sm: '36px' },
                      height: { xs: '22px', sm: '36px' },
                      borderRadius: { xs: '2px', sm: '8px' },
                      padding: { xs: 0, sm: '0 6px' },
                      margin: { xs: '0 1px', sm: '0 4px' },
                      fontSize: { xs: '0.65rem', sm: '0.875rem' },
                      lineHeight: { xs: '22px', sm: '36px' },
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '0.8rem', sm: '1.25rem' }
                      },
                      '&:hover': {
                        backgroundColor: item.selected ? 'primary.dark !important' : alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                    data-testid={`page-${item.page}`}
                    data-variant={item.selected ? 'contained' : 'outlined'}
                  />
                )}
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          Confirmar exclusão
          <IconButton
            aria-label="close"
            onClick={handleCloseDeleteDialog}
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
          <Typography>
            Tem certeza que deseja excluir a sugestão:
          </Typography>
          <Box 
            sx={{ 
              my: 2, 
              p: 2, 
              bgcolor: theme.palette.background.paper, 
              border: `1px solid ${theme.palette.divider}`,
              borderLeft: `4px solid ${theme.palette.error.main}`,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                textAlign: 'center'
              }}
            >
              "{selectedSuggestion?.title}"
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={actionDialogOpen} 
        onClose={handleCloseActionDialog}
        maxWidth={actionType === 'reject' ? "sm" : undefined}
        fullWidth={actionType === 'reject'}
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Aprovar sugestão' : 'Rejeitar sugestão'}
          <IconButton
            aria-label="close"
            onClick={handleCloseActionDialog}
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
        <DialogContent sx={{ 
          minWidth: actionType === 'reject' ? { xs: '300px', sm: '400px' } : undefined, 
          minHeight: actionType === 'reject' ? '250px' : undefined 
        }}>
          <Typography sx={{ mb: 1 }}>
            {actionType === 'approve'
              ? `Deseja aprovar a sugestão:`
              : `Deseja rejeitar a sugestão:`}
          </Typography>
          
          <Box 
            sx={{ 
              my: 2, 
              p: 2, 
              bgcolor: theme.palette.background.paper, 
              border: `1px solid ${theme.palette.divider}`,
              borderLeft: `4px solid ${actionType === 'approve' ? theme.palette.success.main : theme.palette.error.main}`,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                textAlign: 'center'
              }}
            >
              "{selectedSuggestion?.title}"
            </Typography>
          </Box>
          
          {actionType === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              label="Motivo da rejeição"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim()) {
                  setRejectionError(false);
                }
              }}
              required
              disabled={loading}
              error={rejectionError}
              helperText={rejectionError ? "O motivo da rejeição é obrigatório" : ""}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleConfirmAction} 
            color={actionType === 'approve' ? 'success' : 'error'} 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              actionType === 'approve' ? 'Aprovar' : 'Rejeitar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={videoDialogOpen} 
        onClose={handleCloseVideoDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pr: 6,
            position: 'relative'
          }}
        >
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              display: 'block',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={selectedSuggestion?.title || "Visualizar Vídeo"}
          >
            {selectedSuggestion?.title || "Visualizar Vídeo"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseVideoDialog}
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
        <DialogContent sx={{ pt: 3 }}>
          {selectedSuggestion && (
            <Box sx={{ 
              mt: 2,
              mb: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              p: 2,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mr: 1,
                      fontWeight: 'medium',
                      color: 'text.secondary'
                    }}
                  >
                    Status:
                  </Typography>
                  {getStatusChip(selectedSuggestion.status)}
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mr: 1,
                      fontWeight: 'medium',
                      color: 'text.secondary'
                    }}
                  >
                    Adicionado em:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedSuggestion.created_at)}
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                color="error" 
                variant="contained"
                size="small"
                startIcon={<YouTubeIcon fontSize="small" />}
                onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedSuggestion.youtube_id}`, '_blank')}
                sx={{ 
                  borderRadius: 2,
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  fontSize: { xs: '0.75rem', sm: '0.7rem' },
                  py: { xs: 0.5, sm: 0.3 },
                  px: { xs: 1.5, sm: 1 },
                  minWidth: 'auto',
                  lineHeight: { sm: 1 },
                  '& .MuiButton-startIcon': {
                    marginRight: { sm: '4px' }
                  }
                }}
              >
                Abrir no YouTube
              </Button>
            </Box>
          )}
          <Box 
            sx={{ 
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              width: '100%',
              borderRadius: 1,
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
            }}
          >
            <iframe
              src={videoUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
              onError={(e) => {
                console.error('Erro ao carregar iframe:', e);
                const target = e.target as HTMLIFrameElement;
                if (target && selectedSuggestion) {
                  target.srcdoc = `
                    <html>
                      <body style="margin: 0; display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f5f5f5; color: #666; font-family: Arial, sans-serif;">
                        <div style="text-align: center; padding: 20px;">
                          <h3>Erro ao carregar o vídeo</h3>
                          <p>Clique no botão abaixo para abrir no YouTube</p>
                          <button onclick="window.open('https://www.youtube.com/watch?v=${selectedSuggestion.youtube_id}', '_blank')" 
                            style="background-color: #ff0000; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Abrir no YouTube
                          </button>
                        </div>
                      </body>
                    </html>
                  `;
                }
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SuggestionsList; 
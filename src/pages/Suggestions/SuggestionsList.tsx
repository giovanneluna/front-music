import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  YouTube as YouTubeIcon
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
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedSuggestion(null);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (selectedSuggestion) {
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
    switch (status) {
      case 'pending':
        return <Chip label="Pendente" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Aprovada" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejeitada" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              {!isMobile && <TableCell>Status</TableCell>}
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions.map((suggestion) => (
              <TableRow key={suggestion.id}>
                <TableCell>{suggestion.title}</TableCell>
                {!isMobile && <TableCell>{getStatusChip(suggestion.status)}</TableCell>}
                <TableCell>{formatDate(suggestion.created_at)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Visualizar vídeo">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleVideoView(suggestion)}
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
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeitar sugestão">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleActionClick(suggestion, 'reject')}
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
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center">
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
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
            onClick={handleCloseDeleteDialog}
            color="error"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialogOpen} onClose={handleCloseActionDialog}>
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
        <DialogContent>
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
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              disabled={loading}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseActionDialog}
            color="error"
            disabled={loading}
          >
            Cancelar
          </Button>
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
        <DialogTitle>
          {selectedSuggestion?.title || "Visualizar Vídeo"}
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
        <DialogContent>
          {selectedSuggestion && (
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap', 
              gap: 1,
              backgroundColor: theme.palette.background.paper,
              p: 2,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {selectedSuggestion.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  {getStatusChip(selectedSuggestion.status)}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Adicionado em: {formatDate(selectedSuggestion.created_at)}
                </Typography>
              </Box>
              
              <Button 
                color="error" 
                variant="contained"
                size="small"
                startIcon={<YouTubeIcon />}
                onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedSuggestion.youtube_id}`, '_blank')}
                sx={{ borderRadius: 2 }}
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
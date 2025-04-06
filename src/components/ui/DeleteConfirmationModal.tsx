import { FC, memo } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Typography, Box } from '@mui/material';

interface DeleteConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  itemName: string;
}

export const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = memo(({ 
  open, 
  onCancel, 
  onConfirm, 
  loading,
  itemName
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle id="alert-dialog-title">
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Tem certeza que deseja excluir:
        </DialogContentText>
        <Box 
          sx={{ 
            my: 2, 
            p: 2, 
            bgcolor: 'background.paper', 
            borderLeft: '4px solid',
            borderColor: 'error.main',
            borderRadius: 12,
            boxShadow: 1
          }}
        >
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: 'text.primary',
              textAlign: 'center'
            }}
          >
            "{itemName}"
          </Typography>
        </Box>
        <DialogContentText variant="body2" sx={{ mt: 1 }}>
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={onCancel} 
          color="inherit" 
          disabled={loading}
          sx={{ fontWeight: 'bold', borderRadius: 10 }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ fontWeight: 'bold', borderRadius: 10 }}
          autoFocus
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}); 
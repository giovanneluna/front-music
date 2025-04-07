import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { suggestionService } from '../../services/suggestionService';
import { Suggestion } from '../../types';
import SuggestionForm from './SuggestionForm';
import SuggestionsList from './SuggestionsList';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';

function SuggestionsPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabValue, setTabValue] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(15);
  const [selectedSortDirection, setSelectedSortDirection] = useState<'desc' | 'asc'>('desc');
  
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await suggestionService.getAll(currentPage, itemsPerPage, tabValue, sortDirection);
      if (response && response.data && response.data.data) {
        setSuggestions(response.data.data);
        setTotalPages(response.data.meta.last_page);
        setError(null);
      } else {
        setError("Resposta da API em formato inesperado");
      }
    } catch (err) {
      setError("Erro ao carregar sugestões. Tente novamente mais tarde.");
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [currentPage, tabValue, itemsPerPage, sortDirection]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setCurrentPage(1);
    setItemsPerPage(selectedItemsPerPage);
    setSortDirection(selectedSortDirection);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newPerPage: number) => {
    setSelectedItemsPerPage(newPerPage);
  };

  const handleSortDirectionChange = () => {
    setSelectedSortDirection(prevDirection => prevDirection === 'desc' ? 'asc' : 'desc');
  };

  const handleApplyFilters = () => {
    setItemsPerPage(selectedItemsPerPage);
    setSortDirection(selectedSortDirection);
    setCurrentPage(1);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    fetchSuggestions();
  };

  const handleDeleteSuggestion = async (id: number) => {
    try {
      await suggestionService.delete(id);
      fetchSuggestions();
    } catch (err) {
      console.error("Error deleting suggestion:", err);
      setError("Erro ao excluir sugestão. Tente novamente mais tarde.");
    }
  };

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected', motivo?: string) => {
    try {
      if (status === 'rejected' && (!motivo || motivo.trim() === '')) {
        setError("É necessário fornecer um motivo para rejeitar a sugestão");
        return;
      }
      
      await suggestionService.updateStatus(id, status, motivo);
      fetchSuggestions();
    } catch (err: any) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} suggestion:`, err);
      
      const errorMessage = err?.response?.data?.message || 
        `Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} sugestão. Tente novamente mais tarde.`;
      
      setError(errorMessage);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1" gutterBottom>
            {user?.is_admin ? 'Gerenciar Sugestões' : 'Minhas Sugestões'}
          </Typography>
          
          {!user?.is_admin && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenForm}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              Sugerir
            </Button>
          )}
        </Box>

        {user?.is_admin && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="suggestion status tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos" value="all" />
              <Tab label="Pendentes" value="pending" />
              <Tab label="Aprovadas" value="approved" />
              <Tab label="Rejeitadas" value="rejected" />
            </Tabs>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : suggestions.length === 0 ? (
          <Typography align="center" sx={{ my: 4 }}>
            Nenhuma sugestão encontrada.
          </Typography>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: { xs: 1.5, md: 0 }
            }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleSortDirectionChange}
                startIcon={selectedSortDirection === 'desc' ? 
                  <ArrowDownwardIcon fontSize="small" /> : 
                  <ArrowUpwardIcon fontSize="small" />}
                sx={{ 
                  borderRadius: '8px',
                  minWidth: '140px',
                  textTransform: 'none',
                  fontWeight: 'medium'
                }}
              >
                {selectedSortDirection === 'desc' ? 'Mais Recentes' : 'Mais Antigas'}
              </Button>
              
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', md: 'center' },
                flex: '1 1 auto',
              }}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                  Itens por página:
                </Typography>
                {[5, 15, 50].map((size) => (
                  <Button
                    key={size}
                    variant={selectedItemsPerPage === size ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleItemsPerPageChange(size)}
                    sx={{ 
                      minWidth: '32px', 
                      height: '28px',
                      borderRadius: '14px',
                      fontSize: '0.75rem',
                      mx: 0.5
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </Box>
              
              <Button 
                variant="contained"
                size="small"
                onClick={handleApplyFilters}
                color="primary"
                sx={{ 
                  borderRadius: '8px',
                  minWidth: '120px',
                  textTransform: 'none'
                }}
              >
                Aplicar Filtros
              </Button>
            </Box>
            
            <SuggestionsList 
              suggestions={suggestions} 
              onDelete={handleDeleteSuggestion}
              onStatusChange={handleStatusChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isAdmin={user?.is_admin || false}
            />
          </>
        )}
      </Paper>

      {!user?.is_admin && isFormOpen && (
        <SuggestionForm open={isFormOpen} onClose={handleCloseForm} />
      )}
    </Container>
  );
}

export default SuggestionsPage; 
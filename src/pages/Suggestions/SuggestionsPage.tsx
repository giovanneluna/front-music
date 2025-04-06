import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, CircularProgress, Tabs, Tab } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { suggestionService } from '../../services/suggestionService';
import { Suggestion } from '../../types';
import SuggestionForm from './SuggestionForm';
import SuggestionsList from './SuggestionsList';

function SuggestionsPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabValue, setTabValue] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await suggestionService.getAll(currentPage, 10, tabValue);
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
  }, [currentPage, tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      await suggestionService.updateStatus(id, status, motivo);
      fetchSuggestions();
    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} suggestion:`, err);
      setError(`Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} sugestão. Tente novamente mais tarde.`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1" gutterBottom>
            {user?.is_admin ? 'Gerenciar Sugestões' : 'Minhas Sugestões'}
          </Typography>
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
          <SuggestionsList 
            suggestions={suggestions} 
            onDelete={handleDeleteSuggestion}
            onStatusChange={handleStatusChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isAdmin={user?.is_admin || false}
          />
        )}
      </Paper>

      {!user?.is_admin && isFormOpen && (
        <SuggestionForm open={isFormOpen} onClose={handleCloseForm} />
      )}
    </Container>
  );
}

export default SuggestionsPage; 
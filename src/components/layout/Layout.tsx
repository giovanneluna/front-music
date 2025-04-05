import { ReactNode } from 'react';
import { Container, Box, Paper } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

function Layout({ children, maxWidth = 'lg' }: LayoutProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default' 
    }}>
      <Header />
      <Container 
        component="main" 
        maxWidth={maxWidth}
        sx={{ 
          flex: 1, 
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Paper>
      </Container>
      <Box component="footer" sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center'
      }}>
        © {new Date().getFullYear()} Top 5 Tião Carreiro & Pardinho - Versão 2.0
      </Box>
    </Box>
  );
}

export default Layout; 
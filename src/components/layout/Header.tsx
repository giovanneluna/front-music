import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, Avatar, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Login as LoginIcon, Person as PersonIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../auth/AuthModal';

function Header() {
  const { user, isAuthenticated, logout, openLoginDialog, closeLoginDialog, isLoginDialogOpen } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}
          >
            Clube do Tião
          </Typography>

          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="toggle theme"
            sx={{ mr: 1 }}
          >
            {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
          </IconButton>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <Button color="inherit" component={Link} to="/suggestions">
                  {user?.is_admin ? 'Ver Sugestões' : 'Minhas Sugestões'}
                </Button>
              )}
              
              {!isMobile && (
                <Typography variant="body1" sx={{ ml: 1, mr: 1 }}>
                  {firstName}
                </Typography>
              )}
              
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                sx={{ ml: isMobile ? 1 : 0 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#E0A800' }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                {isMobile && (
                  <>
                    <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
                      Olá, {firstName}
                    </MenuItem>
                    <MenuItem component={Link} to="/suggestions" onClick={handleClose}>
                      {user?.is_admin ? 'Ver Sugestões' : 'Minhas Sugestões'}
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              color="primary" 
              variant={mode === 'dark' ? "contained" : "outlined"}
              onClick={openLoginDialog}
              startIcon={<LoginIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                bgcolor: mode === 'dark' ? undefined : 'white',
                color: mode === 'dark' ? undefined : 'primary.main',
                '&:hover': {
                  bgcolor: mode === 'dark' ? undefined : 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {isMobile ? "Acessar" : "Acessar Conta"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <AuthModal open={isLoginDialogOpen} onClose={closeLoginDialog} />
    </>
  );
}

export default Header; 
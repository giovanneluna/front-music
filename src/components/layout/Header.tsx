import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, Avatar, useMediaQuery, useTheme as useMuiTheme, CircularProgress } from '@mui/material';
import { Login as LoginIcon, Person as PersonIcon } from '@mui/icons-material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../auth/AuthModal';

function Header() {
  const { user, isAuthenticated, logout, openLoginDialog, closeLoginDialog, isLoginDialogOpen } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
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

  const handleThemeToggle = () => {
    if (isThemeChanging) return;
    
    setIsThemeChanging(true);
    toggleTheme();
    
    setTimeout(() => {
      setIsThemeChanging(false);
    }, 400);
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
            onClick={handleThemeToggle}
            color="inherit"
            aria-label="toggle theme"
            disabled={isThemeChanging}
            sx={{ 
              mr: 2,
              transition: 'transform 0.3s ease-in-out, opacity 0.2s ease',
              bgcolor: 'rgba(255, 255, 255, 0.15)', 
              p: 1.2,
              opacity: isThemeChanging ? 0.6 : 1,
              '&:hover': {
                transform: isThemeChanging ? 'none' : 'rotate(30deg)',
                bgcolor: 'rgba(255, 255, 255, 0.25)'
              }
            }}
          >
            {isThemeChanging ? (
              <CircularProgress size={24} color="inherit" thickness={5} />
            ) : mode === 'dark' ? (
              <WbSunnyRoundedIcon sx={{ color: '#FFD700' }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ color: '#ffffff' }} />
            )}
          </IconButton>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/suggestions"
                  variant="text"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '8px',
                    fontWeight: 'medium',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {user?.is_admin ? 'Ver Sugestões' : 'Minhas Sugestões'}
                </Button>
              )}
              
              {!isMobile && (
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '20px',
                  pl: 2,
                  pr: 1,
                  py: 0.5,
                  ml: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'medium',
                      whiteSpace: 'nowrap',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 1
                    }}
                  >
                    {user?.is_admin ? 'Administrador' : firstName}
                  </Typography>
                  
                  <IconButton
                    onClick={handleMenu}
                    color="inherit"
                    size="small"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#E0A800' }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  </IconButton>
                </Box>
              )}
              
              {isMobile && (
                <IconButton
                  onClick={handleMenu}
                  color="inherit"
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#E0A800' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              )}
              
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
                sx={{ mt: 1 }}
              >
                {isMobile && (
                  <>
                    <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
                      Olá, {user?.is_admin ? 'Administrador' : firstName}
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/suggestions" 
                      onClick={handleClose}
                      sx={{
                        fontWeight: 'medium',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {user?.is_admin ? 'Ver Sugestões' : 'Minhas Sugestões'}
                    </MenuItem>
                  </>
                )}
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    fontWeight: 'medium',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.05)',
                    }
                  }}  
                >
                  Sair
                </MenuItem>
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
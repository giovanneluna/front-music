import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Box, 
  Tabs, 
  Tab, 
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').nonempty('Senha é obrigatória')
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').nonempty('Nome é obrigatório'),
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[@$!%*#?&]/, 'Senha deve conter pelo menos um caractere especial (@$!%*#?&)')
    .nonempty('Senha é obrigatória'),
  password_confirmation: z.string().nonempty('Confirmação de senha é obrigatória')
}).refine(data => data.password === data.password_confirmation, {
  message: 'As senhas não conferem',
  path: ['password_confirmation']
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
  };
}

function AuthModal({ open, onClose }: AuthModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const { login, register: registerUser } = useAuth();

  const { control: loginControl, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors, isSubmitting: isLoginSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { control: registerControl, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setLoginError(null);
    setRegisterError(null);
  };

  const handleShowLoginPassword = () => {
    setShowLoginPassword(prev => !prev);
  };

  const handleShowRegisterPassword = () => {
    setShowRegisterPassword(prev => !prev);
  };

  const handleShowRegisterConfirmPassword = () => {
    setShowRegisterConfirmPassword(prev => !prev);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await login(data.email, data.password);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Falha no login. Verifique suas credenciais.');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError(null);
      await registerUser(data.name, data.email, data.password, data.password_confirmation);
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Falha no cadastro. Verifique seus dados ou tente mais tarde.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        {tabValue === 0 ? 'Entrar' : 'Criar Conta'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isLoginSubmitting || isRegisterSubmitting}
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
      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Login" {...a11yProps(0)} />
            <Tab label="Cadastre-se" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <Controller
              name="email"
              control={loginControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!loginErrors.email}
                  helperText={loginErrors.email?.message}
                  disabled={isLoginSubmitting}
                  type="email"
                />
              )}
            />
            
            <Controller
              name="password"
              control={loginControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Senha"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!loginErrors.password}
                  helperText={loginErrors.password?.message}
                  disabled={isLoginSubmitting}
                  type={showLoginPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowLoginPassword}
                          edge="end"
                        >
                          {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              disabled={isLoginSubmitting}
              sx={{ mt: 2, mb: 1, py: 1 }}
            >
              {isLoginSubmitting ? <CircularProgress size={20} /> : 'Entrar'}
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
            <Controller
              name="name"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!registerErrors.name}
                  helperText={registerErrors.name?.message}
                  disabled={isRegisterSubmitting}
                />
              )}
            />
            
            <Controller
              name="email"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!registerErrors.email}
                  helperText={registerErrors.email?.message}
                  disabled={isRegisterSubmitting}
                  type="email"
                />
              )}
            />
            
            <Controller
              name="password"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Senha"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!registerErrors.password}
                  helperText={registerErrors.password?.message}
                  disabled={isRegisterSubmitting}
                  type={showRegisterPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowRegisterPassword}
                          edge="end"
                        >
                          {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            
            <Controller
              name="password_confirmation"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirmar Senha"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!registerErrors.password_confirmation}
                  helperText={registerErrors.password_confirmation?.message}
                  disabled={isRegisterSubmitting}
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password confirmation visibility"
                          onClick={handleShowRegisterConfirmPassword}
                          edge="end"
                        >
                          {showRegisterConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              disabled={isRegisterSubmitting}
              sx={{ mt: 2, mb: 1, py: 1 }}
            >
              {isRegisterSubmitting ? <CircularProgress size={20} /> : 'Cadastrar'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal; 
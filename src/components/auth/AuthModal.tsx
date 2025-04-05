import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Box, 
  Tabs, 
  Tab, 
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string()
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
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="div">
          Acesse sua conta
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
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
                  type="password"
                />
              )}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoginSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoginSubmitting ? <CircularProgress size={24} /> : 'Entrar'}
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
                  type="password"
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
                  type="password"
                />
              )}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isRegisterSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isRegisterSubmitting ? <CircularProgress size={24} /> : 'Cadastrar'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal; 
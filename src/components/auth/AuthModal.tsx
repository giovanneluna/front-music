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
import { data } from 'react-router-dom';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
});

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, "O nome deve conter apenas letras"),
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"),
  password_confirmation: z
    .string()
    .min(1, "A confirmação da senha é obrigatória")
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"]
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
        <Box sx={{ pt: 2 }}>
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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { login, register } = useAuth();

  const { 
    control: loginControl, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    setValue: loginSetValue,
    reset: resetLoginForm
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });

  const { 
    control: registerControl, 
    handleSubmit: handleRegisterSubmit, 
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting, isValid: isRegisterValid, isDirty: isRegisterDirty },
    setValue: registerSetValue,
    reset: resetRegisterForm,
    watch: watchRegister
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const handleClose = () => {
    resetLoginForm();
    resetRegisterForm();
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setLoginError(null);
    setRegisterError(null);
    setFormSubmitting(false);
    onClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setLoginError(null);
    setRegisterError(null);
    if (newValue === 0) {
      resetRegisterForm();
      setShowRegisterPassword(false);
      setShowRegisterConfirmPassword(false);
    } else {
      resetLoginForm();
      setShowLoginPassword(false);
    }
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
      setFormSubmitting(true);
      await login(data.email, data.password);
      resetLoginForm();
      resetRegisterForm();
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('Credenciais inválidas');
    } finally {
      setFormSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError(null);
      setFormSubmitting(true);
      await register(data.name, data.email, data.password, data.password_confirmation);
      resetLoginForm();
      resetRegisterForm();
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data?.errors?.email) {
        setRegisterError(`Email: ${error.response.data.errors.email[0]}`);
      } else if (error.response?.data?.errors?.password) {
        setRegisterError(`Senha: ${error.response.data.errors.password[0]}`);
      } else if (error.response?.data?.message) {
        setRegisterError(error.response.data.message);
      } else {
        setRegisterError('Não foi possível realizar o cadastro. Por favor, verifique seus dados e tente novamente.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetFormValues = () => {
    resetLoginForm();
    resetRegisterForm();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{
        onExited: () => {
          resetFormValues();
          setShowLoginPassword(false);
          setShowRegisterPassword(false);
          setShowRegisterConfirmPassword(false);
          setLoginError(null);
          setRegisterError(null);
          setFormSubmitting(false);
        }
      }}
    >
      <DialogTitle sx={{ pb: 0, pr: 6 }}>
        {tabValue === 0 ? 'Entrar' : 'Criar Conta'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={isLoginSubmitting || isRegisterSubmitting || formSubmitting}
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
      <DialogContent sx={{ pt: 0, pb: 3, overflowY: 'auto' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Login" {...a11yProps(0)} />
            <Tab label="Cadastre-se" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loginError && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ 
                mb: 1.5, 
                borderRadius: 1.5,
                '& .MuiAlert-icon': {
                  fontSize: '1.25rem'
                },
                '& .MuiAlert-message': {
                  fontSize: '0.95rem'
                }
              }}
            >
              {loginError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>
            <Controller
              name="email"
              control={loginControl}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || !!loginError}
                  helperText={fieldState.error?.message}
                  disabled={isLoginSubmitting || formSubmitting}
                  type="email"
                  InputProps={{
                    autoComplete: "email"
                  }}
                />
              )}
            />
            
            <Controller
              name="password"
              control={loginControl}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Senha"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || !!loginError}
                  helperText={fieldState.error?.message}
                  disabled={isLoginSubmitting || formSubmitting}
                  type={showLoginPassword ? "text" : "password"}
                  InputProps={{
                    autoComplete: "current-password",
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
              disabled={isLoginSubmitting || formSubmitting}
              sx={{ 
                mt: 2, 
                mb: 1, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: formSubmitting ? '100%' : '0%',
                  height: '3px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  transition: 'width 0.6s ease-in-out'
                }
              }}
            >
              {isLoginSubmitting || formSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {registerError && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ 
                mb: 1.5, 
                borderRadius: 1.5,
                '& .MuiAlert-icon': {
                  fontSize: '1.25rem'
                },
                '& .MuiAlert-message': {
                  fontSize: '0.95rem'
                }
              }}
            >
              {registerError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleRegisterSubmit(onRegisterSubmit)} noValidate>
            <Controller
              name="name"
              control={registerControl}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nome"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || (!!registerError && registerError.includes('Nome'))}
                  helperText={fieldState.error?.message || (!fieldState.error ? "Mínimo de 3 caracteres" : "")}
                  disabled={isRegisterSubmitting || formSubmitting}
                  autoComplete="name"
                />
              )}
            />
            
            <Controller
              name="email"
              control={registerControl}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || (!!registerError && registerError.includes('Email'))}
                  helperText={fieldState.error?.message || (!fieldState.error ? "Informe um email válido" : "")}
                  disabled={isRegisterSubmitting || formSubmitting}
                  type="email"
                  autoComplete="email"
                />
              )}
            />
            
            <Controller
              name="password"
              control={registerControl}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Senha"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || (!!registerError && registerError.includes('Senha'))}
                  helperText={fieldState.error?.message || (!fieldState.error ? "Mínimo de 8 caracteres" : "")}
                  disabled={isRegisterSubmitting || formSubmitting}
                  type={showRegisterPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Confirmar Senha"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error || (!!registerError && registerError.includes('confirmação'))}
                  helperText={fieldState.error?.message || (!fieldState.error ? "Deve ser igual à senha" : "")}
                  disabled={isRegisterSubmitting || formSubmitting}
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              disabled={isRegisterSubmitting || formSubmitting || !isRegisterDirty || !isRegisterValid}
              sx={{ 
                mt: 2, 
                mb: 1, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: formSubmitting ? '100%' : '0%',
                  height: '3px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  transition: 'width 0.6s ease-in-out'
                }
              }}
            >
              {isRegisterSubmitting || formSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal; 
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    Alert,
    Avatar,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/formulaire');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{ color: 'white', mb: 3, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                    Retour à l'accueil
                </Button>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Urbania Logo"
                            sx={{
                                height: 60,
                                width: 'auto',
                                mx: 'auto',
                                mb: 2,
                                filter: 'drop-shadow(0 4px 12px rgba(2, 132, 199, 0.15))'
                            }}
                        />
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                            Connexion
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Accédez à votre espace Urbania
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="email"
                            label="Adresse email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            name="password"
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ textAlign: 'right', mb: 3 }}>
                            <Typography
                                component={Link}
                                to="/auth/forgot-password"
                                variant="body2"
                                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Mot de passe oublié ?
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #583da1 0%, #7c62c1 100%)',
                                boxShadow: '0 4px 14px rgba(88, 61, 161, 0.35)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(88, 61, 161, 0.45)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            ou
                        </Typography>
                    </Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={<GoogleIcon />}
                        sx={{ py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                        Continuer avec Google
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Pas encore de compte ?{' '}
                            <Typography
                                component={Link}
                                to="/auth/register"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Créer un compte
                            </Typography>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Login;

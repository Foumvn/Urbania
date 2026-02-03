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
    Grid,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.acceptTerms) {
            setError('Vous devez accepter les conditions d\'utilisation');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(formData);

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
                            Créer un compte
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Rejoignez Urbania et simplifiez vos démarches
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="prenom"
                                    label="Prénom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="nom"
                                    label="Nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            name="email"
                            label="Adresse email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{ mt: 2 }}
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
                            name="telephone"
                            label="Téléphone (optionnel)"
                            value={formData.telephone}
                            onChange={handleChange}
                            sx={{ mt: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon color="action" />
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
                            sx={{ mt: 2 }}
                            helperText="Minimum 6 caractères"
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

                        <TextField
                            fullWidth
                            name="confirmPassword"
                            label="Confirmer le mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            sx={{ mt: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" color="text.secondary">
                                    J'accepte les{' '}
                                    <Typography component="a" href="#" sx={{ color: 'primary.main' }}>
                                        conditions d'utilisation
                                    </Typography>{' '}
                                    et la{' '}
                                    <Typography component="a" href="#" sx={{ color: 'primary.main' }}>
                                        politique de confidentialité
                                    </Typography>
                                </Typography>
                            }
                            sx={{ mt: 2 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer mon compte'}
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
                        S'inscrire avec Google
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Déjà un compte ?{' '}
                            <Typography
                                component={Link}
                                to="/auth/login"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Se connecter
                            </Typography>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Register;

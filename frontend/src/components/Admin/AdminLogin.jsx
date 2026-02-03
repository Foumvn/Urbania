import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, IconButton, InputAdornment, Stack } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/dashboard'); // Admin will have access to admin features on dashboard
            } else {
                setError('Email ou mot de passe administratif incorrect.');
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
            <Container maxWidth="xs">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin-portal')}
                    sx={{ mb: 2 }}
                >
                    Retour au portail
                </Button>
                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Urbania Logo"
                        sx={{ height: 60, width: 'auto', mb: 3 }}
                    />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Connexion Admin
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Accédez à votre espace d'administration Urbania
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Email Administrateur"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                            <TextField
                                fullWidth
                                label="Mot de passe"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.5, borderRadius: 2 }}
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </Stack>
                    </form>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2">
                            Besoin d'un compte ? <Link to="/admin/register" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default AdminLogin;

import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, Stack, Grid } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNotification } from '../../context/NotificationContext';

function AdminRegister() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        invite_code: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            // Register as admin
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email, // Django requires username
                    email: formData.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    password: formData.password,
                    confirm_password: formData.confirm_password,
                    role: 'admin',
                    invite_code: formData.invite_code
                })
            });

            if (response.ok) {
                showNotification('Compte administrateur créé avec succès. Un administrateur va valider votre accès.', 'success');
                setSuccess(true);
                setTimeout(() => navigate('/admin/login'), 3000);
            } else {
                let errorMsg = 'Erreur lors de la création du compte administratif.';
                try {
                    const data = await response.json();
                    if (data.detail) {
                        errorMsg = data.detail;
                    } else if (typeof data === 'object') {
                        // Extract all error messages and join them nicely
                        const messages = [];
                        for (const [key, value] of Object.entries(data)) {
                            // Skip certain keys if needed, otherwise format field errors
                            const msg = Array.isArray(value) ? value[0] : value;
                            messages.push(msg);
                        }
                        errorMsg = messages.join('\n');
                    }
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    errorMsg = `Erreur serveur (${response.status})`;
                }
                setError(errorMsg);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Une erreur réseau est survenue. Veuillez vérifier votre connexion.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xs">
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Alert severity="success" sx={{ mb: 2 }}>Compte administrateur créé avec succès !</Alert>
                        <Typography>Redirection vers la page de connexion...</Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
            <Container maxWidth="sm">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin-portal')}
                    sx={{ mb: 2 }}
                >
                    Retour au portail
                </Button>
                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Urbania Logo"
                            sx={{ height: 60, width: 'auto', mb: 3 }}
                        />
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Inscription Administrateur
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Créez un compte pour gérer la plateforme Urbania
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
                                    label="Prénom"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Professionnel"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Mot de passe"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirmer"
                                    name="confirm_password"
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Code d'invitation Admin"
                                    name="invite_code"
                                    value={formData.invite_code}
                                    onChange={handleChange}
                                    placeholder="Optionnel selon configuration"
                                    helperText="Le code d'invitation peut être requis pour valider votre statut admin."
                                />
                            </Grid>
                        </Grid>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 4, py: 1.5, borderRadius: 2 }}
                        >
                            {loading ? 'Création...' : 'Créer mon compte admin'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Déjà un compte ? <Link to="/admin/login" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default AdminRegister;

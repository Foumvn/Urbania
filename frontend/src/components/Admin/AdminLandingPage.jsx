import { Box, Container, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function AdminLandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
            <Container maxWidth="md">
                <Paper sx={{ p: { xs: 4, md: 8 }, borderRadius: 6, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        bgcolor: 'primary.main',
                        opacity: 0.05,
                        borderRadius: '50%'
                    }} />

                    <Box
                        component="img"
                        src="/logo.png"
                        alt="Urbania Logo"
                        sx={{ height: 120, width: 'auto', mb: 4 }}
                    />

                    <Typography variant="h2" gutterBottom fontWeight={800}>
                        Portail Administrateur
                    </Typography>

                    <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                        Bienvenue sur l'interface de gestion d'Urbania. Veuillez vous connecter pour accéder aux outils d'administration.
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} sm={5}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={() => navigate('/admin/login')}
                                sx={{ py: 2, borderRadius: 3 }}
                            >
                                Se connecter
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                startIcon={<PersonAddIcon />}
                                onClick={() => navigate('/admin/register')}
                                sx={{ py: 2, borderRadius: 3 }}
                            >
                                Créer un compte
                            </Button>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 8 }}>
                        <Typography variant="body2" color="text.secondary">
                            Urbania Administration v1.0.0
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default AdminLandingPage;

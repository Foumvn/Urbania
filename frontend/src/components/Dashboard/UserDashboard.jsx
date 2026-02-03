import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AppBar,
    Toolbar,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BuildIcon from '@mui/icons-material/Build';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../context/FormContext';

import { useI18n } from '../../context/I18nContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

function UserDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, lang } = useI18n();
    const { reset } = useForm();
    const [dossiers, setDossiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);

    useEffect(() => {
        fetchDossiers();
    }, []);

    const fetchDossiers = async () => {
        try {
            const token = localStorage.getItem('urbania_token');
            const response = await fetch(`${API_BASE}/dossiers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDossiers(data);
            }
        } catch (error) {
            console.error('Failed to fetch dossiers:', error);
        } finally {
            setLoading(false);
        }
    };

    const faqItems = [
        {
            question: "Qu'est-ce qu'une Déclaration Préalable (DP) ?",
            answer: "C'est une autorisation d'urbanisme obligatoire pour des travaux de faible importance (piscine, clôture, ravalement, etc.)."
        },
        {
            question: "Quel est le délai d'instruction ?",
            answer: "Le délai d'instruction est généralement de 1 mois à partir du dépôt en mairie."
        },
        {
            question: "Quelles pièces sont nécessaires ?",
            answer: "Un plan de situation, un plan de masse, et selon les travaux, un plan de façades ou une insertion paysagère."
        }
    ];

    const handleNewDossier = () => {
        reset();
        navigate('/formulaire');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getNatureLabel = (nature) => {
        const labels = {
            'RAVALEMENT': 'Ravalement de façade',
            'CLOTURE': 'Clôture et portail',
            'PISCINE': 'Piscine',
            'EXTENSION': 'Extension / Agrandissement',
            'ABRI_JARDIN': 'Abri de jardin',
        };
        return labels[nature] || nature || 'Projet sans titre';
    };

    const getNatureIcon = (nature) => {
        switch (nature) {
            case 'RAVALEMENT': return <HomeWorkIcon />;
            case 'PISCINE': return <LandscapeIcon />;
            case 'EXTENSION': return <BuildIcon />;
            default: return <DescriptionIcon />;
        }
    };

    const handleDownload = (dossier) => {
        console.log('Téléchargement du CERFA pour le dossier', dossier.id);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Header local */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Urbania"
                            sx={{ height: 40, width: 'auto' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button color="inherit" onClick={() => navigate('/admin')} sx={{ color: 'text.secondary', display: user?.role === 'admin' ? 'block' : 'none' }}>
                            {t('nav.admin')}
                        </Button>
                        <IconButton onClick={() => navigate('/profile')} color="inherit" size="small">
                            <PersonIcon />
                        </IconButton>
                        <IconButton onClick={() => navigate('/settings')} color="inherit" size="small">
                            <SettingsIcon />
                        </IconButton>
                        <IconButton onClick={handleLogout} color="error" size="small">
                            <ExitToAppIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Welcome */}
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                            {t('dashboard.welcome')} {user?.first_name || 'Utilisateur'} 👋
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {lang === 'fr' ? 'Contrôlez et gérez vos dossiers de déclaration préalable.' : 'Control and manage your preliminary declaration files.'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNewDossier}
                        sx={{ borderRadius: 2, px: 3, py: { xs: 1.5, sm: 1 } }}
                    >
                        {t('nav.form')}
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {/* Stats */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight={700} color="primary.main">
                                            {dossiers.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Dossiers
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight={700} color="success.main">
                                            {dossiers.filter(d => d.status === 'completed').length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Terminés
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Dossiers List */}
                        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {t('dashboard.recent')}
                                </Typography>
                            </Box>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={32} />
                                </Box>
                            ) : (
                                <List sx={{ py: 0 }}>
                                    {dossiers.map((dossier, index) => (
                                        <ListItem
                                            key={dossier.id}
                                            divider={index < dossiers.length - 1}
                                            sx={{
                                                py: 2.5,
                                                px: { xs: 2, sm: 3 },
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: { xs: 1.5, sm: 0 }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: { xs: 'auto', sm: 56 } }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: dossier.status === 'completed' ? 'success.50' : 'warning.50',
                                                        color: dossier.status === 'completed' ? 'success.main' : 'warning.main',
                                                        width: { xs: 32, sm: 40 },
                                                        height: { xs: 32, sm: 40 }
                                                    }}
                                                >
                                                    {getNatureIcon(dossier.data?.natureTravaux)}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                                        <Typography fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                            {getNatureLabel(dossier.data?.natureTravaux)}
                                                        </Typography>
                                                        <Chip
                                                            label={dossier.status === 'completed' ? 'Terminé' : 'En cours'}
                                                            size="small"
                                                            color={dossier.status === 'completed' ? 'success' : 'warning'}
                                                            icon={dossier.status === 'completed' ? <CheckCircleIcon /> : <PendingIcon />}
                                                            sx={{ fontWeight: 500, height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                            {dossier.data?.terrainVille || 'Adresse non renseignée'} •
                                                            {new Date(dossier.createdAt).toLocaleDateString('fr-FR')}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 0.5,
                                                width: { xs: '100%', sm: 'auto' },
                                                justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                                                mt: { xs: 1, sm: 0 }
                                            }}>
                                                {dossier.status === 'completed' && (
                                                    <IconButton size="small" color="primary" onClick={() => handleDownload(dossier)}>
                                                        <DownloadIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton size="small" onClick={() => navigate(`/formulaire?id=${dossier.id}`)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => { setSelectedDossier(dossier); setDeleteDialogOpen(true); }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                    ))}

                                    {dossiers.length === 0 && (
                                        <Box sx={{ py: 8, textAlign: 'center' }}>
                                            <FolderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                            <Typography color="text.secondary">
                                                {t('dashboard.no_dossiers')}
                                            </Typography>
                                        </Box>
                                    )}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Quick Actions */}
                        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3, mb: 3 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Actions rapides
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<HelpIcon />}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Centre d'aide
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PersonIcon />}
                                    onClick={() => navigate('/profile')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    {t('nav.profile')}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<SettingsIcon />}
                                    onClick={() => navigate('/settings')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    {t('nav.settings')}
                                </Button>
                            </Box>
                        </Paper>

                        {/* FAQ */}
                        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Questions fréquentes
                            </Typography>
                            {faqItems.map((item, index) => (
                                <Accordion
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        '&:before': { display: 'none' },
                                        bgcolor: 'transparent',
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {item.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Supprimer ce dossier ?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Cette action est irréversible. Voulez-vous vraiment supprimer ce dossier ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                    <Button color="error" variant="contained" onClick={() => setDeleteDialogOpen(false)}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UserDashboard;

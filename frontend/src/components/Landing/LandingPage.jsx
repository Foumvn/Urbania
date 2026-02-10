import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    AppBar,
    Toolbar,
    IconButton,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ModernCarousel from './ModernCarousel';
import logoUrbania from '../../assets/logo-urbania-rb.png';

const features = [
    {
        icon: <AutoAwesomeIcon fontSize="large" />,
        title: 'Intelligence Artificielle',
        description: 'Notre IA analyse votre projet et génère automatiquement tous les documents requis pour votre déclaration préalable.',
    },
    {
        icon: <DescriptionIcon fontSize="large" />,
        title: 'CERFA 13703 Complet',
        description: 'Formulaire pré-rempli conforme aux exigences légales, prêt à être déposé en mairie.',
    },
    {
        icon: <SpeedIcon fontSize="large" />,
        title: 'Gain de Temps',
        description: 'Ce qui prenait des heures ne prend plus que quelques minutes. Fini les allers-retours en mairie !',
    },
    {
        icon: <SecurityIcon fontSize="large" />,
        title: 'Conformité Garantie',
        description: 'Documents validés selon les normes d\'urbanisme en vigueur. Réduisez les risques de refus.',
    },
];

const steps = [
    { number: '01', title: 'Décrivez votre projet', description: 'Répondez à quelques questions simples sur votre projet de construction ou d\'aménagement.' },
    { number: '02', title: 'Génération automatique', description: 'Notre IA génère votre dossier complet : CERFA, plans, notices descriptives.' },
    { number: '03', title: 'Téléchargez & Déposez', description: 'Récupérez votre dossier prêt à être déposé en mairie ou en ligne.' },
];

const testimonials = [
    { name: 'Marie L.', role: 'Particulière', text: 'J\'ai pu faire ma déclaration pour ma piscine en 20 minutes. Incroyable !', rating: 5 },
    { name: 'Pierre D.', role: 'Architecte', text: 'Un outil indispensable pour gagner du temps sur les démarches administratives.', rating: 5 },
    { name: 'SCI Martin', role: 'Promoteur', text: 'Nous utilisons Urbania pour tous nos projets. Fiable et rapide.', rating: 5 },
];

const faqItems = [
    { question: 'Qu\'est-ce qu\'une déclaration préalable de travaux ?', answer: 'La déclaration préalable (DP) est une autorisation d\'urbanisme obligatoire pour certains travaux non soumis à permis de construire : piscines de moins de 100m², extensions de moins de 40m², clôtures, modifications de façade, etc.' },
    { question: 'Combien de temps prend la génération du dossier ?', answer: 'Une fois le formulaire complété (environ 15-20 minutes), la génération de votre dossier complet prend moins de 2 minutes.' },
    { question: 'Le dossier est-il conforme aux exigences légales ?', answer: 'Oui, tous nos documents sont conformes au Code de l\'urbanisme et aux exigences des services instructeurs. Nous mettons à jour régulièrement nos modèles.' },
    { question: 'Puis-je modifier mon dossier après génération ?', answer: 'Absolument ! Vous pouvez modifier et régénérer votre dossier autant de fois que nécessaire depuis votre espace personnel.' },
    { question: 'Quels types de travaux sont couverts ?', answer: 'Piscines, extensions, garages, carports, vérandas, terrasses, clôtures, portails, abris de jardin, modifications de façade, et bien plus encore.' },
];

function LandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGetStarted = () => {
        navigate('/auth/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Updated Navigation from slide2.html style */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease-in-out',
                    py: scrolled ? 1 : 1.5,
                    fontFamily: 'var(--font-display)',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ px: { xs: 0 }, justifyContent: 'space-between' }}>
                        {/* Logo and Brand */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/')}
                        >
                            <Box
                                component="img"
                                src={logoUrbania}
                                alt="Urbania Logo"
                                sx={{
                                    height: { xs: 80, md: 120 }, // Increased logo size
                                    width: 'auto',
                                    filter: 'drop-shadow(0 0 10px rgba(0, 35, 149, 0.3))'
                                }}
                            />
                        </Box>

                        {/* Navigation Links */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 6, ml: 4 }}>
                                <Typography
                                    component="a"
                                    href="#features"
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Fonctionnalités
                                </Typography>
                                <Typography
                                    component="a"
                                    href="#how-it-works"
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Processus
                                </Typography>
                                <Typography
                                    component="a"
                                    href="#faq"
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    FAQ
                                </Typography>
                            </Box>
                        )}

                        {/* Auth Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {!isMobile ? (
                                <>
                                    <Button
                                        onClick={() => navigate('/auth/login')}
                                        sx={{
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-display)',
                                            textTransform: 'none',
                                            fontSize: '0.9rem',
                                            px: 3,
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                                        }}
                                    >
                                        Connexion
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleGetStarted}
                                        sx={{
                                            bgcolor: 'var(--header-primary)',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-display)',
                                            borderRadius: '8px',
                                            px: 4,
                                            textTransform: 'none',
                                            fontSize: '0.9rem',
                                            boxShadow: '0 4px 14px rgba(0, 35, 149, 0.3)',
                                            '&:hover': {
                                                bgcolor: '#001a70',
                                                boxShadow: '0 6px 20px rgba(0, 35, 149, 0.4)',
                                                transform: 'translateY(-1px)',
                                            }
                                        }}
                                    >
                                        Commencer
                                    </Button>
                                </>
                            ) : (
                                <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: 'text.primary' }}>
                                    <MenuIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Menu */}
            <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                <Box sx={{ width: 280, p: 2 }}>
                    <List>
                        <ListItem button onClick={() => { setMobileMenuOpen(false); }}>
                            <ListItemText primary="Fonctionnalités" />
                        </ListItem>
                        <ListItem button onClick={() => { setMobileMenuOpen(false); }}>
                            <ListItemText primary="Comment ça marche" />
                        </ListItem>
                        <ListItem button onClick={() => { setMobileMenuOpen(false); }}>
                            <ListItemText primary="FAQ" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }}>
                            <ListItemText primary="Connexion" />
                        </ListItem>
                    </List>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }}
                        sx={{ mt: 2, background: 'linear-gradient(135deg, #002395 0%, #3b5fc4 100%)' }}
                    >
                        Commencer
                    </Button>
                </Box>
            </Drawer>

            {/* Hero Section */}
            <Box
                sx={{
                    pt: { xs: 12, md: 16 },
                    pb: { xs: 8, md: 12 },
                    background: 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(0, 35, 149, 0.1) 0%, transparent 70%)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(0, 35, 149, 0.08) 0%, transparent 70%)',
                    }}
                />

                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    mb: 3,
                                }}
                            >
                                Automatisez vos{' '}
                                <Box component="span" sx={{ color: 'secondary.main' }}>
                                    démarches d'urbanisme
                                </Box>{' '}
                                grâce à l'IA
                            </Typography>
                            <Typography
                                variant="h5"
                                color="text.secondary"
                                sx={{ fontWeight: 400, mb: 4, lineHeight: 1.6 }}
                            >
                                Générez automatiquement votre dossier de Déclaration Préalable complet,
                                CERFA 13703 inclus, en quelques minutes seulement.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={handleGetStarted}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #002395 0%, #3b5fc4 100%)',
                                        boxShadow: '0 8px 24px rgba(0, 35, 149, 0.35)',
                                        '&:hover': {
                                            boxShadow: '0 12px 32px rgba(0, 35, 149, 0.45)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Générer mon dossier
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<PlayArrowIcon />}
                                    sx={{ py: 1.5, px: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                >
                                    Voir la démo
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {[
                                    '✓ CERFA pré-rempli',
                                    '✓ Conforme PLU',
                                    '✓ Prêt au dépôt',
                                ].map((item) => (
                                    <Typography key={item} variant="body2" color="text.secondary" fontWeight={500}>
                                        {item}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    height: { xs: 400, md: 500 },
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <ModernCarousel />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" fontWeight={700} gutterBottom>
                            Pourquoi choisir Urbania ?
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            La solution la plus simple et rapide pour vos démarches d'urbanisme en France.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: 'secondary.main',
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 16px 40px rgba(0, 35, 149, 0.15)',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            bgcolor: 'rgba(0, 35, 149, 0.1)',
                                            color: 'primary.main',
                                            mb: 2,
                                        }}
                                    >
                                        {feature.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                                        {feature.description}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* How it works */}
            <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" fontWeight={700} gutterBottom>
                            Comment ça marche ?
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            3 étapes simples pour obtenir votre dossier complet
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {steps.map((step, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: '5rem',
                                            fontWeight: 800,
                                            color: 'rgba(0, 35, 149, 0.15)',
                                            mb: -3,
                                        }}
                                    >
                                        {step.number}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} gutterBottom>
                                        {step.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                                        {step.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleGetStarted}
                            sx={{
                                py: 1.5,
                                px: 4,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #002395 0%, #3b5fc4 100%)',
                                boxShadow: '0 8px 24px rgba(0, 35, 149, 0.35)',
                            }}
                        >
                            Commencer maintenant
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* FAQ */}
            <Box id="faq" sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h2" fontWeight={700} gutterBottom>
                            Questions fréquentes
                        </Typography>
                    </Box>

                    {faqItems.map((item, index) => (
                        <Accordion
                            key={index}
                            elevation={0}
                            sx={{
                                mb: 2,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: '12px !important',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': { margin: '0 0 16px 0' },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={600}>{item.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary" lineHeight={1.7}>
                                    {item.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'primary.main' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Prêt à simplifier vos démarches ?
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                            Rejoignez des milliers d'utilisateurs qui font confiance à Urbania.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleGetStarted}
                            sx={{
                                py: 1.5,
                                px: 5,
                                fontSize: '1.1rem',
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                },
                            }}
                        >
                            Générer mon dossier gratuitement
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 4, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                component="img"
                                src={logoUrbania}
                                alt="Urbania"
                                sx={{ height: 24, width: 'auto' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                © 2026 Urbania. Tous droits réservés.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                Mentions légales
                            </Typography>
                            <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                Confidentialité
                            </Typography>
                            <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                CGU
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}

export default LandingPage;

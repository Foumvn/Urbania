import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Divider,
    Avatar,
    Button,
    Chip,
    alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { useForm } from '../../context/FormContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';

const drawerWidth = 280;

const wizardSteps = [
    { label: 'Votre qualité', step: 0 },
    { label: 'Identité', step: 1 },
    { label: 'Coordonnées', step: 2 },
    { label: 'Terrain', step: 3 },
    { label: 'Nature des travaux', step: 4 },
    { label: 'Description', step: 5 },
    { label: 'Surfaces', step: 6 },
    { label: 'Pièces jointes', step: 7 },
    { label: 'Engagements', step: 8 },
    { label: 'Plan cadastral', step: 9 },
    { label: 'Récapitulatif', step: 10 },
];



function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { currentStep, getProgress, goToStep, reset } = useForm();
    const { user, isAdmin, logout } = useAuth();
    const { t } = useI18n();

    const isWizardPage = location.pathname === '/formulaire';
    const isAdminPage = location.pathname === '/admin';
    const progress = getProgress();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleStepClick = (step) => {
        if (step <= currentStep) {
            goToStep(step);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStepIcon = (step) => {
        if (step < currentStep) {
            return <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />;
        } else if (step === currentStep) {
            return <PlayCircleFilledIcon sx={{ fontSize: 20, color: 'secondary.main' }} />;
        }
        return <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />;
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            {/* Logo */}
            <Box sx={{ p: 4, pb: 2, textAlign: 'center' }}>
                <Box
                    component="img"
                    src="/logo.png"
                    alt="Urbania Logo"
                    sx={{
                        width: '100%',
                        maxWidth: 140,
                        height: 'auto',
                        cursor: 'pointer',
                        mb: 1
                    }}
                    onClick={() => navigate('/dashboard')}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', opacity: 0.8, fontWeight: 500, letterSpacing: '0.05em' }}>
                    CERFA Builder
                </Typography>
            </Box>

            <Divider />

            {/* Navigation Links */}
            <List sx={{ py: 1.5, px: 1.5 }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => navigate('/dashboard')}
                        selected={location.pathname === '/dashboard'}
                        sx={{ borderRadius: 2, py: 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('nav.dashboard')} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => {
                            reset();
                            navigate('/formulaire');
                        }}
                        selected={isWizardPage}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '& .MuiListItemIcon-root': { color: 'white' },
                                '&:hover': { backgroundColor: 'primary.dark' },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('nav.form')} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                {isAdmin && (
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => navigate('/admin')}
                            selected={isAdminPage}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                    '&:hover': { backgroundColor: 'primary.dark' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary={t('nav.admin')} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>
                )}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => navigate('/profile')}
                        selected={location.pathname === '/profile'}
                        sx={{ borderRadius: 2, py: 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('nav.profile')} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => navigate('/settings')}
                        selected={location.pathname === '/settings'}
                        sx={{ borderRadius: 2, py: 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('nav.settings')} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider />

            {/* Wizard Steps */}
            {isWizardPage && (
                <Box sx={{ px: 2, py: 2.5, flex: 1, overflow: 'auto' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ px: 1, mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Étapes du formulaire
                    </Typography>
                    <List sx={{ py: 0 }}>
                        {wizardSteps.map((item, index) => {
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;
                            const isClickable = index <= currentStep;

                            return (
                                <ListItem key={item.step} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => isClickable && handleStepClick(item.step)}
                                        disabled={!isClickable}
                                        sx={{
                                            py: 1,
                                            px: 1.5,
                                            borderRadius: 2,
                                            minHeight: 44,
                                            cursor: isClickable ? 'pointer' : 'default',
                                            bgcolor: isCurrent ? 'rgba(88, 61, 161, 0.08)' : 'transparent',
                                            borderLeft: isCurrent ? '3px solid' : '3px solid transparent',
                                            borderColor: isCurrent ? 'secondary.main' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isClickable
                                                    ? isCurrent
                                                        ? 'rgba(88, 61, 161, 0.12)'
                                                        : 'action.hover'
                                                    : 'transparent',
                                            },
                                            '&.Mui-disabled': {
                                                opacity: 0.5,
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {getStepIcon(index)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(`wizard.step${index + 1}.title`) || item.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.875rem',
                                                fontWeight: isCurrent ? 600 : isCompleted ? 500 : 400,
                                                color: isCurrent ? 'secondary.main' : isCompleted ? 'text.primary' : 'text.secondary',
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            )}

            <Box sx={{ mt: 'auto' }}>
                {/* Progress */}
                {isWizardPage && (
                    <Box sx={{ px: 3, py: 2, bgcolor: 'rgba(39, 174, 96, 0.04)', borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Complétion du CERFA
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'divider',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)',
                                    },
                                }}
                            />
                            <Typography variant="body2" fontWeight={700} color="success.main" sx={{ minWidth: 40 }}>
                                {progress}%
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* User */}
                {user && (
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {user.prenom?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {user.first_name} {user.last_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {isAdmin ? 'Administrateur' : 'Client'}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            size="small"
                        >
                            {t('auth.logout')}
                        </Button>
                    </Box>
                )}

                {/* Footer */}
                <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.disabled">
                        Version 1.0.0 • © 2026 Urbania
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Mobile header */}
            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1100,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(8px)',
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton onClick={handleDrawerToggle} size="small" sx={{ color: 'primary.main' }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: '1.1rem' }}>
                            Urbania
                        </Typography>
                    </Box>
                    {isWizardPage && (
                        <Chip
                            label={`${progress}%`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 700, height: 24 }}
                        />
                    )}
                </Box>
            )}

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    pt: { xs: 8, md: 0 },
                }}
            >
                {children || <Outlet />}
            </Box>
        </Box>
    );
}

export default Layout;

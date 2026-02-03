import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CardActionArea,
    Tabs,
    Tab,
    Divider,
    Button,
    Chip,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    LinearProgress,
    Badge,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Import sub-components
import SessionsManager from './SessionsManager';
import StatsPanel from './StatsPanel';
import SettingsPanel from './SettingsPanel';
import ActivityLog from './ActivityLog';
import UserManager from './UserManager';
import NotificationCenter from './NotificationCenter';

import { useNotification } from '../../context/NotificationContext';

function AdminDashboard() {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const lastNotifIdRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const pollInterval = setInterval(() => {
            fetchNotifications(true);
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        fetchNotifications(false);

        try {
            const token = localStorage.getItem('urbania_token');
            const response = await fetch('/api/stats/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
            // Mock data fallback
            setStats({
                total: 156,
                completed: 89,
                inProgress: 45,
                abandoned: 22,
                todayNew: 12,
                weeklyGrowth: 23,
                byType: { particulier: 112, personne_morale: 44 },
                byNature: { piscine: 34, extension: 28, garage: 22, cloture: 18, autre: 54 },
            });
        }

        // Fetch recent activity
        try {
            const token = localStorage.getItem('urbania_token');
            const actResponse = await fetch('/api/activity/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (actResponse.ok) {
                const actData = await actResponse.json();
                // Map API activity to dashboard format
                const mappedActivity = actData.slice(0, 5).map(a => ({
                    id: a.id,
                    type: a.activity_type,
                    user: a.username || 'Utilisateur',
                    time: formatTime(a.timestamp),
                    status: getActivityStatus(a.activity_type)
                }));
                setRecentActivity(mappedActivity);
            }
        } catch (err) {
            console.error('Erreur activité:', err);
        }

        setLoading(false);
    };

    const fetchNotifications = async (isPoll = false) => {
        try {
            const token = localStorage.getItem('urbania_token');
            const response = await fetch('/api/admin/notifications/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                // If polling and we have new notifications
                if (isPoll && data.length > 0) {
                    const latest = data[0];
                    if (latest.id !== lastNotifIdRef.current) {
                        showNotification(`${latest.title} : ${latest.message}`, 'info');
                        lastNotifIdRef.current = latest.id;
                    }
                } else if (!isPoll && data.length > 0) {
                    lastNotifIdRef.current = data[0].id;
                }

                setNotifications(data);
            }
        } catch (error) {
            console.error('Erreur notifications:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('urbania_token');
            await fetch('/api/admin/notifications/mark-read/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Erreur mark read:', error);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours}h`;
        return date.toLocaleDateString('fr-FR');
    };

    const getActivityStatus = (type) => {
        if (type.includes('created')) return 'new';
        if (type.includes('completed')) return 'completed';
        if (type.includes('abandoned')) return 'abandoned';
        return 'in_progress';
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(30, 58, 95, 0.1)',
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color={`${color}.main`}>
                            {value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                                {trend === 'up' ? (
                                    <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                ) : (
                                    <TrendingDownIcon sx={{ fontSize: 18, color: 'error.main' }} />
                                )}
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color={trend === 'up' ? 'success.main' : 'error.main'}
                                >
                                    {trendValue}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${color}.50`,
                            color: `${color}.main`,
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const QuickAction = ({ title, description, icon, color, onClick }) => (
        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: `${color}.main`,
                    bgcolor: `${color}.50`,
                },
            }}
        >
            <CardActionArea onClick={onClick} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: `${color}.main`,
                            color: 'white',
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                </Box>
            </CardActionArea>
        </Card>
    );

    const getActivityIcon = (type) => {
        switch (type) {
            case 'session_created': return <AddIcon />;
            case 'pdf_generated': return <DescriptionIcon />;
            case 'session_updated': return <PendingIcon />;
            case 'session_abandoned': return <ErrorIcon />;
            default: return <HistoryIcon />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'info';
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'abandoned': return 'error';
            default: return 'default';
        }
    };

    const renderOverview = () => (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total des sessions"
                        value={stats?.total || 0}
                        icon={<StorageIcon />}
                        color="primary"
                        trend="up"
                        trendValue="+12% cette semaine"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Terminées"
                        value={stats?.completed || 0}
                        icon={<CheckCircleIcon />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="En cours"
                        value={stats?.inProgress || 0}
                        icon={<PendingIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Aujourd'hui"
                        value={stats?.todayNew || 0}
                        icon={<TrendingUpIcon />}
                        color="info"
                        trend="up"
                        trendValue="Nouvelles sessions"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Actions rapides
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <QuickAction
                                title="Nouvelle session"
                                description="Créer une déclaration"
                                icon={<AddIcon fontSize="small" />}
                                color="primary"
                                onClick={() => window.location.href = '/formulaire'}
                            />
                            <QuickAction
                                title="Exporter les données"
                                description="CSV ou JSON"
                                icon={<DownloadIcon fontSize="small" />}
                                color="secondary"
                                onClick={() => { }}
                            />
                            <QuickAction
                                title="Voir les statistiques"
                                description="Analyses détaillées"
                                icon={<TimelineIcon fontSize="small" />}
                                color="info"
                                onClick={() => setActiveTab(2)}
                            />
                            <QuickAction
                                title="Paramètres"
                                description="Configuration du site"
                                icon={<SettingsIcon fontSize="small" />}
                                color="success"
                                onClick={() => setActiveTab(3)}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Activité récente
                            </Typography>
                            <IconButton size="small" onClick={fetchDashboardData}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <List sx={{ py: 0 }}>
                            {recentActivity.map((activity, index) => (
                                <ListItem key={activity.id} sx={{ px: 0, py: 1 }} divider={index < recentActivity.length - 1}>
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: `${getStatusColor(activity.status)}.50`,
                                                color: `${getStatusColor(activity.status)}.main`,
                                            }}
                                        >
                                            {getActivityIcon(activity.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={activity.user}
                                        secondary={activity.time}
                                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                    />
                                    <Chip
                                        label={activity.status.replace('_', ' ')}
                                        size="small"
                                        color={getStatusColor(activity.status)}
                                        sx={{ fontSize: '0.65rem', height: 22 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Button fullWidth sx={{ mt: 2 }} onClick={() => setActiveTab(4)}>
                            Voir tout l'historique
                        </Button>
                    </Paper>
                </Grid>

                {/* Distribution */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Répartition par type
                        </Typography>

                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>Particuliers</Typography>
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                        {stats?.byType?.particulier || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats ? (stats.byType.particulier / stats.total) * 100 : 0}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'primary.main',
                                            borderRadius: 5,
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>Personnes morales</Typography>
                                    <Typography variant="body2" fontWeight={700} color="secondary.main">
                                        {stats?.byType?.personne_morale || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats ? (stats.byType.personne_morale / stats.total) * 100 : 0}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'secondary.main',
                                            borderRadius: 5,
                                        },
                                    }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Top travaux demandés
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {stats?.byNature && Object.entries(stats.byNature)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([key, value]) => (
                                        <Chip
                                            key={key}
                                            label={`${key}: ${value}`}
                                            size="small"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    ))
                                }
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );

    const tabs = [
        { label: 'Vue d\'ensemble', icon: <DashboardIcon />, component: renderOverview },
        { label: 'Sessions', icon: <DescriptionIcon />, component: () => <SessionsManager /> },
        { label: 'Utilisateurs', icon: <PeopleIcon />, component: () => <UserManager /> },
        { label: 'Statistiques', icon: <TimelineIcon />, component: () => <StatsPanel /> },
        { label: 'Paramètres', icon: <SettingsIcon />, component: () => <SettingsPanel /> },
        { label: 'Activité', icon: <HistoryIcon />, component: () => <ActivityLog /> },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 2.5, md: 3 },
                    px: { xs: 2, md: 4 },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                            Administration
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                            Urbania CERFA Builder • Tableau de bord
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                        <NotificationCenter
                            notifications={notifications}
                            onMarkAllRead={handleMarkAllRead}
                            onRefresh={fetchNotifications}
                        />
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={fetchDashboardData}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                                px: 2
                            }}
                        >
                            Actualiser
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: { xs: 0, md: 4 } }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            minHeight: { xs: 48, md: 56 },
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: { xs: '0.85rem', md: '0.9375rem' },
                            minWidth: { xs: 'auto', md: 160 }
                        },
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
                {loading ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Chargement des données...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {activeTab === 0 && renderOverview()}
                        {activeTab === 1 && <SessionsManager />}
                        {activeTab === 2 && <UserManager />}
                        {activeTab === 3 && <StatsPanel />}
                        {activeTab === 4 && <SettingsPanel />}
                        {activeTab === 5 && <ActivityLog />}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default AdminDashboard;

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

function StatsPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodTab, setPeriodTab] = useState(0);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('urbania_token');
            const response = await fetch(`${API_BASE}/stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Erreur stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const travauxLabels = {
        piscine: 'Piscine',
        extension: 'Extension',
        garage: 'Garage / Carport',
        cloture: 'Clôture / Portail',
        veranda: 'Véranda',
        terrasse: 'Terrasse',
        abri_jardin: 'Abri de jardin',
        autre: 'Autre',
    };

    if (loading) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
            </Box>
        );
    }

    const maxNature = Math.max(...Object.values(stats?.byNature || { a: 1 }));

    return (
        <Box>
            {/* Period Tabs */}
            <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Tabs value={periodTab} onChange={(e, v) => setPeriodTab(v)}>
                    <Tab label="Cette semaine" />
                    <Tab label="Ce mois" />
                    <Tab label="Cette année" />
                    <Tab label="Tout" />
                </Tabs>
            </Paper>

            <Grid container spacing={3}>
                {/* Conversion Rate */}
                <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Taux de complétion
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h2" fontWeight={700} color="success.main">
                                    {stats ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                    <TrendingUpIcon fontSize="small" />
                                    <Typography variant="caption" fontWeight={600}>+5%</Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {stats?.completed || 0} terminées sur {stats?.total || 0} sessions
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats ? (stats.completed / stats.total) * 100 : 0}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'success.main',
                                            borderRadius: 6,
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Abandonment Rate */}
                <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Taux d'abandon
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h2" fontWeight={700} color="error.main">
                                    {stats ? Math.round((stats.abandoned / stats.total) * 100) : 0}%
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                                    <TrendingDownIcon fontSize="small" />
                                    <Typography variant="caption" fontWeight={600}>-2%</Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {stats?.abandoned || 0} sessions abandonnées
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats ? (stats.abandoned / stats.total) * 100 : 0}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'error.main',
                                            borderRadius: 6,
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* In Progress */}
                <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Sessions en cours
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h2" fontWeight={700} color="warning.main">
                                    {stats?.inProgress || 0}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {stats ? Math.round((stats.inProgress / stats.total) * 100) : 0}% du total
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats ? (stats.inProgress / stats.total) * 100 : 0}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: 'grey.100',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'warning.main',
                                            borderRadius: 6,
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Weekly Chart (simplified bar chart) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Activité hebdomadaire
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200, mt: 3 }}>
                            {stats?.weekly?.map((day, index) => (
                                <Box key={day.day} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" fontWeight={600} color="primary.main">
                                        {day.count}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: `${(day.count / 25) * 150}px`,
                                            minHeight: 8,
                                            bgcolor: index === 3 ? 'primary.main' : 'primary.light',
                                            borderRadius: 1,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: 'primary.main',
                                                transform: 'scaleY(1.05)',
                                            },
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {day.day}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Nature des travaux */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Nature des travaux
                        </Typography>
                        <TableContainer sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Répartition</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats?.byNature && Object.entries(stats.byNature)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {travauxLabels[key] || key}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={value} size="small" />
                                                </TableCell>
                                                <TableCell sx={{ width: '50%' }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(value / maxNature) * 100}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: 'grey.100',
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Type distribution */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Répartition par type de déclarant
                        </Typography>
                        <Grid container spacing={4} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h1" fontWeight={700} color="primary.main">
                                        {stats?.byType?.particulier || 0}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        Particuliers
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stats ? Math.round((stats.byType.particulier / stats.total) * 100) : 0}% du total
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats ? (stats.byType.particulier / stats.total) * 100 : 0}
                                        sx={{ mt: 2, height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h1" fontWeight={700} color="secondary.main">
                                        {stats?.byType?.personne_morale || 0}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        Personnes morales
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stats ? Math.round((stats.byType.personne_morale / stats.total) * 100) : 0}% du total
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats ? (stats.byType.personne_morale / stats.total) * 100 : 0}
                                        color="secondary"
                                        sx={{ mt: 2, height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default StatsPanel;

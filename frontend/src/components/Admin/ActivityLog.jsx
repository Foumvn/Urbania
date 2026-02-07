import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    Button,
    IconButton,
    Tabs,
    Tab,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import ErrorIcon from '@mui/icons-material/Error';

const activityTypes = {
    session_created: { label: 'Session créée', color: 'info', icon: <PersonAddIcon fontSize="small" /> },
    session_updated: { label: 'Session modifiée', color: 'default', icon: <EditIcon fontSize="small" /> },
    session_completed: { label: 'Session terminée', color: 'success', icon: <VisibilityIcon fontSize="small" /> },
    session_abandoned: { label: 'Session abandonnée', color: 'error', icon: <DeleteIcon fontSize="small" /> },
    pdf_generated: { label: 'PDF généré', color: 'primary', icon: <PictureAsPdfIcon fontSize="small" /> },
    pdf_downloaded: { label: 'PDF téléchargé', color: 'secondary', icon: <DownloadIcon fontSize="small" /> },
    admin_login: { label: 'Connexion admin', color: 'warning', icon: <LoginIcon fontSize="small" /> },
    admin_logout: { label: 'Déconnexion admin', color: 'warning', icon: <LogoutIcon fontSize="small" /> },
    settings_changed: { label: 'Paramètres modifiés', color: 'default', icon: <SettingsIcon fontSize="small" /> },
    error: { label: 'Erreur', color: 'error', icon: <ErrorIcon fontSize="small" /> },
};

function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/activity/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const mappedData = data.map(a => ({
                    id: a.id,
                    type: a.activity_type,
                    user: a.username,
                    email: a.email,
                    ip: a.ip_address,
                    details: a.details,
                    timestamp: a.timestamp,
                }));
                setActivities(mappedData);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredActivities.map(a => ({
            Date: new Date(a.timestamp).toLocaleString('fr-FR'),
            Type: activityTypes[a.type]?.label || a.type,
            Utilisateur: a.user,
            Email: a.email || '-',
            IP: a.ip,
            Détails: a.details,
            Session: a.sessionId || '-',
        }));

        const headers = Object.keys(dataToExport[0] || {});
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => headers.map(h => `"${row[h]}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch =
            activity.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.sessionId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || activity.type === typeFilter;

        const matchesTab =
            tabValue === 0 || // All
            (tabValue === 1 && ['session_created', 'session_updated', 'session_completed', 'session_abandoned'].includes(activity.type)) ||
            (tabValue === 2 && ['pdf_generated', 'pdf_downloaded'].includes(activity.type)) ||
            (tabValue === 3 && ['admin_login', 'admin_logout', 'settings_changed'].includes(activity.type)) ||
            (tabValue === 4 && activity.type === 'error');

        return matchesSearch && matchesType && matchesTab;
    });

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <Box>
            {/* Tabs */}
            <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="Tout" />
                    <Tab label="Sessions" />
                    <Tab label="PDF" />
                    <Tab label="Admin" />
                    <Tab label="Erreurs" />
                </Tabs>
            </Paper>

            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                {/* Toolbar */}
                <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        placeholder="Rechercher..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: { xs: '1 1 auto', sm: '0 1 250px' }, width: { xs: '100%', sm: 'auto' } }}
                    />

                    <FormControl size="small" sx={{ flex: { xs: 1, sm: '0 1 150px' }, width: { xs: '100%', sm: 'auto' } }}>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">Tous les types</MenuItem>
                            {Object.entries(activityTypes).map(([key, value]) => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {value.icon}
                                        {value.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ flex: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'block' } }} />

                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                            size="small"
                        >
                            Exporter
                        </Button>

                        <IconButton onClick={fetchActivities} size="small">
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                    <Table stickyHeader sx={{ minWidth: 1000 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date/Heure</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Utilisateur</TableCell>
                                <TableCell>Détails</TableCell>
                                <TableCell>Session</TableCell>
                                <TableCell>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredActivities
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((activity) => {
                                    const typeConfig = activityTypes[activity.type] || { label: activity.type, color: 'default' };

                                    return (
                                        <TableRow key={activity.id} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {formatTime(activity.timestamp)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={typeConfig.icon}
                                                    label={typeConfig.label}
                                                    color={typeConfig.color}
                                                    size="small"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                        {activity.user?.charAt(0) || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {activity.user}
                                                        </Typography>
                                                        {activity.email && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {activity.email}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {activity.details}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {activity.sessionId ? (
                                                    <Typography variant="body2" fontFamily="monospace" color="primary">
                                                        {String(activity.sessionId).substring(0, 12)}...
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                                                    {activity.ip}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {filteredActivities.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Aucune activité trouvée
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredActivities.length}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Lignes par page"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                />
            </Paper>
        </Box>
    );
}

export default ActivityLog;

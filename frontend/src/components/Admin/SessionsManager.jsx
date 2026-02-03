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
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    Checkbox,
    Toolbar,
    Tooltip,
    LinearProgress,
    Alert,
    Grid,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

function SessionsManager() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterAnchor, setFilterAnchor] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('urbania_token');
            const response = await fetch('/api/admin/sessions/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sessionId) => {
        try {
            await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
            setSessions(sessions.filter(s => s.id !== sessionId));
            setDeleteDialogOpen(false);
            setSessionToDelete(null);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleBulkDelete = async () => {
        for (const id of selected) {
            await handleDelete(id);
        }
        setSelected([]);
    };

    const handleExport = (format) => {
        const dataToExport = selected.length > 0
            ? sessions.filter(s => selected.includes(s.id))
            : sessions;

        if (format === 'csv') {
            const headers = ['ID', 'Type', 'Nom', 'Email', 'Ville', 'Statut', 'Créé le'];
            const rows = dataToExport.map(s => [
                s.id,
                s.data?.typeDeclarant,
                s.data?.nom || s.data?.denomination,
                s.data?.email,
                s.data?.terrainVille,
                s.status || 'in_progress',
                new Date(s.created_at || s.createdAt || Date.now()).toLocaleDateString('fr-FR'),
            ]);

            const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sessions_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sessions_export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }
    };

    const filteredSessions = sessions.filter(session => {
        const idStr = String(session.id || '');
        const matchesSearch =
            (session.data?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.data?.denomination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.data?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            idStr.toLowerCase().includes(searchTerm.toLowerCase());

        const currentStatus = session.status || 'in_progress';
        const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusChip = (status) => {
        const currentStatus = status || 'in_progress';
        const configs = {
            completed: { label: 'Terminé', color: 'success', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
            in_progress: { label: 'En cours', color: 'warning', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
            abandoned: { label: 'Abandonné', color: 'error', icon: <ErrorIcon sx={{ fontSize: 14 }} /> },
        };
        const config = configs[currentStatus] || configs.in_progress;
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                icon={config.icon}
                sx={{ fontWeight: 500 }}
            />
        );
    };

    const getDeclarantName = (data) => {
        if (data?.typeDeclarant === 'particulier') {
            return `${data?.prenom || ''} ${data?.nom || ''}`.trim() || 'Non renseigné';
        }
        return data?.denomination || 'Non renseigné';
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(filteredSessions.map(s => s.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    return (
        <Box>
            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
                {/* Toolbar */}
                <Toolbar sx={{ px: 3, py: { xs: 1.5, sm: 2 }, gap: 1.5, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
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
                        sx={{ flex: { xs: '1 1 auto', sm: '0 1 300px' } }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={(e) => setFilterAnchor(e.currentTarget)}
                            sx={{ borderColor: 'divider', flex: { xs: 1, sm: 'none' } }}
                        >
                            Filtrer
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport('csv')}
                            sx={{ flex: { xs: 1, sm: 'none' } }}
                        >
                            Exporter
                        </Button>
                    </Box>

                    <Menu
                        anchorEl={filterAnchor}
                        open={Boolean(filterAnchor)}
                        onClose={() => setFilterAnchor(null)}
                    >
                        <MenuItem onClick={() => { setStatusFilter('all'); setFilterAnchor(null); }}>
                            Tous les statuts
                        </MenuItem>
                        <MenuItem onClick={() => { setStatusFilter('completed'); setFilterAnchor(null); }}>
                            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" />
                            Terminées
                        </MenuItem>
                        <MenuItem onClick={() => { setStatusFilter('in_progress'); setFilterAnchor(null); }}>
                            <PendingIcon sx={{ mr: 1, color: 'warning.main' }} fontSize="small" />
                            En cours
                        </MenuItem>
                        <MenuItem onClick={() => { setStatusFilter('abandoned'); setFilterAnchor(null); }}>
                            <ErrorIcon sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
                            Abandonnées
                        </MenuItem>
                    </Menu>

                    <Box sx={{ flex: 1 }} />

                    {selected.length > 0 && (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {selected.length} sélectionné(s)
                            </Typography>
                            <Button
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Supprimer
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                    >
                        Exporter CSV
                    </Button>

                    <IconButton onClick={fetchSessions}>
                        <RefreshIcon />
                    </IconButton>
                </Toolbar>

                <Divider />

                {loading ? (
                    <LinearProgress />
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                            <Table stickyHeader sx={{ minWidth: 1000 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < filteredSessions.length}
                                                checked={filteredSessions.length > 0 && selected.length === filteredSessions.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>Déclarant</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Ville terrain</TableCell>
                                        <TableCell>Progression</TableCell>
                                        <TableCell>Statut</TableCell>
                                        <TableCell>Dernière MàJ</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSessions
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((session) => {
                                            const isItemSelected = isSelected(session.id);

                                            return (
                                                <TableRow
                                                    key={session.id}
                                                    hover
                                                    selected={isItemSelected}
                                                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isItemSelected}
                                                            onChange={() => handleSelect(session.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            {session.data?.typeDeclarant === 'particulier' ? (
                                                                <PersonIcon color="action" fontSize="small" />
                                                            ) : (
                                                                <BusinessIcon color="action" fontSize="small" />
                                                            )}
                                                            <Box>
                                                                <Typography fontWeight={500} fontSize="0.875rem">
                                                                    {getDeclarantName(session.data)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                                    {String(session.id || '').substring(0, 16)}...
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={session.data?.typeDeclarant === 'particulier' ? 'Particulier' : 'Pers. morale'}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.75rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{session.data?.email || '-'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{session.data?.terrainVille || '-'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={(((session.current_step ?? session.currentStep ?? 0) + 1) / 11) * 100}
                                                                sx={{ width: 60, height: 6, borderRadius: 3 }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {(session.current_step ?? session.currentStep ?? 0) + 1}/11
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{getStatusChip(session.status)}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(session.updated_at || session.updatedAt || Date.now()).toLocaleDateString('fr-FR')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Voir détails">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { setSelectedSession(session); setDetailOpen(true); }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Télécharger PDF">
                                                            <IconButton size="small" color="primary">
                                                                <DownloadIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Supprimer">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => { setSessionToDelete(session); setDeleteDialogOpen(true); }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {filteredSessions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">
                                                    Aucune session trouvée
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={filteredSessions.length}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Lignes par page"
                            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                        />
                    </>
                )}
            </Paper>

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight={700}>Détails de la session</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {selectedSession?.id}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedSession && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Informations déclarant
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Type</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {selectedSession.data?.typeDeclarant}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Nom</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {getDeclarantName(selectedSession.data)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Email</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {selectedSession.data?.email || '-'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Statut & Progression
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">Statut</Typography>
                                            {getStatusChip(selectedSession.status)}
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Étape</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {(selectedSession.current_step ?? selectedSession.currentStep ?? 0) + 1} / 11
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Créé le</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {new Date(selectedSession.created_at || selectedSession.createdAt || Date.now()).toLocaleString('fr-FR')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Données brutes (JSON)
                                </Typography>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'grey.50',
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    }}
                                >
                                    <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                        {JSON.stringify(selectedSession.data, null, 2)}
                                    </pre>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />}>
                        Télécharger PDF
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Cette action est irréversible.
                    </Alert>
                    <Typography>
                        Voulez-vous vraiment supprimer {selected.length > 1 ? `${selected.length} sessions` : 'cette session'} ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => selected.length > 0 ? handleBulkDelete() : handleDelete(sessionToDelete?.id)}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SessionsManager;

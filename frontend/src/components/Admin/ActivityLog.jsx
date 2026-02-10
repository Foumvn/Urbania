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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Elegant Tab Switcher */}
            <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100 w-fit flex gap-1 overflow-x-auto max-w-full">
                {['Tout', 'Sessions', 'PDF', 'Admin', 'Erreurs'].map((label, idx) => (
                    <button
                        key={idx}
                        onClick={() => setTabValue(idx)}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tabValue === idx ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                {/* Modern Search & Filter Bar */}
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-white">
                    <div className="flex flex-col md:flex-row flex-grow gap-4 max-w-2xl">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-slate-400" fontSize="small" />
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrer l'activité par utilisateur, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 pr-12 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            >
                                <option value="all">Filtre d'événement</option>
                                {Object.entries(activityTypes).map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <FilterListIcon fontSize="small" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 text-slate-700 rounded-2xl text-sm font-black border border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all active:scale-95"
                        >
                            <DownloadIcon fontSize="small" />
                            <span>Exporter</span>
                        </button>
                        <button
                            onClick={fetchActivities}
                            disabled={loading}
                            className="p-3.5 bg-[#0f172a] text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <RefreshIcon fontSize="small" className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto min-h-[400px]">
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>Temporalité</TableCell>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>Action</TableCell>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>Utilisateur</TableCell>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>Détails</TableCell>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>Session</TableCell>
                                <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', p: 3, borderBottom: '1px solid #f1f5f9' }}>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ py: 12 }}>
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronisation des logs...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredActivities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ py: 12 }}>
                                        <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                                            <FilterListIcon sx={{ fontSize: 48 }} />
                                            <p className="font-bold">Aucune activité trouvée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredActivities
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((activity) => {
                                        const typeConfig = activityTypes[activity.type] || { label: activity.type, color: 'default' };
                                        return (
                                            <TableRow key={activity.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' }, '& td': { borderBottom: '1px solid #f8fafc' } }}>
                                                <TableCell sx={{ p: 3 }}>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-black text-slate-900">{formatTime(activity.timestamp)}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase">{new Date(activity.timestamp).toLocaleTimeString('fr-FR')}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ p: 3 }}>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider
                                                        ${activity.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            activity.type === 'session_completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                activity.type === 'pdf_generated' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    'bg-slate-50 text-slate-600 border-slate-100'}`}
                                                    >
                                                        {typeConfig.icon}
                                                        {typeConfig.label}
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ p: 3 }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">
                                                            {activity.user?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{activity.user}</p>
                                                            {activity.email && <p className="text-[10px] text-slate-400 font-medium">{activity.email}</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ p: 3 }}>
                                                    <p className="text-sm text-slate-600 font-medium max-w-[300px] truncate" title={activity.details}>
                                                        {activity.details}
                                                    </p>
                                                </TableCell>
                                                <TableCell sx={{ p: 3 }}>
                                                    {activity.sessionId ? (
                                                        <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                            <p className="text-[10px] font-black font-mono text-slate-500">
                                                                {String(activity.sessionId).substring(0, 8)}...
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ p: 3 }}>
                                                    <p className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">
                                                        {activity.ip}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        Page {page + 1} • {filteredActivities.length} logs au total
                    </p>
                    <TablePagination
                        component="div"
                        count={filteredActivities.length}
                        page={page}
                        onPageChange={(e, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[25, 50, 100]}
                        labelRowsPerPage=""
                        sx={{ borderBottom: 0, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' } }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ActivityLog;

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Avatar,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

function UserManager() {
    const { user: currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [tab, setTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const roles = ['client', 'admin'];

    useEffect(() => {
        fetchUsers();
    }, [tab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/admin/users/?role=${roles[tab]}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Erreur API:', response.status, errorData);
                setUsers([]);
            }
        } catch (error) {
            console.error('Erreur réseau ou parsing:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/admin/users/action/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, action })
            });

            if (response.ok) {
                showNotification(action === 'approve' ? 'Utilisateur approuvé' : 'Accès révoqué', 'success');
                fetchUsers();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Erreur lors de l\'action', 'error');
            }
        } catch (err) {
            showNotification('Erreur réseau', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Elegant Page Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                    <PeopleIcon fontSize="medium" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h2>
                    <p className="text-slate-500 font-medium text-sm">Consulter et gérer les comptes clients et administrateurs</p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                {/* Modern Tab Bar */}
                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100 w-fit">
                        <button
                            onClick={() => setTab(0)}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 0 ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Clients
                        </button>
                        <button
                            onClick={() => setTab(1)}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 1 ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Administrateurs
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Chargement des utilisateurs...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Utilisateur</TableCell>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Email</TableCell>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>État</TableCell>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Rôle</TableCell>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Inscription</TableCell>
                                    {currentUser?.is_superuser && <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <PeopleIcon sx={{ fontSize: 48 }} />
                                                <p className="font-bold">Aucun utilisateur trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((u) => (
                                        <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: 'slate.50/50' }, '& td': { borderBottom: '1px solid #f8fafc' } }}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                        {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {u.first_name || u.username} {u.last_name || ''}
                                                            {u.is_superuser && <span className="ml-2 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">SUPER</span>}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">Membre depuis {new Date(u.date_joined || Date.now()).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-600 underline decoration-slate-200 underline-offset-4">{u.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${u.is_approved ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></div>
                                                    <span className={`text-[11px] font-bold ${u.is_approved ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {u.is_approved ? 'Actif' : 'En attente'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                                    {u.role === 'admin' ? 'Administrateur' : 'Client'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {new Date(u.date_joined || Date.now()).toLocaleDateString('fr-FR')}
                                                </p>
                                            </TableCell>
                                            {currentUser?.is_superuser && (
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {!u.is_approved ? (
                                                            <Tooltip title="Approuver l'accès">
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => handleAction(u.id, 'approve')}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            !u.is_superuser && (
                                                                <Tooltip title="Révoquer l'accès">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => handleAction(u.id, 'deactivate')}
                                                                        disabled={actionLoading}
                                                                    >
                                                                        <DoNotDisturbOnIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManager;

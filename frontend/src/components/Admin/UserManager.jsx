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
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';

function UserManager() {
    const [tab, setTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Rôle</TableCell>
                                    <TableCell sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', tracking: '0.1em', borderBottom: '1px solid #f1f5f9' }}>Inscription</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <PeopleIcon sx={{ fontSize: 48 }} />
                                                <p className="font-bold">Aucun utilisateur trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'slate.50/50' }, '& td': { borderBottom: '1px solid #f8fafc' } }}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                        {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {user.first_name || user.username} {user.last_name || ''}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Membre depuis {new Date(user.date_joined || Date.now()).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-600">{user.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                                    {user.role === 'admin' ? 'Administrateur' : 'Client'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {new Date(user.date_joined || Date.now()).toLocaleDateString('fr-FR')}
                                                </p>
                                            </TableCell>
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

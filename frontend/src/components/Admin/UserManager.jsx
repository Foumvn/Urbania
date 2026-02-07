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
        <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PeopleIcon />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Gestion des Utilisateurs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Consulter et gérer les comptes clients et administrateurs
                    </Typography>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    sx={{
                        px: 2,
                        pt: 1,
                        bgcolor: 'background.neutral',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Tab label="Clients" />
                    <Tab label="Administrateurs" />
                </Tabs>

                {loading ? (
                    <LinearProgress />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Utilisateur</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Rôle</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Inscription</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Aucun utilisateur trouvé
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main', fontSize: '0.875rem' }}>
                                                        {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {user.first_name} {user.last_name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={user.role === 'admin' ? <SecurityIcon sx={{ fontSize: '0.75rem !important' }} /> : <PeopleIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                    label={user.role === 'admin' ? 'Administrateur' : 'Client'}
                                                    size="small"
                                                    color={user.role === 'admin' ? 'error' : 'primary'}
                                                    variant="outlined"
                                                    sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(user.date_joined || Date.now()).toLocaleDateString('fr-FR')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}

export default UserManager;

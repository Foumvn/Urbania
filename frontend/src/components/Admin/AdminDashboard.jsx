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

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

// Import sub-components
import SessionsManager from './SessionsManager';
import StatsPanel from './StatsPanel';
import SettingsPanel from './SettingsPanel';
import ActivityLog from './ActivityLog';
import UserManager from './UserManager';
import NotificationCenter from './NotificationCenter';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/stats/`, {
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
            const token = localStorage.getItem('access_token');
            const actResponse = await fetch(`${API_BASE}/activity/`, {
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
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/admin/notifications/`, {
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
            const token = localStorage.getItem('access_token');
            await fetch(`${API_BASE}/admin/notifications/mark-read/`, {
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

    const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
        const colors = {
            primary: 'bg-blue-50 text-blue-600',
            success: 'bg-green-50 text-green-600',
            warning: 'bg-amber-50 text-amber-600',
            info: 'bg-indigo-50 text-indigo-600',
            error: 'bg-red-50 text-red-600'
        };

        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${colors[color] || colors.primary} group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {trend === 'up' ? <TrendingUpIcon fontSize="inherit" /> : <TrendingDownIcon fontSize="inherit" />}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                </div>
            </div>
        );
    };

    const QuickAction = ({ title, description, icon, color, onClick }) => {
        const colors = {
            primary: 'hover:bg-blue-50 hover:border-blue-200 text-blue-600 border-slate-100',
            secondary: 'hover:bg-slate-50 hover:border-slate-200 text-slate-600 border-slate-100',
            info: 'hover:bg-indigo-50 hover:border-indigo-200 text-indigo-600 border-slate-100',
            success: 'hover:bg-emerald-50 hover:border-emerald-200 text-emerald-600 border-slate-100'
        };

        return (
            <button
                onClick={onClick}
                className={`flex items-center gap-4 p-4 w-full bg-white border rounded-2xl transition-all active:scale-[0.98] ${colors[color] || colors.secondary}`}
            >
                <div className="p-2.5 rounded-xl bg-current bg-opacity-10">
                    {icon}
                </div>
                <div className="text-left font-sans">
                    <p className="font-bold text-sm text-slate-900">{title}</p>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{description}</p>
                </div>
            </button>
        );
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'session_created': return <AddIcon fontSize="small" />;
            case 'pdf_generated': return <DescriptionIcon fontSize="small" />;
            case 'session_updated': return <PendingIcon fontSize="small" />;
            case 'session_abandoned': return <ErrorIcon fontSize="small" />;
            default: return <HistoryIcon fontSize="small" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'abandoned': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total des sessions"
                    value={stats?.total || 0}
                    icon={<StorageIcon />}
                    color="primary"
                    trend="up"
                    trendValue="+12% cette semaine"
                />
                <StatCard
                    title="Terminées"
                    value={stats?.completed || 0}
                    icon={<CheckCircleIcon />}
                    color="success"
                />
                <StatCard
                    title="En cours"
                    value={stats?.inProgress || 0}
                    icon={<PendingIcon />}
                    color="warning"
                />
                <StatCard
                    title="Aujourd'hui"
                    value={stats?.todayNew || 0}
                    icon={<TrendingUpIcon />}
                    color="info"
                    trend="up"
                    trendValue="Nouvelles sessions"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions Panel */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUpIcon className="text-blue-600" />
                        Actions rapides
                    </h3>
                    <div className="space-y-4">
                        <QuickAction
                            title="Nouvelle session"
                            description="Créer une déclaration"
                            icon={<AddIcon fontSize="small" />}
                            color="primary"
                            onClick={() => window.location.href = '/formulaire'}
                        />
                        <QuickAction
                            title="Exporter les données"
                            description="Format CSV ou JSON"
                            icon={<DownloadIcon fontSize="small" />}
                            color="secondary"
                            onClick={() => { }}
                        />
                        <QuickAction
                            title="Voir les statistiques"
                            description="Analyses détaillées"
                            icon={<TimelineIcon fontSize="small" />}
                            color="info"
                            onClick={() => setActiveTab(3)}
                        />
                        <QuickAction
                            title="Paramètres"
                            description="Configuration du site"
                            icon={<SettingsIcon fontSize="small" />}
                            color="success"
                            onClick={() => setActiveTab(4)}
                        />
                    </div>
                </div>

                {/* Recent Activity Panel */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <HistoryIcon className="text-indigo-600" />
                            Activité récente
                        </h3>
                        <button
                            onClick={fetchDashboardData}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600"
                        >
                            <RefreshIcon fontSize="small" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${getStatusColor(activity.status)} bg-opacity-10 text-current`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{activity.user}</p>
                                        <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(activity.status)}`}>
                                    {activity.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setActiveTab(5)}
                        className="w-full mt-6 py-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                    >
                        Voir tout l'historique
                    </button>
                </div>

                {/* Distribution Panel */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <PeopleIcon className="text-emerald-600" />
                        Répartition
                    </h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-700">Particuliers</span>
                                <span className="font-black text-blue-600">{stats?.byType?.particulier || 0}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: stats ? `${(stats.byType.particulier / stats.total) * 100}%` : 0 }}
                                    className="h-full bg-blue-600 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-700">Personnes morales</span>
                                <span className="font-black text-emerald-600">{stats?.byType?.personne_morale || 0}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: stats ? `${(stats.byType.personne_morale / stats.total) * 100}%` : 0 }}
                                    className="h-full bg-emerald-600 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Top travaux</p>
                            <div className="flex flex-wrap gap-2">
                                {stats?.byNature && Object.entries(stats.byNature)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([key, value]) => (
                                        <span
                                            key={key}
                                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100"
                                        >
                                            {key}: {value}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { label: 'Vue d\'ensemble', icon: <DashboardIcon sx={{ fontSize: 20 }} />, component: renderOverview },
        { label: 'Sessions', icon: <DescriptionIcon sx={{ fontSize: 20 }} />, component: () => <SessionsManager /> },
        { label: 'Utilisateurs', icon: <PeopleIcon sx={{ fontSize: 20 }} />, component: () => <UserManager /> },
        { label: 'Statistiques', icon: <TimelineIcon sx={{ fontSize: 20 }} />, component: () => <StatsPanel /> },
        { label: 'Paramètres', icon: <SettingsIcon sx={{ fontSize: 20 }} />, component: () => <SettingsPanel /> },
        { label: 'Activité', icon: <HistoryIcon sx={{ fontSize: 20 }} />, component: () => <ActivityLog /> },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased">
            {/* Elegant Top Header */}
            <header className="bg-[#0f172a] text-white pt-10 pb-20 px-6 md:px-12 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/40">
                                <ShieldCheck className="text-white h-6 w-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Panel Expert</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Administration <span className="text-blue-400">Urbania</span></h1>
                        <p className="text-slate-400 font-medium">Gestion intelligente et supervision des dossiers CERFA</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter
                            notifications={notifications}
                            onMarkAllRead={handleMarkAllRead}
                            onRefresh={fetchNotifications}
                        />
                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all backdrop-blur-md border border-white/5 active:scale-95"
                        >
                            <RefreshIcon fontSize="small" />
                            Actualiser
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs Bar */}
            <div className="px-6 md:px-12 -mt-10 relative z-20">
                <div className="bg-white p-2 rounded-[28px] shadow-xl shadow-slate-200/60 border border-slate-100 flex overflow-x-auto no-scrollbar">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === index
                                ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/20'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <span className={activeTab === index ? 'text-blue-400' : 'text-slate-400'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow p-6 md:p-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronisation des données...</p>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto">
                        {activeTab === 0 && renderOverview()}
                        {activeTab === 1 && <SessionsManager />}
                        {activeTab === 2 && <UserManager />}
                        {activeTab === 3 && <StatsPanel />}
                        {activeTab === 4 && <SettingsPanel />}
                        {activeTab === 5 && <ActivityLog />}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;

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

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
            const token = localStorage.getItem('access_token');
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Elegant Period Switcher */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit flex gap-1">
                {['Cette semaine', 'Ce mois', 'Cette année', 'Tout'].map((label, idx) => (
                    <button
                        key={idx}
                        onClick={() => setPeriodTab(idx)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${periodTab === idx ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Card: Completion */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUpIcon sx={{ fontSize: 80 }} className="text-emerald-500" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-4 uppercase tracking-widest text-[10px] font-black">Taux de complétion</p>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                            {stats ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </h2>
                        <span className="flex items-center gap-1 text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUpIcon fontSize="inherit" /> +5%
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-6">
                        {stats?.completed || 0} terminées sur {stats?.total || 0}
                    </p>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: stats ? `${(stats.completed / stats.total) * 100}%` : 0 }}
                            className="h-full bg-emerald-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Metric Card: Abandonment */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingDownIcon sx={{ fontSize: 80 }} className="text-red-500" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-4 uppercase tracking-widest text-[10px] font-black">Taux d'abandon</p>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                            {stats ? Math.round((stats.abandoned / stats.total) * 100) : 0}%
                        </h2>
                        <span className="flex items-center gap-1 text-red-600 font-black text-xs bg-red-50 px-2 py-1 rounded-lg">
                            <TrendingDownIcon fontSize="inherit" /> -2%
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-6">
                        {stats?.abandoned || 0} sessions perdues
                    </p>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: stats ? `${(stats.abandoned / stats.total) * 100}%` : 0 }}
                            className="h-full bg-red-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Metric Card: Active */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group bg-gradient-to-br from-[#0f172a] to-slate-800 text-white border-none shadow-xl shadow-slate-900/20">
                    <p className="text-slate-400 font-medium text-sm mb-4 uppercase tracking-widest text-[10px] font-black">Sessions actives</p>
                    <div className="flex items-baseline gap-3 mb-2">
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            {stats?.inProgress || 0}
                        </h2>
                        <span className="text-blue-400 font-black text-xs">
                            EN COURS
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-6">
                        {stats ? Math.round((stats.inProgress / stats.total) * 100) : 0}% du trafic total
                    </p>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: stats ? `${(stats.inProgress / stats.total) * 100}%` : 0 }}
                            className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Bar Chart */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8">Flux Hebdomadaire</h3>
                    <div className="flex items-end justify-between gap-3 h-[240px] px-2">
                        {stats?.weekly?.map((day, index) => (
                            <div key={day.day} className="flex-grow flex flex-col items-center gap-4 group">
                                <div className="relative w-full flex flex-col items-center">
                                    <div className="absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {day.count} sessions
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.count / 30) * 180}px` }}
                                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${index === 3 ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-200'}`}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nature distribution list */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Nature des Travaux</h3>
                    <div className="space-y-4">
                        {stats?.byNature && Object.entries(stats.byNature)
                            .sort((a, b) => b[1] - a[1])
                            .map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-700">{travauxLabels[key] || key}</span>
                                        <span className="font-black text-slate-900">{value}</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(value / maxNature) * 100}%` }}
                                            className="h-full bg-indigo-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Bottom Comparison */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <h3 className="text-xl font-black text-slate-900 mb-10 text-center uppercase tracking-widest">Profil des Utilisateurs</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <h4 className="text-7xl font-black text-blue-600 tracking-tighter">
                                {stats?.byType?.particulier || 0}
                            </h4>
                            <div className="absolute -inset-4 bg-blue-50 rounded-full -z-10 blur-xl opacity-50"></div>
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-900 uppercase tracking-wider">Particuliers</p>
                            <p className="text-slate-500 font-medium">{stats ? Math.round((stats.byType.particulier / stats.total) * 100) : 0}% du total</p>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: stats ? `${(stats.byType.particulier / stats.total) * 100}%` : 0 }}
                                className="h-full bg-blue-600"
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <h4 className="text-7xl font-black text-emerald-600 tracking-tighter">
                                {stats?.byType?.personne_morale || 0}
                            </h4>
                            <div className="absolute -inset-4 bg-emerald-50 rounded-full -z-10 blur-xl opacity-50"></div>
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-900 uppercase tracking-wider">Personnes Morales</p>
                            <p className="text-slate-500 font-medium">{stats ? Math.round((stats.byType.personne_morale / stats.total) * 100) : 0}% du total</p>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: stats ? `${(stats.byType.personne_morale / stats.total) * 100}%` : 0 }}
                                className="h-full bg-emerald-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsPanel;

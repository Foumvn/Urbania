import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../context/FormContext';
import { useI18n } from '../../context/I18nContext';
import { useAuthLoading } from '../../context/AuthLoadingProvider';
import logoUrbania from '../../assets/logo-urbania-rb.png';
import {
    Plus,
    FileText,
    Folder,
    Clock,
    Eye,
    Trash2,
    Settings,
    User,
    LogOut,
    ChevronRight,
    Home,
    Search
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function UserDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const { reset } = useForm();
    const [dossiers, setDossiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        fetchDossiers();
    }, []);

    const fetchDossiers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/dossiers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDossiers(data);
            }
        } catch (error) {
            console.error('Failed to fetch dossiers:', error);
        } finally {
            setLoading(false);
        }
    };

    const { startLoading } = useAuthLoading();

    const handleNewDossier = () => {
        reset();
        startLoading('/formulaire');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getNatureLabel = (nature) => {
        const labels = {
            'RAVALEMENT': 'Ravalement de façade',
            'CLOTURE': 'Clôture et portail',
            'PISCINE': 'Piscine',
            'EXTENSION': 'Extension / Agrandissement',
            'ABRI_JARDIN': 'Abri de jardin',
        };
        const label = labels[nature] || nature || 'Nouveau projet';
        return String(label);
    };

    const filteredDossiers = (dossiers || []).filter(d => {
        try {
            const search = (searchTerm || '').toLowerCase();
            const nature = getNatureLabel(d?.data?.natureTravaux).toLowerCase();
            const ville = String(d?.data?.terrainVille || '').toLowerCase();
            const codePostal = String(d?.data?.terrainCodePostal || '').toLowerCase();
            return nature.includes(search) || ville.includes(search) || codePostal.includes(search);
        } catch (e) {
            console.error('Error filtering dossier:', e, d);
            return false;
        }
    });

    const totalPages = Math.ceil(filteredDossiers.length / itemsPerPage);
    const paginatedDossiers = filteredDossiers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const completedCount = dossiers.filter(d => d.status === 'completed').length;
    const pendingCount = dossiers.filter(d => d.status !== 'completed').length;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Top Navigation */}
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-[60]">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <img src={logoUrbania} alt="Urbania Logo" className="h-14 w-auto object-contain" />
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/profile')} className="p-2.5 text-slate-500 hover:text-[#002395] hover:bg-slate-50 rounded-xl transition-all">
                        <User className="size-5" />
                    </button>
                    <button onClick={handleLogout} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut className="size-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-[1500px] mx-auto p-8 lg:p-12">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                            <Home className="size-3" />
                            <span>Accueil</span>
                            <ChevronRight className="size-3" />
                            <span className="text-[#002395]">Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Salut, {user?.first_name || 'Utilisateur'} 👋
                        </h1>
                        <p className="text-slate-500 mt-3 font-medium">Gérez et suivez l'avancement de vos projets d'urbanisme.</p>
                    </div>
                    <button
                        onClick={handleNewDossier}
                        className="bg-[#002395] hover:bg-[#001a6e] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
                    >
                        <Plus className="size-5" />
                        Nouveau Projet
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Left side: List & Search */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Search & Stats Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-[#002395] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un projet, une ville..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-[#002395]/5 focus:border-[#002395] transition-all placeholder:text-slate-400 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-white border border-slate-200 rounded-2xl px-6 flex items-center gap-3 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                    <span className="text-lg font-black text-[#002395]">{dossiers.length}</span>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 flex items-center gap-3 shadow-sm">
                                    <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">OK</span>
                                    <span className="text-lg font-black text-emerald-600">{completedCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Projects Content */}
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Projet</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dernière modification</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            [1, 2, 3, 4].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-100 rounded-full w-1/3" /></td>
                                                </tr>
                                            ))
                                        ) : paginatedDossiers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-32 text-center">
                                                    <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                                        <Folder className="size-10" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun projet à afficher</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedDossiers.map((dossier) => (
                                                <tr key={dossier.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => navigate(`/formulaire?id=${dossier.id}`)}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${dossier.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#002395]'}`}>
                                                                <FileText className="size-6" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 group-hover:text-[#002395] transition-colors leading-tight">{getNatureLabel(dossier.data?.natureTravaux)}</p>
                                                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{dossier.data?.terrainVille || 'France'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] ${dossier.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                            <span className={`size-1.5 rounded-full ${dossier.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                            {dossier.status === 'completed' ? 'Prêt' : 'En cours'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs text-slate-500 font-bold tracking-tight">
                                                        {new Date(dossier.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/formulaire?id=${dossier.id}`)}
                                                                className="size-10 flex items-center justify-center text-slate-400 hover:text-[#002395] hover:bg-slate-100 rounded-2xl transition-all"
                                                            >
                                                                <Eye className="size-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedDossier(dossier); setDeleteDialogOpen(true); }}
                                                                className="size-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                            >
                                                                <Trash2 className="size-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <span className="text-slate-900">{filteredDossiers.length}</span> projets trouvés
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-2 text-slate-400 hover:text-[#002395] disabled:opacity-30 transition-all font-black uppercase text-[10px] tracking-widest px-2"
                                    >
                                        <ChevronRight className="rotate-180 size-4" />
                                        Précédent
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`size-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#002395] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-200'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="flex items-center gap-2 bg-[#002395] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-[#001a6e]"
                                    >
                                        Suivant
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Sidebar */}
                    <div className="flex flex-col gap-8">
                        {/* Quick Help */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Support</h3>
                            <div className="flex flex-col gap-3 font-bold text-sm">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#002395] transition-all cursor-pointer group">
                                    <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#002395] group-hover:text-white transition-all shadow-sm">
                                        <Settings className="size-5" />
                                    </div>
                                    <span className="text-slate-700">Paramètres</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#002395] transition-all cursor-pointer group">
                                    <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#002395] group-hover:text-white transition-all shadow-sm">
                                        <Home className="size-5" />
                                    </div>
                                    <span className="text-slate-700">Centre d'aide</span>
                                </div>
                            </div>
                        </div>

                        {/* Promo / Info */}
                        <div className="bg-gradient-to-br from-[#002395] to-[#001a6e] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4 leading-none">Des plans en 5 min</h3>
                                <p className="text-blue-100/80 text-sm mb-8 leading-relaxed font-semibold">
                                    Notre IA générative crée vos plans de masse et de situation automatiquement.
                                </p>
                                <button className="w-full py-5 bg-white text-[#002395] font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-lg">
                                    En savoir plus
                                </button>
                            </div>
                            <div className="absolute -right-10 -bottom-10 size-48 bg-white/10 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-white"
                    >
                        <div className="size-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-sm">
                            <Trash2 className="size-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-3">Supprimer ?</h3>
                        <p className="text-slate-500 text-sm text-center leading-relaxed mb-10 font-medium px-4">
                            Cette action est irréversible. Toutes les données du projet seront perdues.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                Garder
                            </button>
                            <button
                                onClick={() => { /* Implement delete api call if needed */ setDeleteDialogOpen(false); }}
                                className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20"
                            >
                                Supprimer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default UserDashboard;

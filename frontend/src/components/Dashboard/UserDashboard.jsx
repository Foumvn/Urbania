import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../context/FormContext';
import { useI18n } from '../../context/I18nContext';
import { useAuthLoading } from '../../context/AuthLoadingProvider';
import logoUrbania from '../../assets/logo-urbania.jpg';
import {
    Plus,
    FileText,
    Folder,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Trash2,
    Settings,
    User,
    LogOut,
    HelpCircle,
    Home,
    ChevronRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

function UserDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, lang } = useI18n();
    const { reset } = useForm();
    const [dossiers, setDossiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);

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
        return labels[nature] || nature || 'Nouveau projet';
    };

    const completedCount = dossiers.filter(d => d.status === 'completed').length;
    const pendingCount = dossiers.filter(d => d.status !== 'completed').length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate('/dashboard')}
                        >
                            <img
                                src={logoUrbania}
                                alt="Urbania"
                                className="h-10 w-auto rounded-lg"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="px-3 py-2 text-sm text-slate-600 hover:text-[#002395] transition-colors"
                                >
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 text-slate-600 hover:text-[#002395] hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <User className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-slate-600 hover:text-[#002395] hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <Settings className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Bonjour, {user?.first_name || 'Utilisateur'} 👋
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Gérez vos déclarations préalables de travaux
                            </p>
                        </div>
                        <motion.button
                            onClick={handleNewDossier}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#002395] text-white font-semibold rounded-xl shadow-lg shadow-[#002395]/20 hover:shadow-xl hover:shadow-[#002395]/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Plus className="h-5 w-5" />
                            Nouveau dossier
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="text-3xl font-bold text-[#002395]">{dossiers.length}</div>
                        <div className="text-sm text-slate-500 mt-1">Total dossiers</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="text-3xl font-bold text-emerald-500">{completedCount}</div>
                        <div className="text-sm text-slate-500 mt-1">Terminés</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
                        <div className="text-sm text-slate-500 mt-1">En cours</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="text-3xl font-bold text-[#002395]">6</div>
                        <div className="text-sm text-slate-500 mt-1">Plans générés</div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Dossiers List */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-900">Mes dossiers</h2>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-slate-100">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-8 animate-pulse flex gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-slate-100 rounded w-1/4" />
                                                <div className="h-3 bg-slate-50 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : dossiers.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Folder className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Aucun dossier pour le moment</p>
                                    <button
                                        onClick={handleNewDossier}
                                        className="mt-4 text-[#002395] font-medium hover:underline"
                                    >
                                        Créer votre premier dossier
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {dossiers.map((dossier, index) => (
                                        <motion.div
                                            key={dossier.id}
                                            className="p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="flex items-start sm:items-center gap-4">
                                                <div className={`p-3 rounded-xl ${dossier.status === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    <FileText className="h-5 w-5" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {getNatureLabel(dossier.data?.natureTravaux)}
                                                        </h3>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${dossier.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {dossier.status === 'completed' ? (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Terminé
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Clock className="h-3 w-3" />
                                                                    En cours
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {dossier.data?.terrainVille || 'Adresse non renseignée'} • {new Date(dossier.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {dossier.status === 'completed' && (
                                                        <button className="p-2 text-slate-400 hover:text-[#002395] hover:bg-[#002395]/5 rounded-lg transition-all">
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/formulaire?id=${dossier.id}`)}
                                                        className="p-2 text-slate-400 hover:text-[#002395] hover:bg-[#002395]/5 rounded-lg transition-all"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedDossier(dossier); setDeleteDialogOpen(true); }}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleNewDossier}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-[#002395] hover:bg-[#002395]/5 transition-all group"
                                >
                                    <div className="p-2 bg-[#002395]/10 rounded-lg text-[#002395] group-hover:bg-[#002395] group-hover:text-white transition-all">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Nouveau dossier</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-[#002395] hover:bg-[#002395]/5 transition-all group"
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-[#002395] group-hover:text-white transition-all">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Mon profil</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-[#002395] hover:bg-[#002395]/5 transition-all group"
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-[#002395] group-hover:text-white transition-all">
                                        <HelpCircle className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Centre d'aide</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                                </button>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-[#002395] to-[#3b5fc4] rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Besoin d'aide ?</h3>
                            <p className="text-white/80 text-sm mb-4">
                                Notre équipe est disponible pour vous accompagner dans vos démarches.
                            </p>
                            <button className="w-full py-2.5 px-4 bg-white text-[#002395] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                                Nous contacter
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Supprimer ce dossier ?</h3>
                        <p className="text-slate-500 mb-6">
                            Cette action est irréversible. Voulez-vous vraiment supprimer ce dossier ?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
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

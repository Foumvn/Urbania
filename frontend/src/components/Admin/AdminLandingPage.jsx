import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import logoUrbania from '../../assets/logo-urbania-rb.png';

function AdminLandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-12 font-sans antialiased overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 bg-white">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-100 to-transparent"></div>
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                ></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl"
            >
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16 text-center overflow-hidden">
                    {/* Floating decoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-50 rounded-full opacity-50 blur-3xl"></div>

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex justify-center mb-10"
                    >
                        <div className="relative">
                            <img
                                src={logoUrbania}
                                alt="Urbania Logo"
                                className="h-32 md:h-40 w-auto relative z-10 drop-shadow-xl"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-blue-100 rounded-full filter blur-2xl opacity-20 -z-10"
                            ></motion.div>
                        </div>
                    </motion.div>

                    <div className="space-y-6 mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
                        >
                            Portail <span className="text-[#0056b2]">Administrateur</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed"
                        >
                            Interface de supervision experte pour la plateforme Urbania. Accédez à vos outils de gestion et d'analyse.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto"
                    >
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="group relative flex items-center justify-center gap-3 bg-[#0f172a] text-white py-5 px-8 rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]"
                        >
                            <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            <span>Se connecter</span>
                        </button>

                        <button
                            onClick={() => navigate('/admin/register')}
                            className="group flex items-center justify-center gap-3 bg-white text-slate-700 py-5 px-8 rounded-2xl font-bold border-2 border-slate-100 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98]"
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>Créer un compte</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 flex flex-col items-center gap-4"
                    >
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                            <div className="h-[1px] w-8 bg-slate-200"></div>
                            Urbania Core Engine v1.0.0
                            <div className="h-[1px] w-8 bg-slate-200"></div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Système Sécurisé</span>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-sm">
                    En accédant à ce portail, vous acceptez les conditions de confidentialité d'Urbania.
                </div>
            </motion.div>
        </div>
    );
}

export default AdminLandingPage;

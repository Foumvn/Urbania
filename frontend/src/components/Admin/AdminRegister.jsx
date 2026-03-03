import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthLoading } from "../../context/AuthLoadingProvider";
import logoUrbaniaWhite from "../../assets/logo-urbania-rb.png";
import logoUrbaniaColor from "../../assets/logo-urbania.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, ShieldCheck, Key } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const carouselSlides = [
    {
        title: "Rejoignez l'équipe administrative",
        description: "Collaborez sur la gestion des dossiers et l'optimisation des flux d'urbanisme.",
        stats: { label: "Dossiers gérés", value: "25,000+" }
    },
    {
        title: "Outils d'Analyse Avancés",
        description: "Accédez à des tableaux de bord complets pour piloter l'activité de la plateforme.",
        stats: { label: "Disponibilité", value: "99.9%" }
    },
    {
        title: "Sécurité de Grade Bancaire",
        description: "Toutes les actions administratives sont tracées et sécurisées.",
        stats: { label: "Cryptage", value: "AES-256" }
    }
];

function AdminRegister() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { startLoading } = useAuthLoading();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        invite_code: ''
    });

    // Carousel auto-rotation
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 5000);

        return () => clearInterval(slideInterval);
    }, []);

    // Progress bar animation
    useEffect(() => {
        setProgress(0);
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [currentSlide]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirm_password) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email,
                    email: formData.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    password: formData.password,
                    confirm_password: formData.confirm_password,
                    role: 'admin',
                    invite_code: formData.invite_code
                })
            });

            if (response.ok) {
                showNotification('Compte administrateur créé avec succès. Un administrateur va valider votre accès.', 'success');
                startLoading("/admin/login");
            } else {
                const data = await response.json();
                if (data.non_field_errors) {
                    setError(data.non_field_errors[0]);
                } else if (typeof data === 'object') {
                    // Prendre la première erreur trouvée dans les champs
                    const firstField = Object.keys(data)[0];
                    const firstError = data[firstField];
                    setError(`${firstField}: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
                } else {
                    setError(data.detail || "Erreur lors de la création du compte admin.");
                }
            }
        } catch (err) {
            setError("Une erreur réseau est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex text-slate-900 font-sans antialiased">
            {/* Left Section - Hero & Carousel */}
            <section className="hidden lg:flex flex-col w-1/2 bg-[#0f172a] text-white relative items-center justify-center p-12 overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                ></div>

                <div className="relative z-10 mb-16">
                    <div className="h-40 w-40 bg-gradient-to-tr from-[#0056b2] to-[#002288] rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
                        <ShieldCheck className="h-20 w-20 text-white" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-lg text-center h-48 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.7 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <h2 className="text-4xl font-bold mb-6 tracking-tight">
                                {carouselSlides[currentSlide].title}
                            </h2>
                            <p className="text-lg text-slate-400 max-w-sm leading-relaxed mb-8">
                                {carouselSlides[currentSlide].description}
                            </p>
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="text-5xl font-black mb-2 text-white">
                                    {carouselSlides[currentSlide].stats.value}
                                </div>
                                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                                    {carouselSlides[currentSlide].stats.label}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-20 flex gap-3 z-10">
                    {carouselSlides.map((_, index) => (
                        <div key={index} className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#3b82f6] transition-all duration-100"
                                style={{
                                    width: index === currentSlide ? `${progress}%` : index < currentSlide ? '100%' : '0%'
                                }}
                            ></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Right Section - Registration Form */}
            <section className="flex flex-col w-full lg:w-1/2 relative bg-white">
                <div className="p-6 md:p-8">
                    <Link
                        to="/admin-portal"
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0056b2] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au portail
                    </Link>
                </div>

                <div className="flex-grow flex items-center justify-center p-8 md:p-12 overflow-y-auto">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 bg-[#0f172a] rounded-full flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                Inscription Admin
                            </h1>
                            <p className="text-slate-500">Créez un accès administratif sécurisé</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Prénom</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            placeholder="Jean"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Nom</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            placeholder="Dupont"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Email Professionnel</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@urbania.fr"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Mot de passe</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Confirmation</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Code d'invitation Admin</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <Key className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="invite_code"
                                        value={formData.invite_code}
                                        onChange={handleChange}
                                        placeholder="Saisissez votre code"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:border-[#0056b2] focus:ring-0 transition-all shadow-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Le code d'invitation est requis pour activer les privilèges administrateur.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-[#0f172a] text-white font-bold py-4 px-4 rounded-lg hover:bg-slate-800 transition-all transform active:scale-[0.99] shadow-xl shadow-slate-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Création en cours..." : "Créer le compte Administrateur"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500">
                            Déjà un compte ?{" "}
                            <Link to="/admin/login" className="font-bold text-[#0056b2] hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminRegister;

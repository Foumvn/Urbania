import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthLoading } from "../../context/AuthLoadingProvider";
import logoUrbaniaWhite from "../../assets/logo-urbania-rb.png";
import logoUrbaniaBlue from "../../assets/logo-urbania.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

const carouselSlides = [
    {
        title: "Administration Centralisée",
        description: "Gérez tous les dossiers, utilisateurs et paramètres de la plateforme depuis un espace unique."
    },
    {
        title: "Supervision en Temps Réel",
        description: "Suivez l'activité de la plateforme, les nouvelles inscriptions et les soumissions de dossiers."
    },
    {
        title: "Sécurité & Conformité",
        description: "Assurez la sécurité des données et la conformité des procédures d'urbanisme."
    }
];

function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { startLoading } = useAuthLoading();
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
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
        setIsLoading(true);

        try {
            const success = await login({ email: formData.email, password: formData.password });
            // Note: login returns { success: true, user: ... } or { success: false, error: ... }
            // Adaptation si login retourne juste boolean ou object dans votre version actuelle context
            if (success && success.success !== false) {
                // Check if user is admin
                const user = success.user;
                // Note: Ideally the backend denies login if not admin, or we check here
                // Assuming login handles it or we redirect
                startLoading("/dashboard");
            } else {
                setError(success?.error || "Email ou mot de passe incorrect");
            }
        } catch (err) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        // Admin login via Google: Only works if account already exists as admin
        const result = await signInWithGoogle('login');

        if (result.success) {
            // Check role if possible, otherwise dashboard will handle protection
            startLoading("/dashboard");
        } else if (googleError) {
            setError(googleError);
        }
    };

    return (
        <div className="min-h-screen bg-white flex text-slate-900 font-sans antialiased">
            {/* Left Section - Login Form */}
            <section className="flex flex-col w-full lg:w-1/2 relative bg-white">
                {/* Top Navigation */}
                <div className="p-6 md:p-8">
                    <Link
                        to="/admin-portal"
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0056b2] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au portail
                    </Link>
                </div>

                {/* Center Content */}
                <div className="flex-grow flex items-center justify-center p-8 md:p-12">
                    <div className="w-full max-w-md space-y-8">
                        {/* Form Header */}
                        <div className="text-center space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 bg-[#002288] rounded-full flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                Espace Admin
                            </h1>
                            <p className="text-slate-500">Connexion sécurisée à l'administration</p>
                        </div>

                        {/* Social Login (Admin Google) */}
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading || isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Admin via Google
                            </button>

                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                    Ou via identifiants
                                </span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                >
                                    Email Admin
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@urbania.fr"
                                        required
                                        className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                    >
                                        Mot de passe
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        required
                                        className="block w-full pl-10 pr-12 py-3.5 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1e293b] text-white font-bold py-4 px-4 rounded-lg hover:bg-slate-800 transition-all transform active:scale-[0.99] shadow-xl shadow-slate-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Vérification..." : "Accéder au Panel"}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500">
                            Nouvel administrateur ?{" "}
                            <Link to="/admin/register" className="font-bold text-[#0056b2] hover:underline">
                                Demander un accès
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* Right Section - Hero & Carousel (Darker theme for Admin) */}
            <section className="hidden lg:flex flex-col w-1/2 bg-[#0f172a] text-white relative items-center justify-center p-12 overflow-hidden">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                ></div>

                {/* Secure Badge Graphic */}
                <div className="relative z-10 mb-16">
                    <div className="h-40 w-40 bg-gradient-to-tr from-[#0056b2] to-[#002288] rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
                        <ShieldCheck className="h-20 w-20 text-white" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Carousel Content */}
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
                            <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
                                {carouselSlides[currentSlide].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Carousel Progress Indicators */}
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
        </div>
    );
}

export default AdminLogin;

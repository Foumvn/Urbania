import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthLoading } from "../../context/AuthLoadingProvider";
import logoUrbaniaWhite from "../../assets/logo-urbania-rb.png";
import logoUrbaniaColor from "../../assets/logo-urbania.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle2 } from "lucide-react";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

const carouselSlides = [
    {
        title: "Rejoignez des milliers d'utilisateurs",
        description: "Des particuliers font confiance à notre plateforme pour leurs démarches d'urbanisme.",
        stats: { label: "Utilisateurs actifs", value: "12,000+" }
    },
    {
        title: "Dossiers validés en mairie",
        description: "Notre taux de conformité garantit l'acceptation de vos déclarations préalables.",
        stats: { label: "Taux de conformité", value: "98%" }
    },
    {
        title: "Temps moyen économisé",
        description: "Générez votre dossier complet en quelques minutes au lieu de plusieurs heures.",
        stats: { label: "Gain de temps", value: "5h" }
    }
];

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { startLoading } = useAuthLoading();
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
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

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
            });

            startLoading("/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError("");
        const result = await signInWithGoogle('register');

        if (result.success) {
            startLoading("/dashboard");
        } else if (googleError) {
            setError(googleError);
        }
    };

    return (
        <div className="min-h-screen bg-white flex text-slate-900 font-sans antialiased">
            {/* Left Section - Stats & Carousel */}
            <section className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-[#0056b2] to-[#002288] text-white relative items-center justify-center p-12 overflow-hidden">
                {/* Animated Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                        backgroundSize: '40px 40px',
                        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        animation: 'grid-pulse 8s ease-in-out infinite alternate'
                    }}
                ></div>

                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-2 border-white"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border-2 border-white"></div>
                </div>

                {/* Persistent Logo */}
                <div className="relative z-10 mb-16">
                    <img
                        src={logoUrbaniaColor}
                        alt="Urbania Logo"
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Carousel Content */}
                <div className="relative z-10 w-full max-w-lg text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.7 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <h2 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                                {carouselSlides[currentSlide].title}
                            </h2>
                            <p className="text-lg text-white/80 max-w-sm leading-relaxed mb-8">
                                {carouselSlides[currentSlide].description}
                            </p>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-5xl font-black mb-2">
                                    {carouselSlides[currentSlide].stats.value}
                                </div>
                                <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">
                                    {carouselSlides[currentSlide].stats.label}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Carousel Progress Indicators */}
                <div className="mt-20 flex gap-3 z-10">
                    {carouselSlides.map((_, index) => (
                        <div key={index} className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100"
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
                {/* Top Navigation */}
                <div className="p-6 md:p-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0056b2] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Link>
                </div>

                {/* Center Content */}
                <div className="flex-grow flex items-center justify-center p-8 md:p-12 overflow-y-auto">
                    <div className="w-full max-w-md space-y-8">
                        {/* Form Header */}
                        <div className="text-center space-y-4">
                            <div className="flex justify-center mb-6">
                                <img
                                    src={logoUrbaniaWhite}
                                    alt="Urbania Logo"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                Créer un compte
                            </h1>
                            <p className="text-slate-500">Commencez votre déclaration préalable</p>
                        </div>

                        {/* Social Register */}
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleGoogleRegister}
                                disabled={googleLoading || isSubmitting}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continuer avec Google
                            </button>

                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                    Ou continuer avec email
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

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label
                                        htmlFor="firstName"
                                        className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                    >
                                        Prénom
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Jean"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="lastName"
                                        className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                    >
                                        Nom
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Dupont"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                >
                                    Email
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
                                        placeholder="test@user.com"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="phone"
                                    className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                >
                                    Téléphone
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="06 12 34 56 78"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                >
                                    Mot de passe
                                </label>
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
                                        className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
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

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]"
                                >
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        required
                                        className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm transition-all focus:ring-0 focus:border-[#0056b2] placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(0,86,178,0.1)]"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-gradient-to-r from-[#002288] to-[#0056b2] text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 transition-all transform active:scale-[0.99] shadow-xl shadow-blue-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500">
                            Vous avez déjà un compte ?{" "}
                            <Link to="/auth/login" className="font-bold text-[#0056b2] hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes grid-pulse {
                    0% { opacity: 0.3; transform: scale(1); }
                    100% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}

export default Register;

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Plus,
    Download,
    Edit3,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Search,
    Filter,
    User,
    LogOut,
    Settings,
    ChevronRight
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import logoUrbania from "@/assets/logo-urbania.jpg";
import DossierOnboarding from "@/components/Onboarding/DossierOnboarding";
import { useAuthLoading } from "@/context/AuthLoadingProvider";

const Dashboard = () => {
    const { isLoading: isPageLoading } = useAuthLoading();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    useEffect(() => {
        fetchDossiers();
    }, []);

    // Déclenchement IMMÉDIAT après le loading screen
    useEffect(() => {
        if (!isPageLoading) {
            const hasSeenOnboarding = localStorage.getItem("urbania_onboarding_seen");
            if (!hasSeenOnboarding) {
                setIsOnboardingOpen(true);
            }
        }
    }, [isPageLoading]);

    const fetchDossiers = async () => {
        // Mocking data fetching for UI development
        setIsLoading(true);
        setTimeout(() => {
            const mockDocs = [
                {
                    id: "1",
                    title: "Piscine - Montpellier",
                    type: "Piscine",
                    status: "completed",
                    date: "12 janv. 2026",
                    address: "12 Rue de la Loge, 34000 Montpellier"
                },
                {
                    id: "2",
                    title: "Extension - Castelnau",
                    type: "Extension",
                    status: "in_progress",
                    date: "15 janv. 2026",
                    address: "45 Avenue de l'Europe, 34170 Castelnau-le-Lez"
                },
                {
                    id: "3",
                    title: "Rénovation - Lattes",
                    type: "Rénovation",
                    status: "draft",
                    date: "20 janv. 2026",
                    address: "7 bis Chemin des Lilas, 34970 Lattes"
                }
            ];
            setDocuments(mockDocs);
            setIsLoading(false);
        }, 1000);
    };

    const handleOpenOnboarding = () => {
        setIsOnboardingOpen(true);
    };

    const handleCloseOnboarding = () => {
        setIsOnboardingOpen(false);
    };

    const handleCompleteOnboarding = (data: any) => {
        console.log("Onboarding completed with data:", data);
        setIsOnboardingOpen(false);
        // TODO: Submit data to backend and create a new dossier
    };

    const quickActions = [
        {
            icon: Plus,
            title: "Nouveau dossier",
            description: "Créer une nouvelle déclaration préalable",
            color: "bg-primary",
            onClick: handleOpenOnboarding // Changed from link to onClick
        },
        {
            icon: Download,
            title: "Télécharger CERFA",
            description: "Télécharger un dossier complet",
            color: "bg-[hsl(155_60%_40%)]",
            link: "/telecharger"
        },
        {
            icon: Edit3,
            title: "Modifier un dossier",
            description: "Reprendre un dossier existant",
            color: "bg-[hsl(25_90%_55%)]",
            link: "/modifier"
        },
        {
            icon: MessageSquare,
            title: "Nous contacter",
            description: "Besoin d'aide ? Contactez-nous",
            color: "bg-[hsl(280_70%_50%)]",
            link: "/rendez-vous"
        }
    ] as const;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Terminé
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        En cours
                    </span>
                );
            case "draft":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Brouillon
                    </span>
                );
            default:
                return null;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--urbania-blue-light))]">
            {/* Header with official logo */}
            <motion.header
                className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        <Link href="/" className="flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="relative h-12 w-36 md:h-14 md:w-48 overflow-hidden"
                            >
                                <Image
                                    src={logoUrbania}
                                    alt="Urbania Logo"
                                    className="object-contain"
                                    fill
                                    priority
                                />
                            </motion.div>
                        </Link>

                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="hidden md:inline text-sm font-semibold text-foreground">Jean Dupont</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-lg border border-border shadow-xl z-50 rounded-xl">
                                    <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-primary/5 text-sm font-medium">
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        Paramètres
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/rendez-vous" className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-primary/5 text-sm font-medium">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            Contact
                                        </Link>
                                    </DropdownMenuItem>
                                    <div className="h-px bg-border/50 my-1" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/login" className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 text-sm font-semibold">
                                            <LogOut className="h-4 w-4" />
                                            Déconnexion
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {/* Welcome Section */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                        Bonjour, Jean 👋
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
                        Gérez vos déclarations préalables de travaux en toute simplicité avec l'IA Urbania.
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {quickActions.map((action, index) => {
                        const content = (
                            <motion.div
                                className="relative bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-2xl transition-all duration-500 group overflow-hidden h-full flex flex-col cursor-pointer"
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Colored accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-2 ${action.color}`} />

                                <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/10`}>
                                    <action.icon className="h-8 w-8 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {action.description}
                                </p>

                                <div className="mt-auto pt-6 flex justify-end">
                                    <ChevronRight className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.div>
                        );

                        return (
                            <motion.div key={index} variants={itemVariants}>
                                {'onClick' in action && action.onClick ? (
                                    <div onClick={action.onClick}>
                                        {content}
                                    </div>
                                ) : 'link' in action && action.link ? (
                                    <Link href={action.link}>
                                        {content}
                                    </Link>
                                ) : null}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Documents Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Mes dossiers v3</h2>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un dossier..."
                                    className="pl-12 pr-6 py-3 rounded-2xl border border-border bg-white text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full md:w-80 shadow-sm"
                                />
                            </div>
                            <Button variant="outline" size="lg" className="rounded-2xl border-border bg-white hover:bg-primary/5 gap-2 px-6">
                                <Filter className="h-5 w-5" />
                                <span className="hidden sm:inline font-semibold">Filtrer</span>
                            </Button>
                        </div>
                    </div>

                    {/* Documents List */}
                    {isLoading ? (
                        <div className="grid gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-white/50 backdrop-blur-sm rounded-3xl animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className="grid gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {documents.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-soft hover:shadow-xl hover:border-primary/20 transition-all duration-500 group"
                                    variants={itemVariants}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                                                <FileText className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                </div>
                                                <p className="text-muted-foreground font-medium mb-3">{doc.address}</p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <span className="text-sm font-bold text-primary/80 px-2.5 py-1 bg-primary/5 rounded-lg">{doc.type}</span>
                                                    <span className="text-sm text-muted-foreground/60 font-medium">{doc.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 ml-20 md:ml-0">
                                            <div className="mr-2">
                                                {getStatusBadge(doc.status)}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {doc.status === "completed" && (
                                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Button size="lg" className="rounded-xl gap-2 font-bold px-6 shadow-lg shadow-primary/20">
                                                            <Download className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Dossier</span>
                                                        </Button>
                                                    </motion.div>
                                                )}
                                                {doc.status !== "completed" && (
                                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Button size="lg" variant="outline" className="rounded-xl gap-2 font-bold px-6 border-border hover:border-primary/50">
                                                            <Edit3 className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Reprendre</span>
                                                        </Button>
                                                    </motion.div>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-2 bg-white/95 backdrop-blur-lg border border-border shadow-xl z-50 rounded-xl">
                                                        <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-primary/5 text-sm font-medium">
                                                            <Edit3 className="h-4 w-4" />
                                                            Gérer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-primary/5 text-sm font-medium">
                                                            <Download className="h-4 w-4" />
                                                            Télécharger
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-border/50 my-1" />
                                                        <DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 text-sm font-bold">
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!isLoading && documents.length === 0 && (
                        <motion.div
                            className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-border/50"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">Aucun dossier pour le moment</h3>
                            <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
                                Commencez à créer votre déclaration préalable dès maintenant avec l'IA.
                            </p>
                            <Link href="/nouveau-dossier">
                                <Button size="lg" className="rounded-2xl gap-2 font-bold px-10 h-14 shadow-xl shadow-primary/25">
                                    <Plus className="h-5 w-5" />
                                    Créer mon premier dossier
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                {/* Help Banner */}
                <motion.div
                    className="mt-20 relative overflow-hidden bg-gradient-to-r from-primary to-urbania-navy rounded-[40px] p-8 md:p-12 shadow-2xl shadow-primary/20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {/* Decorative background shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl -ml-24 -mb-24" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
                                <MessageSquare className="h-10 w-10 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-3xl font-extrabold text-white mb-3">Une question sur votre projet ?</h3>
                                <p className="text-primary-foreground/80 md:text-lg font-medium max-w-lg">
                                    Nos experts en urbanisme sont là pour vous accompagner dans toutes vos démarches réglementaires.
                                </p>
                            </div>
                        </div>
                        <Link href="/rendez-vous">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="lg" className="rounded-2xl bg-white text-primary hover:bg-white/90 gap-3 px-10 h-16 text-lg font-bold shadow-2xl">
                                    Prendre rendez-vous
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>
            </main>

            {/* Footer minimal for dashboard */}
            <footer className="py-12 border-t border-border/40 mt-12 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-muted-foreground text-sm font-medium">
                        © 2026 Urbania. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Mentions légales</Link>
                        <Link href="/confidentialite" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Confidentialité</Link>
                        <Link href="/rendez-vous" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium font-bold">Aide & Support</Link>
                    </div>
                </div>
            </footer>

            <DossierOnboarding
                isOpen={isOnboardingOpen}
                onClose={handleCloseOnboarding}
                onComplete={handleCompleteOnboarding}
            />
        </div>
    );
};

export default Dashboard;

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronRight,
    ArrowLeft,
    Check,
    Building2,
    User,
    MapPin,
    Hammer,
    FileText,
    Maximize2,
    Paperclip,
    CheckCircle2,
    Info,
    Sparkles,
    Search,
    Calendar,
    Contact,
    Home,
    Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types matching legacy CERFA fields
interface OnboardingData {
    // Step 1 & 2: Identité
    typeDeclarant: "particulier" | "societe";
    civilite: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;

    // Pour Société
    denomination: string;
    siret: string;
    typeSociete: string;
    representantNom: string;
    representantPrenom: string;
    representantQualite: string;

    // Step 3: Coordonnées
    email: string;
    telephone: string;
    adresse: string;
    codePostal: string;
    ville: string;

    // Step 4: Terrain
    terrainAdresse: string;
    terrainCodePostal: string;
    terrainVille: string;
    section: string;
    numeroParcelle: string;
    surfaceTerrain: string;

    // Step 5 & 6: Projet
    natureTravaux: string[];
    descriptionProjet: string;
    surfaceCreee: string;

    // Step 7: Documents
    documents: string[];
}

const initialData: OnboardingData = {
    typeDeclarant: "particulier",
    civilite: "M.",
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    denomination: "",
    siret: "",
    typeSociete: "",
    representantNom: "",
    representantPrenom: "",
    representantQualite: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    terrainAdresse: "",
    terrainCodePostal: "",
    terrainVille: "",
    section: "",
    numeroParcelle: "",
    surfaceTerrain: "",
    natureTravaux: [],
    descriptionProjet: "",
    surfaceCreee: "",
    documents: [],
};

const steps = [
    "Profil",
    "Identité",
    "Coordonnées",
    "Terrain",
    "Projet",
    "Description",
    "Documents",
    "Récapitulatif"
];

export default function DossierOnboarding({
    isOpen,
    onClose,
    onComplete,
}: {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: OnboardingData) => void;
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialData);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const totalSteps = steps.length;

    // Urbania Blue: #002395
    const urbaniaBlue = "#002395";

    useEffect(() => {
        if (isOpen && !hasLoadedOnce) {
            setIsInitialLoading(true);
            const timer = setTimeout(() => {
                setIsInitialLoading(false);
                setHasLoadedOnce(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, hasLoadedOnce]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
        else {
            localStorage.setItem("urbania_onboarding_seen", "true");
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            >
                {/* Backdrop glassmorphism - slightly lighter for the new white/blue theme */}
                <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-3xl" onClick={onClose} />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative w-full max-w-6xl h-[90vh] bg-white/70 backdrop-blur-2xl border border-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-blue-500/5"
                >
                    {/* Decorative Mesh Background - Updated for white/blue theme */}
                    <div className="absolute inset-0 mesh-bg-light opacity-60 pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#002395] hover:bg-[#002395] hover:text-white transition-all border border-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-white/20 backdrop-blur-xl border-r border-slate-100 p-12 flex flex-col justify-between relative z-10 shrink-0">
                        <div>
                            <div className="flex items-center gap-4 mb-16">
                                <div className="w-10 h-10 rounded-xl bg-[#002395] flex items-center justify-center shadow-lg shadow-blue-200/50">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-plus-jakarta font-black tracking-tight text-[#002395] text-xl uppercase">Urbania</span>
                            </div>

                            <div className="space-y-8">
                                {steps.map((stepName, idx) => {
                                    const stepNum = idx + 1;
                                    const isActive = stepNum === currentStep;
                                    const isCompleted = stepNum < currentStep;

                                    return (
                                        <div key={idx} className="flex items-center gap-5 group cursor-pointer" onClick={() => stepNum <= currentStep && setCurrentStep(stepNum)}>
                                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ring-4 ${isActive
                                                ? "h-8 bg-[#002395] ring-[#002395]/10"
                                                : isCompleted
                                                    ? "bg-[#002395]/40 ring-transparent"
                                                    : "bg-slate-200 ring-transparent"
                                                }`} />
                                            <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-300 ${isActive ? "text-[#002395]" : "text-slate-400"
                                                }`}>
                                                {stepName}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-20">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progression du dossier</div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#002395] shadow-[0_0_15px_rgba(0,35,149,0.2)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 relative overflow-y-auto z-10 p-12 md:p-20 scroll-smooth">
                        <AnimatePresence mode="wait">
                            {isInitialLoading ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col"
                                >
                                    {renderSkeleton()}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20, filter: "blur(12px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(12px)" }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex-1">
                                        {renderStep(currentStep, data, setData, urbaniaBlue)}
                                    </div>

                                    {/* Footer Controls */}
                                    <div className="mt-16 flex items-center justify-between gap-8 pt-12 border-t border-slate-100">
                                        <button
                                            onClick={handleBack}
                                            className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all group ${currentStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-[#002395]"
                                                }`}
                                        >
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            Retour
                                        </button>

                                        <button
                                            onClick={handleNext}
                                            className="shimmer-btn bg-[#002395] text-white font-black py-6 px-16 rounded-3xl shadow-2xl shadow-blue-900/10 hover:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 overflow-hidden group"
                                        >
                                            <span className="tracking-[0.2em] uppercase text-xs">
                                                {currentStep === totalSteps ? "Générer mon dossier" : "Continuer"}
                                            </span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Style for the light mesh background */}
                <style jsx global>{`
          .mesh-bg-light {
            background: radial-gradient(at 0% 0%, hsla(225,100%,29%,0.05) 0, transparent 50%),
                        radial-gradient(at 50% 0%, hsla(225,100%,45%,0.03) 0, transparent 50%),
                        radial-gradient(at 100% 0%, hsla(225,100%,20%,0.05) 0, transparent 50%),
                        radial-gradient(at 0% 100%, hsla(225,100%,29%,0.02) 0, transparent 50%),
                        radial-gradient(at 100% 100%, hsla(225,100%,45%,0.03) 0, transparent 50%);
            background-size: 200% 200%;
            animation: mesh-flow 20s ease infinite;
          }
          @keyframes mesh-flow {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
        `}</style>
            </motion.div>
        </AnimatePresence>
    );
}

// Render steps sub-component
function renderStep(step: number, data: OnboardingData, setData: React.Dispatch<React.SetStateAction<OnboardingData>>, color: string) {
    const labelStyle = "text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2 mb-2 block";
    const inputStyle = `w-full bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl px-8 py-5 text-lg font-bold text-[#002395] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#002395] transition-all placeholder:text-slate-400`;

    switch (step) {
        case 1:
            return (
                <div className="max-w-2xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-8">
                        Quel est votre <br />
                        <span className="italic font-light">statut juridique ?</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                        Cette information est cruciale pour déterminer les sections du formulaire CERFA à compléter.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setData({ ...data, typeDeclarant: "particulier" })}
                            className={`glass-tile flex flex-col items-start p-10 rounded-[40px] border-2 text-left transition-all duration-500 group relative overflow-hidden ${data.typeDeclarant === "particulier"
                                ? "bg-white border-[#002395] shadow-2xl shadow-blue-900/5 ring-8 ring-blue-500/5"
                                : "bg-white/40 border-white/60 hover:border-blue-200 hover:bg-white"
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-all ${data.typeDeclarant === "particulier" ? "bg-[#002395] text-white" : "bg-blue-50 text-[#002395]"
                                }`}>
                                <User className="w-7 h-7" />
                            </div>
                            <span className="text-2xl font-black text-[#002395] mb-2">Particulier</span>
                            <span className="text-sm text-slate-400 font-medium leading-relaxed">Personne physique agissant pour son propre compte.</span>
                            {data.typeDeclarant === "particulier" && (
                                <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-[#002395] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setData({ ...data, typeDeclarant: "societe" })}
                            className={`glass-tile flex flex-col items-start p-10 rounded-[40px] border-2 text-left transition-all duration-500 group relative overflow-hidden ${data.typeDeclarant === "societe"
                                ? "bg-white border-[#002395] shadow-2xl shadow-blue-900/5 ring-8 ring-blue-500/5"
                                : "bg-white/40 border-white/60 hover:border-blue-200 hover:bg-white"
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-all ${data.typeDeclarant === "societe" ? "bg-[#002395] text-white" : "bg-blue-50 text-[#002395]"
                                }`}>
                                <Building2 className="w-7 h-7" />
                            </div>
                            <span className="text-2xl font-black text-[#002395] mb-2">Société</span>
                            <span className="text-sm text-slate-400 font-medium leading-relaxed">Personne morale (SCI, SARL, Copropriété, etc.)</span>
                            {data.typeDeclarant === "societe" && (
                                <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-[#002395] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            );

        case 2:
            return (
                <div className="max-w-3xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Identité du <br />
                        <span className="italic font-light">déclarant</span>
                    </h1>

                    <div className="space-y-10">
                        {data.typeDeclarant === "particulier" ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1">
                                        <label className={labelStyle}>Civilité</label>
                                        <select
                                            value={data.civilite}
                                            onChange={(e) => setData({ ...data, civilite: e.target.value })}
                                            className={inputStyle}
                                        >
                                            <option value="M.">Monsieur (M.)</option>
                                            <option value="Mme">Madame (Mme)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className={labelStyle}>Prénom</label>
                                        <input
                                            type="text"
                                            value={data.prenom}
                                            onChange={(e) => setData({ ...data, prenom: e.target.value })}
                                            placeholder="Jean"
                                            className={inputStyle}
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className={labelStyle}>Nom</label>
                                        <input
                                            type="text"
                                            value={data.nom}
                                            onChange={(e) => setData({ ...data, nom: e.target.value })}
                                            placeholder="DUPONT"
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelStyle}>Date de naissance</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="text"
                                                value={data.dateNaissance}
                                                onChange={(e) => setData({ ...data, dateNaissance: e.target.value })}
                                                placeholder="JJ/MM/AAAA"
                                                className={`${inputStyle} pl-16`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Lieu de naissance</label>
                                        <input
                                            type="text"
                                            value={data.lieuNaissance}
                                            onChange={(e) => setData({ ...data, lieuNaissance: e.target.value })}
                                            placeholder="Paris"
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelStyle}>Dénomination</label>
                                        <input
                                            type="text"
                                            value={data.denomination}
                                            onChange={(e) => setData({ ...data, denomination: e.target.value })}
                                            placeholder="SCI Les Oliviers"
                                            className={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>N° SIRET</label>
                                        <input
                                            type="text"
                                            value={data.siret}
                                            onChange={(e) => setData({ ...data, siret: e.target.value })}
                                            placeholder="123 456 789 00012"
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div className="p-10 rounded-[40px] bg-blue-50/50 border border-blue-100/50">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#002395] shadow-sm">
                                            <Contact className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-black text-[#002395] uppercase tracking-widest">Représentant légal</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <input
                                            type="text"
                                            value={data.representantPrenom}
                                            onChange={(e) => setData({ ...data, representantPrenom: e.target.value })}
                                            placeholder="Prénom"
                                            className={inputStyle}
                                        />
                                        <input
                                            type="text"
                                            value={data.representantNom}
                                            onChange={(e) => setData({ ...data, representantNom: e.target.value })}
                                            placeholder="Nom"
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );

        case 3:
            return (
                <div className="max-w-3xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Vos <br />
                        <span className="italic font-light">coordonnées</span>
                    </h1>
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelStyle}>E-mail</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    placeholder="jean.dupont@email.com"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Téléphone</label>
                                <input
                                    type="tel"
                                    value={data.telephone}
                                    onChange={(e) => setData({ ...data, telephone: e.target.value })}
                                    placeholder="06 00 00 00 00"
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Adresse de correspondance</label>
                            <input
                                type="text"
                                value={data.adresse}
                                onChange={(e) => setData({ ...data, adresse: e.target.value })}
                                placeholder="15 rue de la Paix"
                                className={inputStyle}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <label className={labelStyle}>Code Postal</label>
                                <input
                                    type="text"
                                    value={data.codePostal}
                                    onChange={(e) => setData({ ...data, codePostal: e.target.value })}
                                    placeholder="75000"
                                    className={inputStyle}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelStyle}>Ville</label>
                                <input
                                    type="text"
                                    value={data.ville}
                                    onChange={(e) => setData({ ...data, ville: e.target.value })}
                                    placeholder="Paris"
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 4:
            return (
                <div className="max-w-3xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Localisation <br />
                        <span className="italic font-light">du terrain</span>
                    </h1>
                    <div className="space-y-10">
                        <div className="p-8 rounded-[40px] bg-[#002395] text-white overflow-hidden relative shadow-2xl">
                            <div className="absolute top-0 right-0 p-8">
                                <MapPin className="w-10 h-10 text-white/20 animate-bounce" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">Géolocalisation cadastrale</p>
                            <input
                                type="text"
                                value={data.terrainAdresse}
                                onChange={(e) => setData({ ...data, terrainAdresse: e.target.value })}
                                placeholder="Entrez l'adresse des travaux"
                                className="w-full bg-transparent border-none text-2xl font-black focus:outline-none placeholder:text-white/20 mb-4"
                            />
                            <div className="flex gap-4">
                                <div className="px-5 py-2 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/10">Analyse en cours</div>
                                <div className="px-5 py-2 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/10">PLU V3.0</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className={labelStyle}>Section</label>
                                <input
                                    type="text"
                                    value={data.section}
                                    onChange={(e) => setData({ ...data, section: e.target.value })}
                                    placeholder="AB"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Parcelle</label>
                                <input
                                    type="text"
                                    value={data.numeroParcelle}
                                    onChange={(e) => setData({ ...data, numeroParcelle: e.target.value })}
                                    placeholder="124"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Surface (m²)</label>
                                <input
                                    type="text"
                                    value={data.surfaceTerrain}
                                    onChange={(e) => setData({ ...data, surfaceTerrain: e.target.value })}
                                    placeholder="500"
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 5:
            const natureItems = [
                { id: "piscine", label: "Piscine", icon: "🏊" },
                { id: "abri", label: "Abri de jardin", icon: "🏡" },
                { id: "cloture", label: "Clôture / Mur", icon: "🚧" },
                { id: "garage", label: "Garage", icon: "🚗" },
                { id: "veranda", label: "Véranda", icon: "☀️" },
                { id: "ravalement", label: "Ravalement", icon: "🎨" },
                { id: "extension", label: "Extension", icon: "➕" },
                { id: "autre", label: "Autre projet", icon: "✨" },
            ];
            return (
                <div className="max-w-4xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Nature du <br />
                        <span className="italic font-light">projet</span>
                    </h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {natureItems.map((item) => {
                            const selected = data.natureTravaux.includes(item.label);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        const next = selected
                                            ? data.natureTravaux.filter((t) => t !== item.label)
                                            : [...data.natureTravaux, item.label];
                                        setData({ ...data, natureTravaux: next });
                                    }}
                                    className={`flex flex-col items-center justify-center p-8 rounded-[40px] border-2 transition-all duration-500 group ${selected
                                        ? "bg-white border-[#002395] shadow-xl scale-[1.05]"
                                        : "bg-white/40 border-transparent hover:bg-white"
                                        }`}
                                >
                                    <span className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{item.icon}</span>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${selected ? "text-[#002395]" : "text-slate-400"}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );

        case 6:
            return (
                <div className="max-w-3xl h-full flex flex-col">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Description <br />
                        <span className="italic font-light">détaillée</span>
                    </h1>
                    <div className="flex-1 space-y-8">
                        <div className="relative group flex-1 min-h-[300px]">
                            <div className="absolute top-8 right-8">
                                <Sparkles className="w-8 h-8 text-blue-200 animate-pulse" />
                            </div>
                            <textarea
                                value={data.descriptionProjet}
                                onChange={(e) => setData({ ...data, descriptionProjet: e.target.value })}
                                placeholder="Décrivez votre projet avec l'IA Urbania..."
                                className="w-full h-full bg-white/60 backdrop-blur-xl border border-white rounded-[40px] p-12 text-xl font-medium text-[#002395] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-[#002395] transition-all placeholder:text-slate-200 resize-none shadow-2xl shadow-blue-900/5"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelStyle}>Surface totale créée (m²)</label>
                                <div className="relative">
                                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        value={data.surfaceCreee}
                                        onChange={(e) => setData({ ...data, surfaceCreee: e.target.value })}
                                        placeholder="Ex: 20"
                                        className={`${inputStyle} pl-16`}
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 font-bold text-slate-300">m²</span>
                                </div>
                            </div>
                            <div className="p-8 rounded-[40px] bg-blue-50/50 flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#002395] shadow-sm shrink-0">
                                    <Info className="w-6 h-6" />
                                </div>
                                <p className="text-[11px] font-bold text-[#002395]/60 leading-relaxed uppercase tracking-wider">
                                    L'IA utilisera cette description pour automatiser le plan de masse DP2.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 7:
            return (
                <div className="max-w-3xl">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Pièces <br />
                        <span className="italic font-light">jointes</span>
                    </h1>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="border-4 border-dashed border-slate-100 rounded-[48px] p-16 text-center hover:border-blue-400/30 transition-all group bg-white/40 cursor-pointer">
                            <div className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-[#002395] transition-all duration-500">
                                <Paperclip className="w-10 h-10 text-[#002395] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-3xl font-black text-[#002395] mb-4">Glissez vos fichiers</h3>
                            <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed mb-10">
                                Photos de l'existant, plans de masse ou croquis à main levée (PDF, JPEG, PNG).
                            </p>
                            <div className="inline-flex items-center gap-4 px-10 py-5 bg-white text-[#002395] rounded-3xl font-black shadow-xl shadow-blue-900/5 hover:bg-slate-50 border border-slate-50 transition-all uppercase text-xs tracking-widest">
                                Parcourir mes documents
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 8:
            return (
                <div className="max-w-4xl text-center md:text-left">
                    <h1 className="font-serif text-5xl md:text-6xl text-[#002395] leading-[1.1] mb-12">
                        Votre dossier est <br />
                        <span className="italic font-light">prêt à éclore.</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-12 rounded-[48px] bg-[#002395] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-md flex items-center justify-center mb-8">
                                    <Sparkles className="w-8 h-8 text-blue-300" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight">Intelligence Urbania</h3>
                                <p className="text-blue-100/60 font-medium leading-relaxed">Nous avons compilé vos données avec le cadastre national pour générer un CERFA 13404*10 conforme.</p>
                            </div>
                        </div>

                        <div className="p-12 rounded-[48px] bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center mb-8">
                                    <CheckCircle2 className="w-8 h-8 text-[#002395]" />
                                </div>
                                <h3 className="text-2xl font-black text-[#002395] mb-4 tracking-tight">Vérification Légale</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">Votre projet a été pré-validé par notre moteur de règles d'urbanisme basé sur l'article R. 421-17.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-4 text-[#002395] font-black uppercase tracking-[0.3em] text-[11px]">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                            Système Urbania • Connecté au serveur national
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
}

function renderSkeleton() {
    return (
        <div className="max-w-2xl animate-pulse">
            <div className="h-16 w-3/4 bg-slate-100 rounded-3xl mb-8" />
            <div className="h-6 w-full bg-slate-50 rounded-full mb-4" />
            <div className="h-6 w-2/3 bg-slate-50 rounded-full mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-white/40 border-2 border-slate-50 rounded-[40px] p-10 flex flex-col gap-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                        <div className="h-6 w-1/2 bg-slate-100 rounded-full" />
                        <div className="h-4 w-3/4 bg-slate-50 rounded-full" />
                    </div>
                ))}
            </div>

            <div className="mt-16 pt-12 border-t border-slate-50 flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-100 rounded-full" />
                <div className="h-16 w-48 bg-[#002395]/10 rounded-3xl" />
            </div>
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ArrowLeft,
    Check,
    FileText,
    Sparkles,
    User,
    Building2,
    MapPin,
    Hammer,
    Layers,
    Paperclip,
    CheckCircle2,
    Info,
    Search,
    Calendar,
    Contact,
    ShieldCheck,
    Download
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import { useI18n } from '../../context/I18nContext';
import { validateStep } from '../../utils/validation';
import { generateCerfaPDF } from '../../utils/pdfGenerator';
import { Button } from '../ui/button';

import { useToast } from '../ui/use-toast';

// Import all step components (we'll need to update these to match the new look)
import Step1TypeDeclarant from '../Steps/Step1TypeDeclarant';
import Step2IdentiteDeclarant from '../Steps/Step2IdentiteDeclarant';
import Step3Coordonnees from '../Steps/Step3Coordonnees';
import Step4Terrain from '../Steps/Step4Terrain';
import Step5TypeTravaux from '../Steps/Step5TypeTravaux';
import Step6DescriptionProjet from '../Steps/Step6DescriptionProjet';
import Step7Surfaces from '../Steps/Step7Surfaces';
import Step8PiecesJointes from '../Steps/Step8PiecesJointes';
import Step9Engagements from '../Steps/Step9Engagements';
import Step10Recapitulatif from '../Steps/Step10Recapitulatif';
import CadastreGenerator from '../Common/CadastreGenerator';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

const ALL_STEPS = [
    { id: 1, component: Step1TypeDeclarant, title: 'Profil', key: 'declarant', icon: User, alwaysShow: true },
    { id: 2, component: Step2IdentiteDeclarant, title: 'Identité', key: 'identite', icon: Contact, alwaysShow: true },
    { id: 3, component: Step3Coordonnees, title: 'Coordonnées', key: 'coordonnees', icon: Hammer, alwaysShow: true },
    { id: 4, component: Step4Terrain, title: 'Terrain', key: 'terrain', icon: MapPin, alwaysShow: true },
    { id: 5, component: Step5TypeTravaux, title: 'Projet', key: 'travaux', icon: Sparkles, alwaysShow: true },
    { id: 6, component: Step6DescriptionProjet, title: 'Description', key: 'description', icon: FileText, alwaysShow: true },
    { id: 7, component: Step7Surfaces, title: 'Surfaces', key: 'surfaces', icon: Layers, requiresSection: 'surfaces' },
    { id: 8, component: Step8PiecesJointes, title: 'Documents', key: 'pieces', icon: Paperclip, alwaysShow: true },
    { id: 9, component: Step9Engagements, title: 'Engagement', key: 'engagements', icon: ShieldCheck, alwaysShow: true },
    { id: 10, component: Step10Recapitulatif, title: 'Récapitulatif', key: 'recap', icon: CheckCircle2, alwaysShow: true },
];

export default function Wizard() {
    const { currentStep, data, setErrors, nextStep, prevStep, goToStep, getProgress, loadDossier, projectConfig } = useForm();
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);


    // Urbania Blue: #002395
    const urbaniaBlue = "#002395";

    // Filtering steps based on project config
    const filteredSteps = useMemo(() => {
        const pdfSections = projectConfig?.pdfSections || [];
        const hasSelectedType = data.natureTravaux && data.natureTravaux.length > 0;

        return ALL_STEPS.filter(step => {
            if (step.alwaysShow) return true;
            if (!hasSelectedType) return true;
            if (step.requiresSection) {
                return pdfSections.includes(step.requiresSection);
            }
            return true;
        });
    }, [projectConfig, data.natureTravaux]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('id');
        if (id) {
            loadDossier(id);
        }
    }, [location.search, loadDossier]);

    const handleNext = () => {
        const errors = validateStep(currentStep, data);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            toast({
                variant: "destructive",
                title: "Information manquante",
                description: "Veuillez vérifier les champs obligatoires.",
            });
            return;
        }
        setErrors({});
        nextStep();
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/dossiers/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data, status: 'completed' }),
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

            await generateCerfaPDF(data);

            toast({
                title: "Dossier généré !",
                description: "Votre CERFA est prêt et a été sauvegardé.",
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Une erreur est survenue lors de la génération.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const currentStepInfo = filteredSteps[currentStep] || filteredSteps[0];
    const StepComponent = currentStepInfo.component;
    const isLastStep = currentStep === filteredSteps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/50 backdrop-blur-3xl p-0 md:p-8 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 mesh-bg-light opacity-40 pointer-events-none" />
            <CadastreGenerator />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-7xl h-full md:h-[90vh] bg-white/70 backdrop-blur-2xl border border-white md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-blue-500/5"

            >
                {/* Close Button / Dashboard Link */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#002395] hover:bg-[#002395] hover:text-white transition-all border border-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Sidebar */}
                <div className="hidden md:flex w-80 bg-white/20 backdrop-blur-xl border-r border-slate-100 p-10 flex-col justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-8 h-8 rounded-lg bg-[#002395] flex items-center justify-center shadow-lg shadow-blue-200/50">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold tracking-tight text-[#002395] text-lg uppercase">Urbania</span>
                        </div>

                        <div className="space-y-6">
                            {filteredSteps.map((step, idx) => {
                                const isActive = idx === currentStep;
                                const isCompleted = idx < currentStep;

                                return (
                                    <div
                                        key={step.id}
                                        className="flex items-center gap-4 group cursor-pointer"
                                        onClick={() => idx <= currentStep && goToStep(idx)}
                                    >
                                        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive
                                            ? "h-6 bg-[#002395] ring-4 ring-[#002395]/10"
                                            : isCompleted
                                                ? "bg-[#002395]/40"
                                                : "bg-slate-200"
                                            }`} />
                                        <div className="flex items-center gap-2">
                                            <step.icon className={`w-4 h-4 ${isActive ? "text-[#002395]" : "text-slate-400"}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-[#002395]" : "text-slate-400"
                                                }`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Progression du dossier</div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#002395]"
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgress()}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/30">
                    <div className="flex-1 overflow-y-auto p-10 md:p-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="max-w-5xl mx-auto"
                            >
                                <header className="mb-10">
                                    <h1 className="text-4xl md:text-5xl font-black text-[#002395] leading-tight tracking-tight mb-4">
                                        {t(currentStepInfo.title)}
                                    </h1>
                                    <p className="text-slate-400 text-lg font-medium">
                                        {t(`wizard.step${currentStep + 1}.subtitle`)}
                                    </p>
                                </header>

                                <div className="wizard-step-container">
                                    <StepComponent />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-8 border-t border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-[#002395]"
                                }`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </button>

                        <div className="flex items-center gap-4">
                            {!isLastStep ? (
                                <button
                                    onClick={handleNext}
                                    className="bg-[#002395] text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                                >
                                    <span className="tracking-widest uppercase text-[10px]">Continuer</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="bg-emerald-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                                >
                                    <span className="tracking-widest uppercase text-[10px]">
                                        {isGenerating ? "Génération..." : "Générer mon dossier"}
                                    </span>
                                    {!isGenerating && <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>


            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mesh-bg-light {
                    background: radial-gradient(at 0% 0%, hsla(225,100%,29%,0.1) 0, transparent 50%),
                                radial-gradient(at 50% 0%, hsla(225,100%,45%,0.05) 0, transparent 50%),
                                radial-gradient(at 100% 0%, hsla(225,100%,20%,0.1) 0, transparent 50%);
                }
                .wizard-step-container .MuiPaper-root {
                  background: white !important;
                  border-radius: 24px !important;
                  border: 1px solid #f1f5f9 !important;
                  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.04) !important;
                }
                .wizard-step-container .MuiTypography-root {
                  font-family: inherit !important;
                }
            `}} />
        </div>
    );
}

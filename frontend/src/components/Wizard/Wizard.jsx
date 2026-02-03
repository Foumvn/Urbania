import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Paper, Grid, Snackbar, Alert, Typography, Chip, Fade, Button } from '@mui/material';
import { useForm } from '../../context/FormContext';
import { validateStep } from '../../utils/validation';
import { generateCerfaPDF } from '../../utils/pdfGenerator';
import StepNavigation from './StepNavigation';
import CerfaOfficialPreview from '../Preview/CerfaOfficialPreview';
import { useI18n } from '../../context/I18nContext';

// Import all step components
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
import Step11CadastralPlan from '../Steps/Step11CadastralPlan';
import VerticalStepper from './VerticalStepper';

// Configuration des étapes avec conditions d'affichage
const ALL_STEPS = [
    { component: Step1TypeDeclarant, title: 'wizard.step1.title', subtitle: 'wizard.step1.subtitle', key: 'declarant', alwaysShow: true },
    { component: Step2IdentiteDeclarant, title: 'wizard.step2.title', subtitle: 'wizard.step2.subtitle', key: 'identite', alwaysShow: true },
    { component: Step3Coordonnees, title: 'wizard.step3.title', subtitle: 'wizard.step3.subtitle', key: 'coordonnees', alwaysShow: true },
    { component: Step4Terrain, title: 'wizard.step4.title', subtitle: 'wizard.step4.subtitle', key: 'terrain', alwaysShow: true },
    { component: Step5TypeTravaux, title: 'wizard.step5.title', subtitle: 'wizard.step5.subtitle', key: 'travaux', alwaysShow: true },
    { component: Step6DescriptionProjet, title: 'wizard.step6.title', subtitle: 'wizard.step6.subtitle', key: 'description', alwaysShow: true },
    { component: Step7Surfaces, title: 'wizard.step7.title', subtitle: 'wizard.step7.subtitle', key: 'surfaces', requiresSection: 'surfaces' },
    { component: Step8PiecesJointes, title: 'wizard.step8.title', subtitle: 'wizard.step8.subtitle', key: 'pieces', alwaysShow: true },
    { component: Step9Engagements, title: 'wizard.step9.title', subtitle: 'wizard.step9.subtitle', key: 'engagements', alwaysShow: true },
    { component: Step11CadastralPlan, title: 'wizard.step11.title', subtitle: 'wizard.step11.subtitle', key: 'cadastre', alwaysShow: true },
    { component: Step10Recapitulatif, title: 'wizard.step10.title', subtitle: 'wizard.step10.subtitle', key: 'recap', alwaysShow: true },
];


function Wizard() {
    const { currentStep, data, setErrors, nextStep, prevStep, goToStep, getProgress, loadDossier, projectConfig } = useForm();
    const { t } = useI18n();
    const location = useLocation();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(window.innerWidth > 1200);

    // Calcule les étapes filtrées selon le type de projet
    const { filteredSteps, stepComponents, stepTitles } = useMemo(() => {
        // Récupérer les sections PDF du projectConfig (ex: ['terrain', 'surfaces', 'description'])
        const pdfSections = projectConfig?.pdfSections || [];

        // Avant la sélection du type de travaux (étape 5), afficher toutes les étapes
        // Après, filtrer selon le type sélectionné
        const hasSelectedType = data.natureTravaux && data.natureTravaux.length > 0;

        const filtered = ALL_STEPS.filter(step => {
            // Toujours afficher les étapes marquées 'alwaysShow'
            if (step.alwaysShow) return true;

            // Si aucun type n'est sélectionné, afficher toutes les étapes
            if (!hasSelectedType) return true;

            // Si l'étape nécessite une section spécifique du PDF
            if (step.requiresSection) {
                return pdfSections.includes(step.requiresSection);
            }

            return true;
        });

        return {
            filteredSteps: filtered,
            stepComponents: filtered.map(s => s.component),
            stepTitles: filtered.map(s => ({ title: s.title, subtitle: s.subtitle }))
        };
    }, [projectConfig, data.natureTravaux]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('id');
        if (id) {
            loadDossier(id);
        }
    }, [location.search]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1200) setShowPreview(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Utiliser l'index courant dans la liste filtrée
    const effectiveStep = Math.min(currentStep, stepComponents.length - 1);
    const StepComponent = stepComponents[effectiveStep];
    const isLastStep = effectiveStep === stepComponents.length - 1;
    const currentStepInfo = stepTitles[effectiveStep];
    const progress = getProgress();


    const handleNext = () => {
        const errors = validateStep(currentStep, data);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setSnackbar({
                open: true,
                message: 'Veuillez corriger les erreurs avant de continuer',
                severity: 'error',
            });
            return;
        }
        setErrors({});
        nextStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        setErrors({});
        prevStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/sessions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, currentStep }),
            });

            if (response.ok) {
                const result = await response.json();
                setSnackbar({
                    open: true,
                    message: `Brouillon sauvegardé avec succès !`,
                    severity: 'success',
                });
            } else {
                throw new Error('Erreur serveur');
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Brouillon sauvegardé localement',
                severity: 'info',
            });
        }
    };

    const handleGenerate = async () => {
        let allErrors = {};
        for (let i = 0; i < stepComponents.length - 1; i++) {
            const stepErrors = validateStep(i, data);
            allErrors = { ...allErrors, ...stepErrors };
        }

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            setSnackbar({
                open: true,
                message: 'Veuillez compléter tous les champs requis',
                severity: 'error',
            });
            return;
        }

        setIsGenerating(true);
        try {
            // Save to backend
            const token = localStorage.getItem('urbania_token');
            const response = await fetch('/api/dossiers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data, status: 'completed' }),
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde du dossier');

            // Generate PDF
            console.log('Génération du PDF en cours...');
            await generateCerfaPDF(data);

            setSnackbar({
                open: true,
                message: 'Félicitations ! Votre dossier a été enregistré et votre PDF est en cours de téléchargement.',
                severity: 'success',
            });

            // Redirect to dashboard after a longer delay to let user see the toast
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 4000);

        } catch (error) {
            console.error('Erreur:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la génération du dossier',
                severity: 'error',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 1.5, md: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, mb: 0.5 }}>
                                <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                                    {t(currentStepInfo.title)}
                                </Typography>
                                <Chip
                                    label={`Étape ${currentStep + 1}/${stepComponents.length}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 20
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.8rem' }}>
                                {t(currentStepInfo.subtitle)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setShowPreview(!showPreview)}
                                sx={{ borderRadius: 2, fontSize: '0.75rem', py: 0.5 }}
                            >
                                {showPreview ? (t('preview.hide') || 'Cacher l\'aperçu') : (t('preview.show') || 'Voir l\'aperçu')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Overleaf-Style Content Layout */}
            <Box sx={{
                height: 'calc(100vh - 73px)', // Height minus header
                display: 'flex',
                overflow: 'hidden',
                bgcolor: '#f1f3f4'
            }}>
                {/* Left Column: Compact Stepper Sidebar */}
                <Box sx={{
                    width: { xs: 0, lg: 240 },
                    display: { xs: 'none', lg: 'block' },
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflowY: 'auto',
                    flexShrink: 0
                }}>
                    <VerticalStepper
                        currentStep={currentStep}
                        steps={stepTitles}
                        onStepClick={goToStep}
                    />
                </Box>

                {/* Center Column: Form Section */}
                <Box sx={{
                    flex: showPreview ? 1 : 2,
                    overflowY: 'auto',
                    p: { xs: 2, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Fade in key={currentStep}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: 800,
                                p: { xs: 3, md: 5 },
                                borderRadius: 3,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                mb: 4,
                                boxShadow: (theme) => `0 4px 20px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.1)'}`,
                            }}
                        >
                            <StepComponent />

                            <Box sx={{ mt: 5 }}>
                                <StepNavigation
                                    currentStep={currentStep}
                                    totalSteps={stepComponents.length}
                                    onNext={handleNext}
                                    onPrev={handlePrev}
                                    onSave={handleSave}
                                    onGenerate={handleGenerate}
                                    isLastStep={isLastStep}
                                    isValid={!isGenerating}
                                />
                            </Box>
                        </Paper>
                    </Fade>
                </Box>

                {/* Right Column: Preview Section (The "Overleaf PDF" side) */}
                {showPreview && (
                    <Box sx={{
                        width: { xs: '100%', lg: '45%' },
                        height: '100%',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        bgcolor: '#2c3e50', // Dark background for contrast
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CerfaOfficialPreview data={data} currentStep={currentStep} />
                    </Box>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        fontWeight: 500,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Wizard;

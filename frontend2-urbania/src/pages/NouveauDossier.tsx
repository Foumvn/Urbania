import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  Ruler,
  FileText,
  Sparkles,
  Save,
  Eye,
  AlertCircle,
  User,
  Paperclip,
  Shield,
  Map,
  ClipboardCheck,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import wizard steps
import WizardStepDeclarant from "@/components/wizard/WizardStepDeclarant";
import WizardStepProject from "@/components/wizard/WizardStepProject";
import WizardStepLocation from "@/components/wizard/WizardStepLocation";
import WizardStepDimensions from "@/components/wizard/WizardStepDimensions";
import WizardStepPieces from "@/components/wizard/WizardStepPieces";
import WizardStepEngagement from "@/components/wizard/WizardStepEngagement";
import WizardStepCadastre from "@/components/wizard/WizardStepCadastre";
import WizardStepRecap from "@/components/wizard/WizardStepRecap";
import WizardPreview from "@/components/wizard/WizardPreview";

// Import validations
import {
  declarantStepSchema,
  projectStepSchema,
  locationStepSchema,
  dimensionsStepSchema,
  piecesStepSchema,
  engagementStepSchema,
  validateStep,
} from "@/lib/validations";

// Import PDF generator
import { generateCerfaPDF, downloadPDF } from "@/lib/pdfGenerator";

export interface CerfaFormData {
  // Étape 1: Déclarant
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerPostalCode: string;
  ownerCity: string;

  // Étape 2: Nature des travaux
  projectType: string;
  projectDescription: string;

  // Étape 3: Localisation du terrain
  address: string;
  postalCode: string;
  city: string;
  cadastralReference: string;
  codeInsee: string;

  // Étape 4: Dimensions
  existingSurface: string;
  newSurface: string;
  totalHeight: string;
  groundFootprint: string;

  // Étape 5: Pièces à joindre
  pieces: {
    dp1: File | null;
    dp2: File | null;
    dp3: File | null;
    dp4: File | null;
    dp5: File | null;
    dp6: File | null;
    dp7: File | null;
    dp8: File | null;
  };
  piecesRequired: string[];

  // Étape 6: Engagement
  engagementAccepted: boolean;
  engagementSignature: string;
  engagementDate: string;
}

const initialFormData: CerfaFormData = {
  // Déclarant
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerAddress: "",
  ownerPostalCode: "",
  ownerCity: "",
  // Projet
  projectType: "",
  projectDescription: "",
  // Localisation
  address: "",
  postalCode: "",
  city: "",
  cadastralReference: "",
  codeInsee: "",
  // Dimensions
  existingSurface: "",
  newSurface: "",
  totalHeight: "",
  groundFootprint: "",
  // Pièces
  pieces: {
    dp1: null,
    dp2: null,
    dp3: null,
    dp4: null,
    dp5: null,
    dp6: null,
    dp7: null,
    dp8: null,
  },
  piecesRequired: [],
  // Engagement
  engagementAccepted: false,
  engagementSignature: "",
  engagementDate: new Date().toISOString().split('T')[0],
};

const steps = [
  { id: 1, title: "Déclarant", icon: User, description: "Vos coordonnées" },
  { id: 2, title: "Projet", icon: Home, description: "Type de travaux" },
  { id: 3, title: "Localisation", icon: MapPin, description: "Adresse du terrain" },
  { id: 4, title: "Dimensions", icon: Ruler, description: "Surfaces et mesures" },
  { id: 5, title: "Pièces", icon: Paperclip, description: "Documents DP1-DP8" },
  { id: 6, title: "Engagement", icon: Shield, description: "Déclaration" },
  { id: 7, title: "Cadastre", icon: Map, description: "Plan cadastral" },
  { id: 8, title: "Récapitulatif", icon: ClipboardCheck, description: "Vérification finale" },
];

const NouveauDossier = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CerfaFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = useCallback((field: keyof CerfaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateCurrentStep = useCallback((): boolean => {
    let result;

    switch (currentStep) {
      case 1:
        result = validateStep(declarantStepSchema, {
          ownerLastName: formData.ownerLastName,
          ownerFirstName: formData.ownerFirstName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          ownerAddress: formData.ownerAddress,
          ownerPostalCode: formData.ownerPostalCode,
          ownerCity: formData.ownerCity,
        });
        break;
      case 2:
        result = validateStep(projectStepSchema, {
          projectType: formData.projectType,
          projectDescription: formData.projectDescription,
        });
        break;
      case 3:
        result = validateStep(locationStepSchema, {
          address: formData.address,
          postalCode: formData.postalCode,
          city: formData.city,
          cadastralReference: formData.cadastralReference,
        });
        break;
      case 4:
        result = validateStep(dimensionsStepSchema, {
          existingSurface: formData.existingSurface,
          newSurface: formData.newSurface,
          totalHeight: formData.totalHeight,
          groundFootprint: formData.groundFootprint,
        });
        break;
      case 5:
        result = validateStep(piecesStepSchema, {
          piecesRequired: formData.piecesRequired,
        });
        break;
      case 6:
        result = validateStep(engagementStepSchema, {
          engagementAccepted: formData.engagementAccepted,
          engagementSignature: formData.engagementSignature,
          engagementDate: formData.engagementDate,
        });
        break;
      case 7:
      case 8:
        return true;
      default:
        return true;
    }

    setErrors(result.errors);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
      });
    }

    return result.success;
  }, [currentStep, formData, toast]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  }, [validateCurrentStep, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      setErrors({});
      return;
    }

    if (stepId > currentStep && validateCurrentStep()) {
      setCurrentStep(stepId);
      setErrors({});
    }
  }, [currentStep, validateCurrentStep]);

  const handleSubmit = useCallback(async () => {
    setIsGeneratingPDF(true);

    try {
      // 1. Save to backend
      try {
        await api.post('/dossiers/', {
          data: formData,
          status: 'completed'
        });

        toast({
          title: "Dossier sauvegardé",
          description: "Votre dossier a été enregistré sur votre compte.",
        });
      } catch (apiError) {
        console.error("Failed to save dossier to backend:", apiError);
        // Continue to PDF generation even if save fails, but warn user?
        // Or maybe stop? For now, we continue but log it.
        toast({
          variant: "destructive",
          title: "Attention",
          description: "Le dossier n'a pas pu être sauvegardé en ligne, mais le PDF va être généré.",
        });
      }

      // 2. Generate PDF (Client side for now)
      const pdfBlob = await generateCerfaPDF(formData);
      downloadPDF(pdfBlob, `cerfa-dp-${Date.now()}.pdf`);

      toast({
        title: "CERFA généré avec succès ! 🎉",
        description: "Votre déclaration préalable a été téléchargée.",
      });

      // Clear draft
      localStorage.removeItem("cerfa_draft");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData, toast, navigate]);

  const handleSaveDraft = useCallback(() => {
    const dataToSave = { ...formData };
    // Remove file objects before saving to localStorage
    dataToSave.pieces = {
      dp1: null, dp2: null, dp3: null, dp4: null,
      dp5: null, dp6: null, dp7: null, dp8: null,
    };
    localStorage.setItem("cerfa_draft", JSON.stringify(dataToSave));
    toast({
      title: "Brouillon sauvegardé",
      description: "Vous pouvez reprendre votre dossier plus tard.",
    });
  }, [formData, toast]);

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-card border-b border-border shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Urbania</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Sauvegarder</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 lg:hidden"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Étape {currentStep} sur {steps.length}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(progress)}% complété
            </span>
            {hasErrors && (
              <span className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Erreurs à corriger
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step indicators - scrollable on mobile */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex items-center gap-2 cursor-pointer shrink-0"
                onClick={() => goToStep(step.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs
                  ${currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-xs hidden md:block ${currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* AI Assistant Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Assistant IA Urbania</p>
                    <p className="text-sm text-muted-foreground">
                      Je vous guide étape par étape pour remplir votre CERFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <WizardStepDeclarant
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 2 && (
                    <WizardStepProject
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 3 && (
                    <WizardStepLocation
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 4 && (
                    <WizardStepDimensions
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 5 && (
                    <WizardStepPieces
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 6 && (
                    <WizardStepEngagement
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 7 && (
                    <WizardStepCadastre
                      formData={formData}
                      updateFormData={updateFormData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 8 && (
                    <WizardStepRecap
                      formData={formData}
                      onGoToStep={goToStep}
                      onGeneratePDF={handleSubmit}
                      isGeneratingPDF={isGeneratingPDF}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="px-6 md:px-8 py-4 bg-muted/30 border-t border-border">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  {currentStep < steps.length ? (
                    <Button onClick={nextStep} className="gap-2">
                      Suivant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isGeneratingPDF}
                      className="gap-2"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Générer mon CERFA
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Preview Section */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="sticky top-28">
                  <WizardPreview formData={formData} currentStep={currentStep} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default NouveauDossier;

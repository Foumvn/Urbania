import { motion } from "framer-motion";
import { 
  FileText, 
  Check, 
  Edit3, 
  User, 
  Home, 
  MapPin, 
  Ruler, 
  Paperclip,
  Shield,
  Map,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CerfaFormData } from "@/pages/NouveauDossier";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  onGoToStep: (step: number) => void;
  onGeneratePDF: () => void;
  isGeneratingPDF: boolean;
}

const projectTypeLabels: Record<string, string> = {
  extension: "Extension maison",
  piscine: "Piscine",
  abri: "Abri de jardin",
  carport: "Carport / Garage",
  cloture: "Clôture / Portail",
  terrasse: "Terrasse",
  facade: "Ravalement façade",
};

const WizardStepRecap = ({ formData, onGoToStep, onGeneratePDF, isGeneratingPDF }: Props) => {
  const sections = [
    {
      step: 1,
      title: "Coordonnées du déclarant",
      icon: User,
      isComplete: !!(formData.ownerLastName && formData.ownerFirstName && formData.ownerEmail),
      fields: [
        { label: "Nom", value: `${formData.ownerFirstName || ""} ${formData.ownerLastName || ""}`.trim() },
        { label: "Email", value: formData.ownerEmail },
        { label: "Téléphone", value: formData.ownerPhone },
        { label: "Adresse", value: formData.ownerAddress ? `${formData.ownerAddress}, ${formData.ownerPostalCode} ${formData.ownerCity}` : null },
      ],
    },
    {
      step: 2,
      title: "Nature des travaux",
      icon: Home,
      isComplete: !!formData.projectType,
      fields: [
        { label: "Type de projet", value: projectTypeLabels[formData.projectType] || formData.projectType },
        { label: "Description", value: formData.projectDescription },
      ],
    },
    {
      step: 3,
      title: "Localisation du terrain",
      icon: MapPin,
      isComplete: !!(formData.address && formData.city && formData.postalCode),
      fields: [
        { label: "Adresse", value: formData.address ? `${formData.address}, ${formData.postalCode} ${formData.city}` : null },
        { label: "Code INSEE", value: formData.codeInsee },
        { label: "Réf. cadastrale", value: formData.cadastralReference },
      ],
    },
    {
      step: 4,
      title: "Surfaces et dimensions",
      icon: Ruler,
      isComplete: !!formData.newSurface,
      fields: [
        { label: "Surface existante", value: formData.existingSurface ? `${formData.existingSurface} m²` : null },
        { label: "Surface créée", value: formData.newSurface ? `${formData.newSurface} m²` : null },
        { label: "Hauteur totale", value: formData.totalHeight ? `${formData.totalHeight} m` : null },
        { label: "Emprise au sol", value: formData.groundFootprint ? `${formData.groundFootprint} m²` : null },
      ],
    },
    {
      step: 5,
      title: "Pièces à joindre",
      icon: Paperclip,
      isComplete: (formData.piecesRequired?.length || 0) > 0,
      fields: [
        { 
          label: "Pièces sélectionnées", 
          value: formData.piecesRequired?.length 
            ? `${formData.piecesRequired.length} pièce(s) : ${formData.piecesRequired.map(p => p.toUpperCase()).join(", ")}`
            : null 
        },
      ],
    },
    {
      step: 6,
      title: "Engagement",
      icon: Shield,
      isComplete: !!(formData.engagementAccepted && formData.engagementSignature),
      fields: [
        { label: "Déclaration", value: formData.engagementAccepted ? "Acceptée" : "Non acceptée" },
        { label: "Signature", value: formData.engagementSignature },
        { label: "Date", value: formData.engagementDate },
      ],
    },
    {
      step: 7,
      title: "Plan cadastral",
      icon: Map,
      isComplete: !!(formData.cadastralReference || formData.codeInsee),
      fields: [
        { label: "Référence", value: formData.cadastralReference },
        { label: "Code INSEE", value: formData.codeInsee },
      ],
    },
  ];

  const allComplete = sections.every(s => s.isComplete);
  const completedCount = sections.filter(s => s.isComplete).length;

  return (
    <motion.div
      key="step-recap"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Récapitulatif de votre dossier
        </h2>
        <p className="text-muted-foreground">
          Vérifiez vos informations avant de générer le CERFA
        </p>
      </div>

      {/* Completion status */}
      <motion.div 
        className={cn(
          "rounded-xl p-4 mb-6 border",
          allComplete 
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            allComplete ? "bg-green-500" : "bg-amber-500"
          )}>
            {allComplete ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <FileText className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className={cn(
              "font-semibold",
              allComplete ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"
            )}>
              {allComplete ? "Dossier complet !" : `${completedCount}/${sections.length} sections complétées`}
            </p>
            <p className={cn(
              "text-sm",
              allComplete ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
            )}>
              {allComplete 
                ? "Vous pouvez générer votre CERFA" 
                : "Complétez les sections manquantes pour continuer"
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sections grid */}
      <div className="space-y-3 mb-8">
        {sections.map((section) => (
          <motion.div
            key={section.step}
            className={cn(
              "rounded-xl border p-4 transition-all",
              section.isComplete 
                ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
                : "border-border"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: section.step * 0.05 }}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                section.isComplete 
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {section.isComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <section.icon className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGoToStep(section.step)}
                    className="gap-1 h-8 px-2 text-xs"
                  >
                    <Edit3 className="h-3 w-3" />
                    Modifier
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {section.fields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground shrink-0">{field.label}:</span>
                      <span className={cn(
                        "truncate",
                        field.value ? "text-foreground" : "text-muted-foreground/50 italic"
                      )}>
                        {field.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generate button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={onGeneratePDF}
          disabled={!allComplete || isGeneratingPDF}
          className="w-full gap-2 h-14 text-lg"
          size="lg"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Générer mon CERFA
            </>
          )}
        </Button>
        
        {!allComplete && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Veuillez compléter toutes les sections pour activer la génération
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WizardStepRecap;

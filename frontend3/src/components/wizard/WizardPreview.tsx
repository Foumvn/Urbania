import { motion } from "framer-motion";
import {
  FileText,
  Check,
  Circle,
  User,
  MapPin,
  Ruler,
  ClipboardList,
  ChevronRight,
  Paperclip,
  Shield,
  Map,
  ClipboardCheck
} from "lucide-react";
import { CerfaFormData } from "@/lib/pdfGenerator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  currentStep: number;
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

const WizardPreview = ({ formData, currentStep }: Props) => {
  const calculateSectionCompletion = (step: number): number => {
    switch (step) {
      case 1:
        const declarantFields = [formData.ownerLastName, formData.ownerFirstName, formData.ownerEmail];
        return Math.round((declarantFields.filter(Boolean).length / 3) * 100);
      case 2:
        return formData.projectType ? 100 : 0;
      case 3:
        const locationFields = [formData.address, formData.postalCode, formData.city];
        return Math.round((locationFields.filter(Boolean).length / 3) * 100);
      case 4:
        return formData.newSurface ? 100 : 0;
      case 5:
        return (formData.piecesRequired?.length || 0) > 0 ? 100 : 0;
      case 6:
        return formData.engagementAccepted && formData.engagementSignature ? 100 : 0;
      case 7:
        return formData.cadastralReference || formData.codeInsee ? 100 : 0;
      case 8:
        return 0;
      default:
        return 0;
    }
  };

  const sections = [
    {
      step: 1,
      title: "Coordonnées déclarant",
      cerfaSection: "§1 - Identité",
      icon: User,
      completion: calculateSectionCompletion(1),
      fields: [
        { label: "Nom", value: formData.ownerLastName || null, cerfaRef: "§1.1" },
        { label: "Prénom", value: formData.ownerFirstName || null, cerfaRef: "§1.1" },
        { label: "Email", value: formData.ownerEmail || null, cerfaRef: "§2" },
      ]
    },
    {
      step: 2,
      title: "Nature des travaux",
      cerfaSection: "§4 - Projet",
      icon: ClipboardList,
      completion: calculateSectionCompletion(2),
      fields: [
        { label: "Type", value: projectTypeLabels[formData.projectType] || null, cerfaRef: "§4.1" },
        { label: "Description", value: formData.projectDescription || null, cerfaRef: "§4.1" },
      ]
    },
    {
      step: 3,
      title: "Localisation terrain",
      cerfaSection: "§3 - Terrain",
      icon: MapPin,
      completion: calculateSectionCompletion(3),
      fields: [
        { label: "Adresse", value: formData.address || null, cerfaRef: "§3.1" },
        { label: "Commune", value: formData.city && formData.postalCode ? `${formData.postalCode} ${formData.city}` : null, cerfaRef: "§3.1" },
        { label: "Réf. cadastrale", value: formData.cadastralReference || null, cerfaRef: "§3.1" },
      ]
    },
    {
      step: 4,
      title: "Surfaces et dimensions",
      cerfaSection: "§5 - Surfaces",
      icon: Ruler,
      completion: calculateSectionCompletion(4),
      fields: [
        { label: "Surface existante", value: formData.existingSurface ? `${formData.existingSurface} m²` : null, cerfaRef: "§5.1" },
        { label: "Surface créée", value: formData.newSurface ? `${formData.newSurface} m²` : null, cerfaRef: "§5.2" },
        { label: "Hauteur", value: formData.totalHeight ? `${formData.totalHeight} m` : null, cerfaRef: "§5.3" },
      ]
    },
    {
      step: 5,
      title: "Pièces à joindre",
      cerfaSection: "DP1-DP8",
      icon: Paperclip,
      completion: calculateSectionCompletion(5),
      fields: [
        { label: "Pièces", value: formData.piecesRequired?.length ? `${formData.piecesRequired.length} sélectionnée(s)` : null, cerfaRef: "DP" },
      ]
    },
    {
      step: 6,
      title: "Engagement",
      cerfaSection: "Déclaration",
      icon: Shield,
      completion: calculateSectionCompletion(6),
      fields: [
        { label: "Statut", value: formData.engagementAccepted ? "Accepté" : null, cerfaRef: "§6" },
        { label: "Signature", value: formData.engagementSignature || null, cerfaRef: "§6" },
      ]
    },
    {
      step: 7,
      title: "Plan cadastral",
      cerfaSection: "Cadastre",
      icon: Map,
      completion: calculateSectionCompletion(7),
      fields: [
        { label: "Code INSEE", value: formData.codeInsee || null, cerfaRef: "§3" },
      ]
    },
    {
      step: 8,
      title: "Récapitulatif",
      cerfaSection: "Final",
      icon: ClipboardCheck,
      completion: 0,
      fields: []
    },
  ];

  const totalCompletion = Math.round(
    sections.slice(0, -1).reduce((acc, section) => acc + section.completion, 0) / (sections.length - 1)
  );

  return (
    <motion.div
      className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-primary-foreground">CERFA n°13703*08</p>
            <p className="text-sm text-primary-foreground/80">Déclaration Préalable</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-primary-foreground/80">
            <span>Progression</span>
            <span className="font-semibold text-primary-foreground">{totalCompletion}%</span>
          </div>
          <Progress value={totalCompletion} className="h-2 bg-primary-foreground/20" />
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto">
        {sections.map((section) => {
          const isActive = currentStep === section.step;
          const isCompleted = section.completion === 100;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.step}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isActive
                  ? "border-primary bg-primary/5 shadow-md"
                  : isCompleted
                    ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                    : "border-border hover:border-muted-foreground/30"
              )}
              animate={{ scale: isActive ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className={cn("px-4 py-3 flex items-center gap-3", isActive && "bg-primary/5")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  isCompleted
                    ? "bg-green-500 text-primary-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {section.cerfaSection}
                    </span>
                    {!isCompleted && section.completion > 0 && (
                      <span className="text-xs text-muted-foreground">{section.completion}%</span>
                    )}
                  </div>
                  <h4 className={cn(
                    "font-semibold text-sm mt-1 truncate",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {section.title}
                  </h4>
                </div>

                {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0" />}
              </div>

              {(isActive || isCompleted) && section.fields.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-3 pt-1 border-t border-border/50"
                >
                  <div className="space-y-1.5 pl-11">
                    {section.fields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground/60 font-mono shrink-0">{field.cerfaRef}</span>
                        <span className="text-muted-foreground shrink-0">{field.label}:</span>
                        <span className={cn(
                          "font-medium truncate",
                          field.value ? "text-foreground" : "text-muted-foreground/50 italic"
                        )}>
                          {field.value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-muted/50 px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Étape {currentStep} / 8</span>
          <span className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            Sauvegarde auto
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WizardPreview;

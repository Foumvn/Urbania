import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { 
  Home, 
  Waves, 
  TreeDeciduous, 
  Car, 
  Fence, 
  Building,
  LayoutGrid,
  AlertCircle
} from "lucide-react";
import { CerfaFormData } from "@/pages/NouveauDossier";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: string) => void;
  errors: Record<string, string>;
}

const projectTypes = [
  { value: "extension", label: "Extension maison", icon: Home, description: "Agrandir votre habitation" },
  { value: "piscine", label: "Piscine", icon: Waves, description: "Piscine enterrée ou hors-sol" },
  { value: "abri", label: "Abri de jardin", icon: TreeDeciduous, description: "Cabane, remise, serre" },
  { value: "carport", label: "Carport / Garage", icon: Car, description: "Abri véhicule" },
  { value: "cloture", label: "Clôture / Portail", icon: Fence, description: "Délimitation terrain" },
  { value: "terrasse", label: "Terrasse", icon: LayoutGrid, description: "Terrasse couverte ou non" },
  { value: "facade", label: "Ravalement façade", icon: Building, description: "Modification extérieure" },
];

const WizardStepProject = ({ formData, updateFormData, errors }: Props) => {
  const maxChars = 500;
  const charCount = formData.projectDescription?.length || 0;

  return (
    <motion.div
      key="step-project"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Quel type de travaux souhaitez-vous déclarer ?
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez la catégorie qui correspond le mieux à votre projet <span className="text-destructive">*</span>
        </p>
      </div>

      {errors.projectType && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-destructive mb-4 bg-destructive/10 p-3 rounded-lg"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.projectType}</span>
        </motion.div>
      )}

      <RadioGroup
        value={formData.projectType}
        onValueChange={(value) => updateFormData("projectType", value)}
        className="grid sm:grid-cols-2 gap-3"
      >
        {projectTypes.map((type) => (
          <motion.div 
            key={type.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Label
              htmlFor={type.value}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                formData.projectType === type.value 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : errors.projectType
                    ? "border-destructive/50 hover:border-destructive"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                formData.projectType === type.value 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                <type.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </Label>
          </motion.div>
        ))}
      </RadioGroup>

      <div className="mt-8">
        <Label htmlFor="description" className="text-base font-semibold">
          Décrivez brièvement votre projet
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Cette description nous aidera à pré-remplir votre CERFA
        </p>
        <Textarea
          id="description"
          placeholder="Ex: Construction d'une extension de 20m² à l'arrière de ma maison pour créer une nouvelle chambre..."
          value={formData.projectDescription}
          onChange={(e) => updateFormData("projectDescription", e.target.value)}
          className={cn(
            "min-h-[120px] resize-none",
            charCount > maxChars && "border-destructive focus-visible:ring-destructive"
          )}
          maxLength={maxChars + 50}
        />
        <div className="flex justify-between mt-2">
          <div>
            {errors.projectDescription && (
              <span className="text-sm text-destructive">{errors.projectDescription}</span>
            )}
          </div>
          <span className={cn(
            "text-sm",
            charCount > maxChars ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WizardStepProject;

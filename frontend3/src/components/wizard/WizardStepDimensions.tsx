import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Ruler, Square, ArrowUpFromLine, Footprints, Info } from "lucide-react";
import { CerfaFormData } from "@/lib/pdfGenerator";
import FormField from "./FormField";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: string) => void;
  errors: Record<string, string>;
}

const dimensionFields = [
  {
    id: "existingSurface",
    label: "Surface existante",
    placeholder: "150",
    unit: "m²",
    icon: Square,
    hint: "Surface de plancher actuelle de votre habitation",
    required: false,
  },
  {
    id: "newSurface",
    label: "Surface créée",
    placeholder: "20",
    unit: "m²",
    icon: Ruler,
    hint: "Surface de plancher des nouveaux travaux",
    required: true,
  },
  {
    id: "totalHeight",
    label: "Hauteur totale",
    placeholder: "3.5",
    unit: "m",
    icon: ArrowUpFromLine,
    hint: "Hauteur maximale de la construction",
    required: false,
  },
  {
    id: "groundFootprint",
    label: "Emprise au sol",
    placeholder: "25",
    unit: "m²",
    icon: Footprints,
    hint: "Projection verticale du volume de la construction",
    required: false,
  },
];

const WizardStepDimensions = ({ formData, updateFormData, errors }: Props) => {
  // Only allow numeric input
  const handleNumericChange = (field: keyof CerfaFormData, value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    updateFormData(field, cleaned);
  };

  return (
    <motion.div
      key="step-dimensions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Quelles sont les dimensions de votre projet ?
        </h2>
        <p className="text-muted-foreground">
          Ces informations sont obligatoires pour le formulaire CERFA
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-primary" />
        </span>
        <div>
          <p className="text-sm text-foreground font-medium">
            Déclaration Préalable obligatoire
          </p>
          <p className="text-sm text-muted-foreground">
            Pour toute construction créant entre 5m² et 20m² de surface de plancher
            (ou 40m² en zone urbaine PLU).
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {dimensionFields.map((field) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FormField
              label={field.label}
              htmlFor={field.id}
              hint={field.hint}
              error={errors[field.id]}
              value={formData[field.id as keyof CerfaFormData]}
              required={field.required}
              icon={field.icon}
            >
              <div className="relative">
                <Input
                  id={field.id}
                  type="text"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={formData[field.id as keyof CerfaFormData] as string}
                  onChange={(e) => handleNumericChange(field.id as keyof CerfaFormData, e.target.value)}
                  className={cn(
                    "h-12 pr-14",
                    errors[field.id] && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {field.unit}
                </span>
              </div>
            </FormField>
          </motion.div>
        ))}
      </div>

      {/* Total surface calculation */}
      {formData.existingSurface && formData.newSurface && (
        <motion.div
          className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Surface totale après travaux</p>
              <p className="text-2xl font-bold text-primary">
                {(Number(formData.existingSurface) + Number(formData.newSurface)).toFixed(2).replace(/\.00$/, "")} m²
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Square className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WizardStepDimensions;

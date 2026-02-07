import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertTriangle, PenLine, Calendar } from "lucide-react";
import { CerfaFormData } from "@/lib/pdfGenerator";
import FormField from "./FormField";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: any) => void;
  errors: Record<string, string>;
}

const WizardStepEngagement = ({ formData, updateFormData, errors }: Props) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      key="step-engagement"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Engagement du déclarant
        </h2>
        <p className="text-muted-foreground">
          Déclaration sur l'honneur de l'exactitude des informations
        </p>
      </div>

      <div className="space-y-6">
        {/* Legal notice */}
        <motion.div
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Rappel des obligations légales
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-2">
                Conformément aux articles L. 423-1 et R. 423-1 du Code de l'urbanisme,
                toute fausse déclaration est passible de sanctions pénales.
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-2">
                Le déclarant atteste sur l'honneur que les informations fournies sont
                exactes et qu'il est autorisé à effectuer les travaux sur le terrain concerné.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Engagement checkbox */}
        <div className={cn(
          "flex items-start gap-4 p-5 rounded-xl border transition-all",
          formData.engagementAccepted
            ? "border-primary bg-primary/5"
            : errors.engagementAccepted
              ? "border-destructive bg-destructive/5"
              : "border-border"
        )}>
          <Checkbox
            id="engagement"
            checked={formData.engagementAccepted || false}
            onCheckedChange={(checked) => updateFormData("engagementAccepted", checked)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <label htmlFor="engagement" className="text-sm font-medium cursor-pointer">
              Je certifie sur l'honneur l'exactitude des renseignements fournis *
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              En cochant cette case, je reconnais avoir pris connaissance des dispositions
              du Code de l'urbanisme relatives aux déclarations préalables de travaux et
              m'engage à respecter les règles applicables.
            </p>
            {errors.engagementAccepted && (
              <p className="text-xs text-destructive mt-2">{errors.engagementAccepted}</p>
            )}
          </div>
        </div>

        {/* Signature */}
        <FormField
          label="Signature électronique (Nom complet)"
          htmlFor="signature"
          error={errors.engagementSignature}
          value={formData.engagementSignature}
          required
          icon={PenLine}
          hint="Tapez votre nom complet comme signature officielle"
        >
          <Input
            id="signature"
            placeholder={`${formData.ownerFirstName || 'Jean'} ${formData.ownerLastName || 'Dupont'}`}
            value={formData.engagementSignature || ""}
            onChange={(e) => updateFormData("engagementSignature", e.target.value)}
            className={cn(
              "h-12 font-medium",
              errors.engagementSignature && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </FormField>

        {/* Date */}
        <FormField
          label="Date de la déclaration"
          htmlFor="engagementDate"
          error={errors.engagementDate}
          value={formData.engagementDate || today}
          required
          icon={Calendar}
          hint="Date effective de signature"
        >
          <Input
            id="engagementDate"
            type="date"
            value={formData.engagementDate || today}
            onChange={(e) => updateFormData("engagementDate", e.target.value)}
            className={cn(
              "h-12",
              errors.engagementDate && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </FormField>

        {/* Complete notice */}
        {formData.engagementAccepted && formData.engagementSignature && (
          <motion.div
            className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  Engagement enregistré
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre déclaration sur l'honneur est enregistrée.
                  Vous pouvez passer à l'étape suivante.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WizardStepEngagement;

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, FileCheck, MapPin } from "lucide-react";
import { CerfaFormData } from "@/pages/NouveauDossier";
import FormField from "./FormField";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: string) => void;
  errors: Record<string, string>;
}

const WizardStepDeclarant = ({ formData, updateFormData, errors }: Props) => {
  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    let cleaned = value.replace(/[^\d\s.-]/g, "");
    
    if (cleaned.replace(/\D/g, "").length <= 10) {
      const digits = cleaned.replace(/\D/g, "");
      if (digits.length >= 2) {
        cleaned = digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
      }
    }
    
    updateFormData("ownerPhone", cleaned);
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isComplete = formData.ownerLastName && formData.ownerFirstName && formData.ownerEmail;

  return (
    <motion.div
      key="step-declarant"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Coordonnées du déclarant
        </h2>
        <p className="text-muted-foreground">
          Vos informations personnelles pour le CERFA officiel
        </p>
      </div>

      <div className="space-y-6">
        {/* Name fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Nom"
            htmlFor="lastName"
            error={errors.ownerLastName}
            required
            icon={User}
          >
            <Input
              id="lastName"
              placeholder="Dupont"
              value={formData.ownerLastName}
              onChange={(e) => updateFormData("ownerLastName", e.target.value)}
              className={cn(
                "h-12",
                errors.ownerLastName && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </FormField>
          
          <FormField
            label="Prénom"
            htmlFor="firstName"
            error={errors.ownerFirstName}
            required
          >
            <Input
              id="firstName"
              placeholder="Jean"
              value={formData.ownerFirstName}
              onChange={(e) => updateFormData("ownerFirstName", e.target.value)}
              className={cn(
                "h-12",
                errors.ownerFirstName && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </FormField>
        </div>

        {/* Owner address */}
        <FormField
          label="Adresse du déclarant"
          htmlFor="ownerAddress"
          error={errors.ownerAddress}
          icon={MapPin}
        >
          <Input
            id="ownerAddress"
            placeholder="12 rue des Lilas"
            value={formData.ownerAddress}
            onChange={(e) => updateFormData("ownerAddress", e.target.value)}
            className={cn(
              "h-12",
              errors.ownerAddress && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Code postal"
            htmlFor="ownerPostalCode"
            error={errors.ownerPostalCode}
          >
            <Input
              id="ownerPostalCode"
              placeholder="75015"
              value={formData.ownerPostalCode}
              onChange={(e) => updateFormData("ownerPostalCode", e.target.value)}
              className={cn(
                "h-12",
                errors.ownerPostalCode && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </FormField>
          
          <FormField
            label="Ville"
            htmlFor="ownerCity"
            error={errors.ownerCity}
          >
            <Input
              id="ownerCity"
              placeholder="Paris"
              value={formData.ownerCity}
              onChange={(e) => updateFormData("ownerCity", e.target.value)}
              className={cn(
                "h-12",
                errors.ownerCity && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </FormField>
        </div>

        {/* Contact fields */}
        <FormField
          label="Email"
          htmlFor="email"
          error={errors.ownerEmail}
          required
          icon={Mail}
        >
          <Input
            id="email"
            type="email"
            placeholder="jean.dupont@email.com"
            value={formData.ownerEmail}
            onChange={(e) => updateFormData("ownerEmail", e.target.value)}
            className={cn(
              "h-12",
              errors.ownerEmail && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </FormField>

        <FormField
          label="Téléphone"
          htmlFor="phone"
          error={errors.ownerPhone}
          icon={Phone}
          hint="Format: 06 12 34 56 78"
        >
          <Input
            id="phone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={formData.ownerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={cn(
              "h-12",
              errors.ownerPhone && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </FormField>

        {/* Ready notice */}
        {!hasErrors && isComplete && (
          <motion.div 
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">
                  Coordonnées complètes !
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Passez à l'étape suivante pour décrire votre projet.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WizardStepDeclarant;

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, FileCheck, MapPin, Globe, Building2, Briefcase, Calendar, Map as MapIcon, Info } from "lucide-react";
import { CerfaFormData } from "@/lib/pdfGenerator";
import FormField from "./FormField";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: any) => void;
  errors: Record<string, string>;
}

const societeTypes = [
  { value: "SCI", label: "SCI - Société Civile Immobilière" },
  { value: "SARL", label: "SARL - Société à Responsabilité Limitée" },
  { value: "SAS", label: "SAS - Société par Actions Simplifiée" },
  { value: "SA", label: "SA - Société Anonyme" },
  { value: "EURL", label: "EURL - Entreprise Unipersonnelle" },
  { value: "EI", label: "Entreprise Individuelle" },
  { value: "Association", label: "Association (loi 1901)" },
  { value: "Copropriete", label: "Syndicat de copropriété" },
  { value: "Collectivite", label: "Collectivité territoriale" },
  { value: "Autre", label: "Autre" },
];

const WizardStepDeclarant = ({ formData, updateFormData, errors }: Props) => {
  const isParticulier = formData.ownerType === "particulier";

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
  const isComplete = isParticulier
    ? (formData.ownerLastName && formData.ownerFirstName && formData.ownerEmail)
    : (formData.ownerDenomination && formData.ownerSiret && formData.ownerRepresentantNom);

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
          Identité et Coordonnées du déclarant
        </h2>
        <p className="text-muted-foreground">
          Informations du bénéficiaire de la déclaration
        </p>
      </div>

      <div className="space-y-8">
        {/* Type selection */}
        <div className="bg-muted/30 p-1 rounded-xl border flex gap-1">
          <button
            onClick={() => updateFormData("ownerType", "particulier")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              isParticulier ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" />
            Particulier
          </button>
          <button
            onClick={() => updateFormData("ownerType", "societe")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              !isParticulier ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-4 w-4" />
            Personne morale / Société
          </button>
        </div>

        {/* Identity Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            {isParticulier ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold text-lg">{isParticulier ? "Identité" : "Informations de la société"}</h3>
          </div>

          {isParticulier ? (
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <FormField
                  label="Civilité"
                  htmlFor="civilite"
                  error={errors.ownerCivilite}
                  required
                >
                  <select
                    id="civilite"
                    value={formData.ownerCivilite || ""}
                    onChange={(e) => updateFormData("ownerCivilite", e.target.value)}
                    className={cn(
                      "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      errors.ownerCivilite && "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <option value="">—</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </FormField>
              </div>

              <div className="sm:col-span-3 grid sm:grid-cols-2 gap-4">
                <FormField
                  label="Nom"
                  htmlFor="lastName"
                  error={errors.ownerLastName}
                  required
                  hint="En majuscules"
                >
                  <Input
                    id="lastName"
                    placeholder="DUPONT"
                    value={formData.ownerLastName || ""}
                    onChange={(e) => updateFormData("ownerLastName", e.target.value.toUpperCase())}
                    className="h-12"
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
                    value={formData.ownerFirstName || ""}
                    onChange={(e) => updateFormData("ownerFirstName", e.target.value)}
                    className="h-12"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField
                  label="Date de naissance"
                  htmlFor="dateNaissance"
                  error={errors.ownerDateNaissance}
                  icon={Calendar}
                  hint="JJ/MM/AAAA"
                >
                  <Input
                    id="dateNaissance"
                    placeholder="JJ/MM/AAAA"
                    value={formData.ownerDateNaissance || ""}
                    onChange={(e) => updateFormData("ownerDateNaissance", e.target.value)}
                    className="h-12"
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label="Lieu de naissance"
                  htmlFor="lieuNaissance"
                  error={errors.ownerLieuNaissance}
                  icon={MapIcon}
                >
                  <Input
                    id="lieuNaissance"
                    placeholder="Paris"
                    value={formData.ownerLieuNaissance || ""}
                    onChange={(e) => updateFormData("ownerLieuNaissance", e.target.value)}
                    className="h-12"
                  />
                </FormField>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                label="Dénomination"
                htmlFor="denomination"
                error={errors.ownerDenomination}
                required
                hint="Nom officiel de la société"
              >
                <Input
                  id="denomination"
                  placeholder="SCI Les Oliviers"
                  value={formData.ownerDenomination || ""}
                  onChange={(e) => updateFormData("ownerDenomination", e.target.value)}
                  className="h-12"
                />
              </FormField>

              <FormField
                label="N° SIRET"
                htmlFor="siret"
                error={errors.ownerSiret}
                required
                hint="14 chiffres"
              >
                <Input
                  id="siret"
                  placeholder="123 456 789 00012"
                  value={formData.ownerSiret || ""}
                  onChange={(e) => updateFormData("ownerSiret", e.target.value)}
                  className="h-12"
                />
              </FormField>

              <FormField
                label="Type de société"
                htmlFor="typeSociete"
                error={errors.ownerTypeSociete}
              >
                <select
                  id="typeSociete"
                  value={formData.ownerTypeSociete || ""}
                  onChange={(e) => updateFormData("ownerTypeSociete", e.target.value)}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez un type</option>
                  {societeTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Raison sociale"
                htmlFor="raisonSociale"
                error={errors.ownerRaisonSociale}
                hint="Si différente"
              >
                <Input
                  id="raisonSociale"
                  value={formData.ownerRaisonSociale || ""}
                  onChange={(e) => updateFormData("ownerRaisonSociale", e.target.value)}
                  className="h-12"
                />
              </FormField>

              <div className="sm:col-span-2">
                <DividerWithLabel label="Représentant légal" />
              </div>

              <FormField
                label="Nom du représentant"
                htmlFor="repNom"
                error={errors.ownerRepresentantNom}
                required
              >
                <Input
                  id="repNom"
                  placeholder="MARTIN"
                  value={formData.ownerRepresentantNom || ""}
                  onChange={(e) => updateFormData("ownerRepresentantNom", e.target.value.toUpperCase())}
                  className="h-12"
                />
              </FormField>

              <FormField
                label="Prénom du représentant"
                htmlFor="repPrenom"
                error={errors.ownerRepresentantPrenom}
                required
              >
                <Input
                  id="repPrenom"
                  placeholder="Pierre"
                  value={formData.ownerRepresentantPrenom || ""}
                  onChange={(e) => updateFormData("ownerRepresentantPrenom", e.target.value)}
                  className="h-12"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Qualité"
                  htmlFor="repQualite"
                  error={errors.ownerRepresentantQualite}
                  hint="Ex: Gérant, Président..."
                  icon={Briefcase}
                >
                  <Input
                    id="repQualite"
                    placeholder="Gérant"
                    value={formData.ownerRepresentantQualite || ""}
                    onChange={(e) => updateFormData("ownerRepresentantQualite", e.target.value)}
                    className="h-12"
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Adresse de correspondance</h3>
          </div>

          <div className="grid sm:grid-cols-12 gap-4">
            <div className="sm:col-span-3">
              <FormField
                label="Numéro"
                htmlFor="ownerAddressNumber"
                error={errors.ownerAddressNumber}
                hint="Ex: 12, 12bis..."
              >
                <Input
                  id="ownerAddressNumber"
                  placeholder="12"
                  value={formData.ownerAddressNumber || ""}
                  onChange={(e) => updateFormData("ownerAddressNumber", e.target.value)}
                  className="h-12"
                />
              </FormField>
            </div>
            <div className="sm:col-span-9">
              <FormField
                label="Voie"
                htmlFor="ownerAddress"
                error={errors.ownerAddress}
                hint="Rue, avenue, boulevard..."
                required
              >
                <Input
                  id="ownerAddress"
                  placeholder="rue Pasteur"
                  value={formData.ownerAddress || ""}
                  onChange={(e) => updateFormData("ownerAddress", e.target.value)}
                  className="h-12"
                />
              </FormField>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Lieu-dit"
              htmlFor="ownerLieuDit"
              error={errors.ownerLieuDit}
              hint="Si applicable"
            >
              <Input
                id="ownerLieuDit"
                placeholder="Quartier du port"
                value={formData.ownerLieuDit || ""}
                onChange={(e) => updateFormData("ownerLieuDit", e.target.value)}
                className="h-12"
              />
            </FormField>
            <FormField
              label="Localité"
              htmlFor="ownerLocalite"
              error={errors.ownerLocalite}
              hint="Si différente de la ville"
            >
              <Input
                id="ownerLocalite"
                placeholder="Hameau de Saint-Jean"
                value={formData.ownerLocalite || ""}
                onChange={(e) => updateFormData("ownerLocalite", e.target.value)}
                className="h-12"
              />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <FormField
                label="Code postal"
                htmlFor="ownerPostalCode"
                error={errors.ownerPostalCode}
                required
              >
                <Input
                  id="ownerPostalCode"
                  placeholder="34000"
                  value={formData.ownerPostalCode || ""}
                  onChange={(e) => updateFormData("ownerPostalCode", e.target.value)}
                  className="h-12"
                />
              </FormField>
            </div>
            <div className="sm:col-span-8">
              <FormField
                label="Ville"
                htmlFor="ownerCity"
                error={errors.ownerCity}
                required
              >
                <Input
                  id="ownerCity"
                  placeholder="MONTPELLIER"
                  value={formData.ownerCity || ""}
                  onChange={(e) => updateFormData("ownerCity", e.target.value)}
                  className="h-12"
                />
              </FormField>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <FormField
              label="BP"
              htmlFor="ownerBP"
              error={errors.ownerBP}
              hint="Boîte postale"
            >
              <Input
                id="ownerBP"
                placeholder="BP"
                value={formData.ownerBP || ""}
                onChange={(e) => updateFormData("ownerBP", e.target.value)}
                className="h-12"
              />
            </FormField>
            <FormField
              label="CEDEX"
              htmlFor="ownerCedex"
              error={errors.ownerCedex}
            >
              <Input
                id="ownerCedex"
                placeholder="CEDEX"
                value={formData.ownerCedex || ""}
                onChange={(e) => updateFormData("ownerCedex", e.target.value)}
                className="h-12"
              />
            </FormField>
            <FormField
              label="Pays"
              htmlFor="ownerCountry"
              error={errors.ownerCountry}
              icon={Globe}
            >
              <Input
                id="ownerCountry"
                placeholder="FRANCE"
                value={formData.ownerCountry || "FRANCE"}
                onChange={(e) => updateFormData("ownerCountry", e.target.value)}
                className="h-12"
              />
            </FormField>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Contact</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.ownerEmail}
              required
              hint="Pour le suivi de votre dossier"
            >
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@email.com"
                value={formData.ownerEmail || ""}
                onChange={(e) => updateFormData("ownerEmail", e.target.value)}
                className="h-12"
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
                value={formData.ownerPhone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="h-12"
              />
            </FormField>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
            <Checkbox
              id="acceptEmailCorrespondence"
              checked={formData.acceptEmailCorrespondence}
              onCheckedChange={(checked) => updateFormData("acceptEmailCorrespondence", !!checked)}
            />
            <Label htmlFor="acceptEmailCorrespondence" className="text-sm font-medium leading-none cursor-pointer">
              J'accepte de recevoir par courrier électronique les documents relatifs à ma demande
            </Label>
          </div>
        </div>

        {/* Ready notice */}
        {!hasErrors && isComplete && (
          <motion.div
            className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileCheck className="h-6 w-6 text-primary" />
              </span>
              <div>
                <p className="font-bold text-foreground">
                  Informations enregistrées !
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Toutes les informations requises pour le déclarant ont été saisies avec succès.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const DividerWithLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 py-2">
    <div className="h-px bg-border flex-1" />
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="h-px bg-border flex-1" />
  </div>
);

export default WizardStepDeclarant;

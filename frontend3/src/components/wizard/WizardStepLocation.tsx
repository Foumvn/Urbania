import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2, CheckCircle2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CerfaFormData } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import FormField from "./FormField";
import AddressAutocomplete from "./AddressAutocomplete";
import { cn } from "@/lib/utils";
import { useCadastreSearch, CadastreParcelle } from "@/hooks/useCadastreSearch";
import { AddressSuggestion } from "@/hooks/useAddressAutocomplete";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: string) => void;
  errors: Record<string, string>;
}

const WizardStepLocation = ({ formData, updateFormData, errors }: Props) => {
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [selectedParcelle, setSelectedParcelle] = useState<CadastreParcelle | null>(null);

  const { parcelles, isLoading: isCadastreLoading, error: cadastreError, searchParcelles, clearParcelles } = useCadastreSearch();

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    updateFormData("address", suggestion.name);
    updateFormData("postalCode", suggestion.postcode);
    updateFormData("city", suggestion.city);
    updateFormData("codeInsee" as keyof CerfaFormData, suggestion.citycode);

    // Clear previous parcelle selection
    setSelectedParcelle(null);
    clearParcelles();

    toast({
      title: "Adresse sélectionnée",
      description: `${suggestion.name}, ${suggestion.postcode} ${suggestion.city}`,
    });
  };

  const handleSearchCadastre = async () => {
    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "Adresse requise",
        description: "Veuillez d'abord sélectionner une adresse pour rechercher les parcelles.",
      });
      return;
    }

    await searchParcelles(selectedAddress.citycode, selectedAddress.coordinates);
  };

  const handleSelectParcelle = (parcelle: CadastreParcelle) => {
    setSelectedParcelle(parcelle);
    updateFormData("cadastralReference", parcelle.reference);
    updateFormData("terrainSurface", parcelle.contenance.toString());

    toast({
      title: "Parcelle sélectionnée",
      description: `Référence cadastrale: ${parcelle.reference} (${parcelle.contenance} m²)`,
    });
  };

  // Format postal code as user types
  const handlePostalCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    updateFormData("postalCode", cleaned);
  };

  return (
    <motion.div
      key="step-location"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Où se situe votre terrain ?
        </h2>
        <p className="text-muted-foreground">
          L'adresse exacte est nécessaire pour votre déclaration préalable
        </p>
      </div>

      <div className="space-y-6">
        {/* Address Autocomplete */}
        <FormField
          label="Adresse du terrain"
          htmlFor="address"
          error={errors.address}
          value={formData.address}
          required
          hint="Commencez à taper pour voir les suggestions"
        >
          <AddressAutocomplete
            value={formData.address}
            onChange={(value) => updateFormData("address", value)}
            onSelect={handleAddressSelect}
            placeholder="Ex: 12 rue des Lilas, Paris"
            error={errors.address}
          />
          {selectedAddress && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary flex items-center gap-1 mt-1 font-medium"
            >
              Adresse connectée à la Base Adresse Nationale
            </motion.p>
          )}
        </FormField>

        {/* City and Postal Code */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Code postal"
            htmlFor="postalCode"
            error={errors.postalCode}
            value={formData.postalCode}
            required
            hint="5 chiffres"
          >
            <Input
              id="postalCode"
              placeholder="75015"
              value={formData.postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              className={cn(
                "h-12",
                errors.postalCode && "border-destructive focus-visible:ring-destructive"
              )}
              inputMode="numeric"
            />
          </FormField>

          <FormField
            label="Ville"
            htmlFor="city"
            error={errors.city}
            value={formData.city}
            required
            hint="Nom de la commune"
          >
            <Input
              id="city"
              placeholder="Paris"
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              className={cn(
                "h-12",
                errors.city && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </FormField>
        </div>

        {/* Cadastral Reference and Surface */}
        <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <FormField
              label="Référence cadastrale"
              htmlFor="cadastral"
              error={errors.cadastralReference}
              value={formData.cadastralReference}
              hint="Cliquez sur 'Rechercher' pour trouver automatiquement"
              className="flex-1"
            >
              <Input
                id="cadastral"
                placeholder="Ex: AB 0123"
                value={formData.cadastralReference}
                onChange={(e) => updateFormData("cadastralReference", e.target.value)}
                className={cn(
                  "h-12",
                  errors.cadastralReference && "border-destructive focus-visible:ring-destructive",
                  selectedParcelle && "border-green-500"
                )}
              />
            </FormField>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSearchCadastre}
              disabled={!selectedAddress || isCadastreLoading}
              className="gap-2 mt-8 h-12 rounded-xl"
            >
              {isCadastreLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Rechercher
            </Button>
          </div>

          <FormField
            label="Surface du terrain (m²)"
            htmlFor="terrainSurface"
            error={errors.terrainSurface}
            value={formData.terrainSurface}
            icon={Ruler}
            hint="Surface totale de l'unité foncière"
          >
            <Input
              id="terrainSurface"
              placeholder="500"
              value={formData.terrainSurface}
              onChange={(e) => updateFormData("terrainSurface", e.target.value)}
              className={cn(
                "h-12",
                errors.terrainSurface && "border-destructive focus-visible:ring-destructive"
              )}
              inputMode="numeric"
            />
          </FormField>

          {/* Cadastre Error */}
          {cadastreError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive mt-2 font-medium"
            >
              {cadastreError}
            </motion.p>
          )}

          {/* Parcelles Results */}
          <AnimatePresence>
            {parcelles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                  Parcelles trouvées à proximité :
                </p>
                <div className="grid gap-3">
                  {parcelles.map((parcelle) => (
                    <motion.button
                      key={parcelle.id}
                      type="button"
                      onClick={() => handleSelectParcelle(parcelle)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        selectedParcelle?.id === parcelle.id
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">
                              {parcelle.reference}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                              Contenance : {parcelle.contenance.toLocaleString("fr-FR")} m²
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map placeholder */}
        <div className="bg-muted/20 rounded-2xl h-56 flex items-center justify-center border-2 border-dashed border-border/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 shadow-inner">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {selectedAddress
                ? `📍 ${selectedAddress.coordinates[1].toFixed(5)}, ${selectedAddress.coordinates[0].toFixed(5)}`
                : "Carte interactive bientôt disponible"
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WizardStepLocation;

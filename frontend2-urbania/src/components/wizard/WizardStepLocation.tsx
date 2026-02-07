import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CerfaFormData } from "@/pages/NouveauDossier";
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
          required
        >
          <AddressAutocomplete
            value={formData.address}
            onChange={(value) => updateFormData("address", value)}
            onSelect={handleAddressSelect}
            placeholder="Commencez à taper votre adresse..."
            error={errors.address}
          />
          {selectedAddress && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 flex items-center gap-1 mt-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              Adresse validée via la Base Adresse Nationale
            </motion.p>
          )}
        </FormField>

        {/* City and Postal Code */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField 
            label="Code postal" 
            htmlFor="postalCode" 
            error={errors.postalCode}
            required
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
            required
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

        {/* Cadastral Reference */}
        <div className="bg-muted/50 rounded-xl p-5 border border-border">
          <div className="flex items-start justify-between gap-4">
            <FormField 
              label="Référence cadastrale" 
              htmlFor="cadastral" 
              error={errors.cadastralReference}
              hint="Cliquez sur 'Rechercher' pour trouver automatiquement la parcelle"
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
              size="sm"
              onClick={handleSearchCadastre}
              disabled={!selectedAddress || isCadastreLoading}
              className="gap-2 mt-8"
            >
              {isCadastreLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Rechercher
            </Button>
          </div>

          {/* Cadastre Error */}
          {cadastreError && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive mt-2"
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
                className="mt-4"
              >
                <p className="text-sm font-medium text-foreground mb-2">
                  Parcelles trouvées à proximité :
                </p>
                <div className="grid gap-2">
                  {parcelles.map((parcelle) => (
                    <motion.button
                      key={parcelle.id}
                      type="button"
                      onClick={() => handleSelectParcelle(parcelle)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        selectedParcelle?.id === parcelle.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {parcelle.reference}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Surface : {parcelle.contenance.toLocaleString("fr-FR")} m²
                            </p>
                          </div>
                        </div>
                        {selectedParcelle?.id === parcelle.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map placeholder */}
        <div className="bg-muted rounded-xl h-48 flex items-center justify-center border border-dashed border-border">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
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

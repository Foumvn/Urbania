import { motion } from "framer-motion";
import { Map, Download, ExternalLink, MapPin, Layers, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CerfaFormData } from "@/pages/NouveauDossier";
import { cn } from "@/lib/utils";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: string) => void;
  errors: Record<string, string>;
}

const WizardStepCadastre = ({ formData, updateFormData, errors }: Props) => {
  const hasLocation = formData.address && formData.city && formData.postalCode;
  const hasCadastralRef = formData.cadastralReference;

  const openCadastreGouv = () => {
    const query = encodeURIComponent(`${formData.address} ${formData.postalCode} ${formData.city}`);
    window.open(`https://www.cadastre.gouv.fr/scpc/rechercherPlan.do?`, '_blank');
  };

  const openGeoportail = () => {
    window.open('https://www.geoportail.gouv.fr/', '_blank');
  };

  return (
    <motion.div
      key="step-cadastre"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Plan cadastral
        </h2>
        <p className="text-muted-foreground">
          Visualisez et vérifiez les informations cadastrales de votre terrain
        </p>
      </div>

      <div className="space-y-6">
        {/* Map placeholder */}
        <motion.div 
          className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="aspect-[16/10] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Carte cadastrale
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              L'intégration de la carte interactive sera disponible prochainement. 
              En attendant, vous pouvez consulter le cadastre officiel.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={openCadastreGouv} variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Cadastre.gouv.fr
              </Button>
              <Button onClick={openGeoportail} variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                Géoportail
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Location summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Récapitulatif de localisation
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-start py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Adresse du terrain</span>
              <span className={cn(
                "text-sm font-medium text-right max-w-[60%]",
                hasLocation ? "text-foreground" : "text-muted-foreground italic"
              )}>
                {hasLocation 
                  ? `${formData.address}, ${formData.postalCode} ${formData.city}`
                  : "Non renseignée"
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Code INSEE</span>
              <span className={cn(
                "text-sm font-medium font-mono",
                formData.codeInsee ? "text-foreground" : "text-muted-foreground italic"
              )}>
                {formData.codeInsee || "—"}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Référence cadastrale</span>
              <span className={cn(
                "text-sm font-medium font-mono",
                hasCadastralRef ? "text-foreground" : "text-muted-foreground italic"
              )}>
                {hasCadastralRef || "Non renseignée"}
              </span>
            </div>
          </div>
        </div>

        {/* Info about cadastral extract */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Extrait cadastral requis
              </p>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                L'extrait cadastral (pièce DP1) peut être téléchargé gratuitement 
                sur cadastre.gouv.fr. Il doit montrer clairement la parcelle concernée 
                par votre projet.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Download button */}
        {hasLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={openCadastreGouv}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-5 w-5" />
              Télécharger l'extrait cadastral
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WizardStepCadastre;

import { motion } from "framer-motion";
import { Upload, Check, FileImage, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CerfaFormData } from "@/pages/NouveauDossier";
import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface Props {
  formData: CerfaFormData;
  updateFormData: (field: keyof CerfaFormData, value: any) => void;
  errors: Record<string, string>;
}

interface PieceJointe {
  id: keyof CerfaFormData["pieces"];
  code: string;
  label: string;
  description: string;
  copies: string;
  required: boolean;
}

const PIECES_OBLIGATOIRES: PieceJointe[] = [
  {
    id: "dp1",
    code: "DP1",
    label: "Plan de situation du terrain",
    description: "Art. R. 431-36 a) - Permet de situer le terrain dans la commune",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: true,
  },
];

const PIECES_COMPLEMENTAIRES: PieceJointe[] = [
  {
    id: "dp2",
    code: "DP2",
    label: "Plan de masse coté dans les 3 dimensions",
    description: "Art. R. 431-36 b) - Avec constructions existantes et projetées",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp3",
    code: "DP3",
    label: "Plan en coupe du terrain et de la construction",
    description: "Art. R. 431-36 b) - Précisant l'implantation du projet",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp4",
    code: "DP4",
    label: "Plan des façades et des toitures",
    description: "Art. R. 431-36 b) - Toutes les façades du projet",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp5",
    code: "DP5",
    label: "Représentation de l'aspect extérieur",
    description: "Art. R. 431-36 c) - Document graphique du projet fini",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp6",
    code: "DP6",
    label: "Document graphique d'insertion",
    description: "Art. R. 431-36 c) - Insertion du projet dans l'environnement",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp7",
    code: "DP7",
    label: "Photographie - environnement proche",
    description: "Art. R. 431-36 c) - Terrain et constructions voisines",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
  {
    id: "dp8",
    code: "DP8",
    label: "Photographie - paysage lointain",
    description: "Art. R. 431-36 c) - Situation dans le paysage",
    copies: "1 ex. par dossier + 5 ex. supp.",
    required: false,
  },
];

const WizardStepPieces = ({ formData, updateFormData, errors }: Props) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCheckChange = useCallback((pieceId: string, checked: boolean) => {
    const currentRequired = formData.piecesRequired || [];
    const newRequired = checked
      ? [...currentRequired, pieceId]
      : currentRequired.filter(id => id !== pieceId);
    updateFormData("piecesRequired", newRequired);
  }, [formData.piecesRequired, updateFormData]);

  const handleFileChange = useCallback((pieceId: keyof CerfaFormData["pieces"], file: File | null) => {
    const newPieces = { ...formData.pieces, [pieceId]: file };
    updateFormData("pieces", newPieces);
    
    // Auto-check the piece when a file is uploaded
    if (file && !formData.piecesRequired?.includes(pieceId)) {
      handleCheckChange(pieceId, true);
    }
  }, [formData.pieces, formData.piecesRequired, updateFormData, handleCheckChange]);

  const isPieceSelected = (pieceId: string) => formData.piecesRequired?.includes(pieceId) || false;
  const getFile = (pieceId: keyof CerfaFormData["pieces"]) => formData.pieces?.[pieceId] || null;

  const renderPieceRow = (piece: PieceJointe) => {
    const isSelected = isPieceSelected(piece.id);
    const file = getFile(piece.id);

    return (
      <motion.div
        key={piece.id}
        className={cn(
          "flex items-start gap-4 p-4 rounded-xl border transition-all",
          isSelected
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Checkbox
          id={piece.id}
          checked={isSelected}
          onCheckedChange={(checked) => handleCheckChange(piece.id, checked as boolean)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <label htmlFor={piece.id} className="flex items-center gap-2 cursor-pointer">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
              {piece.code}
            </span>
            <span className="font-medium text-foreground">
              {piece.label}
            </span>
            {piece.required && (
              <span className="text-xs text-destructive font-medium">*</span>
            )}
          </label>
          <p className="text-xs text-muted-foreground mt-1">{piece.description}</p>
          
          {/* File upload area */}
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3"
            >
              <input
                type="file"
                ref={(el) => fileInputRefs.current[piece.id] = el}
                onChange={(e) => handleFileChange(piece.id, e.target.files?.[0] || null)}
                accept="image/*,.pdf"
                className="hidden"
              />
              
              {file ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300 truncate flex-1">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileChange(piece.id, null)}
                    className="h-6 px-2 text-xs"
                  >
                    Supprimer
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[piece.id]?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter le fichier
                </Button>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground text-right shrink-0">
          {piece.copies}
        </div>
      </motion.div>
    );
  };

  const hasError = errors.piecesRequired;

  return (
    <motion.div
      key="step-pieces"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Pièces à joindre
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez et téléchargez les plans requis pour votre déclaration
        </p>
      </div>

      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
        >
          {hasError}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Pièces obligatoires */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="font-semibold text-foreground">
              Pièces obligatoires pour tous les dossiers
            </h3>
          </div>
          
          <div className="space-y-2">
            {PIECES_OBLIGATOIRES.map(renderPieceRow)}
          </div>
        </div>

        {/* Pièces complémentaires */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="font-semibold text-foreground">
              Pièces complémentaires - Si construction
            </h3>
          </div>
          
          <div className="space-y-2">
            {PIECES_COMPLEMENTAIRES.map(renderPieceRow)}
          </div>
        </div>

        {/* Info notice */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Conseil pour vos documents
              </p>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                Les fichiers doivent être au format PDF ou image (JPG, PNG). 
                La résolution minimale recommandée est de 300 DPI pour une impression de qualité.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WizardStepPieces;

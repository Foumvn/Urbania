

# Plan de restructuration du Wizard CERFA - 8 etapes

## Objectif

Restructurer le wizard de 5 etapes vers 8 etapes en suivant la structure officielle du CERFA 13703, avec une nouvelle etape dediee aux pieces jointes (DP1-DP8) comme illustre dans l'image de reference.

---

## Nouvelle structure du wizard

| Etape | Titre | Description | Composant |
|-------|-------|-------------|-----------|
| 1 | Coordonnees du declarant | Identite et contact | `WizardStepDeclarant.tsx` (renomme) |
| 2 | Nature des travaux | Type de projet et description | `WizardStepProject.tsx` (existant) |
| 3 | Localisation du terrain | Adresse et cadastre | `WizardStepLocation.tsx` (existant) |
| 4 | Surfaces et dimensions | Mesures du projet | `WizardStepDimensions.tsx` (existant) |
| 5 | Pieces a joindre | Plans DP1 a DP8 | `WizardStepPieces.tsx` (nouveau) |
| 6 | Engagement | Declaration sur l'honneur | `WizardStepEngagement.tsx` (nouveau) |
| 7 | Plan cadastral | Visualisation cadastre | `WizardStepCadastre.tsx` (nouveau) |
| 8 | Recapitulatif | Resume et generation PDF | `WizardStepRecap.tsx` (nouveau) |

---

## Fichiers a creer

### 1. `src/components/wizard/WizardStepPieces.tsx`

Composant pour la gestion des pieces jointes obligatoires et complementaires, inspire de l'image fournie :

**Pieces obligatoires (pour tous les dossiers):**
- DP1 : Plan de situation du terrain

**Pieces complementaires (si construction):**
- DP2 : Plan de masse cote dans les 3 dimensions
- DP3 : Plan en coupe precisant l'implantation
- DP4 : Plan des facades et des toitures
- DP5 : Representation de l'aspect exterieur
- DP6 : Document graphique (insertion)
- DP7 : Photographie (environnement proche)
- DP8 : Photographie (paysage lointain)

**Fonctionnalites:**
- Checkbox pour selectionner les pieces requises
- Zone d'upload pour chaque piece
- Indicateur du nombre d'exemplaires requis
- Detection automatique des pieces necessaires selon le type de projet

### 2. `src/components/wizard/WizardStepEngagement.tsx`

Formulaire d'engagement avec :
- Checkbox pour accepter les conditions
- Declaration sur l'honneur de l'exactitude des informations
- Rappel des articles du Code de l'urbanisme
- Signature electronique (nom du declarant)
- Date de la declaration

### 3. `src/components/wizard/WizardStepCadastre.tsx`

Visualisation du plan cadastral :
- Affichage de la carte cadastrale (placeholder pour Leaflet)
- Recap des informations cadastrales saisies
- Option pour telecharger/imprimer l'extrait cadastral
- Verification des coordonnees GPS

### 4. `src/components/wizard/WizardStepRecap.tsx`

Page recapitulative complete :
- Resume de toutes les informations saisies
- Visualisation des pieces jointes
- Bouton "Modifier" pour chaque section
- Validation finale et generation du PDF
- Telechargement du dossier complet

---

## Fichiers a modifier

### `src/pages/NouveauDossier.tsx`

**Modifications:**
- Mise a jour de `CerfaFormData` pour ajouter les nouveaux champs :

```typescript
interface CerfaFormData {
  // Etape 1: Declarant (deplace de l'etape 4)
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;  // NOUVEAU
  ownerPostalCode: string;  // NOUVEAU
  ownerCity: string;  // NOUVEAU
  
  // Etape 2: Nature des travaux (inchange)
  projectType: string;
  projectDescription: string;
  
  // Etape 3: Localisation (inchange)
  address: string;
  postalCode: string;
  city: string;
  cadastralReference: string;
  codeInsee: string;
  
  // Etape 4: Dimensions (inchange)
  existingSurface: string;
  newSurface: string;
  totalHeight: string;
  groundFootprint: string;
  
  // Etape 5: Pieces a joindre (NOUVEAU)
  pieces: {
    dp1: File | null;
    dp2: File | null;
    dp3: File | null;
    dp4: File | null;
    dp5: File | null;
    dp6: File | null;
    dp7: File | null;
    dp8: File | null;
  };
  piecesRequired: string[];  // Liste des DP coches
  
  // Etape 6: Engagement (NOUVEAU)
  engagementAccepted: boolean;
  engagementSignature: string;
  engagementDate: string;
}
```

- Mise a jour du tableau `steps` avec 8 etapes
- Nouvelle logique de validation pour chaque etape
- Import des nouveaux composants

### `src/components/wizard/WizardStepDocuments.tsx`

- Renommer en `WizardStepDeclarant.tsx`
- Ajouter les champs d'adresse du declarant

### `src/components/wizard/WizardPreview.tsx`

- Mise a jour pour afficher 8 sections
- Ajout des nouvelles sections (Pieces, Engagement, Cadastre, Recap)
- Nouveau calcul de progression sur 8 etapes

### `src/lib/validations.ts`

Ajout des schemas de validation :

```typescript
// Validation etape 5 - Pieces a joindre
export const piecesStepSchema = z.object({
  piecesRequired: z.array(z.string()).min(1, "Selectionnez au moins une piece"),
});

// Validation etape 6 - Engagement
export const engagementStepSchema = z.object({
  engagementAccepted: z.boolean().refine(val => val === true, "Vous devez accepter l'engagement"),
  engagementSignature: z.string().min(1, "La signature est obligatoire"),
});
```

---

## Structure des donnees pour les pieces jointes

```typescript
interface PieceJointe {
  id: string;          // dp1, dp2, etc.
  label: string;       // Nom complet
  description: string; // Description detaillee
  required: boolean;   // Obligatoire ou non
  copies: string;      // Nombre d'exemplaires
  file: File | null;   // Fichier uploade
  selected: boolean;   // Coche ou non
}

const PIECES_OBLIGATOIRES: PieceJointe[] = [
  {
    id: "dp1",
    label: "Plan de situation du terrain",
    description: "Art. R. 431-36 a)",
    required: true,
    copies: "1 ex. par dossier + 2 ex. supp.",
    file: null,
    selected: false
  }
];

const PIECES_COMPLEMENTAIRES: PieceJointe[] = [
  {
    id: "dp2",
    label: "Plan de masse cote dans les 3 dimensions",
    required: false,
    copies: "1 ex. par dossier",
    file: null,
    selected: false
  },
  // ... dp3 a dp8
];
```

---

## Interface visuelle - Etape 5 (Pieces a joindre)

Basee sur l'image de reference fournie :

```text
+----------------------------------------------------------+
| 1 Pieces obligatoires pour tous les dossiers              |
+----------------------------------------------------------+
| Piece                                    | Nb exemplaires |
+----------------------------------------------------------+
| [ ] DP1. Plan de situation du terrain    | 1ex + 2 supp.  |
+----------------------------------------------------------+

+----------------------------------------------------------+
| 2 Pieces complementaires - Si construction                |
+----------------------------------------------------------+
| Piece                                    | Nb exemplaires |
+----------------------------------------------------------+
| [x] DP2. Plan de masse cote...           | 1 ex.          |
| [ ] DP3. Plan en coupe...                | 1 ex.          |
| [ ] DP4. Plan des facades...             | 1 ex.          |
| [ ] DP5. Representation aspect ext.      | 1 ex.          |
| [ ] DP6. Document graphique              | 1 ex.          |
| [ ] DP7. Photographie env. proche        | 1 ex.          |
| [ ] DP8. Photographie paysage lointain   | 1 ex.          |
+----------------------------------------------------------+
```

---

## Dependances

Aucune nouvelle dependance requise - utilisation des composants existants :
- `Checkbox` de Radix UI
- `Table` pour l'affichage des pieces
- Upload zone existante de `WizardStepDP.tsx`

---

## Resume des modifications

| Type | Fichier | Description |
|------|---------|-------------|
| Nouveau | `WizardStepPieces.tsx` | Gestion des pieces DP1-DP8 |
| Nouveau | `WizardStepEngagement.tsx` | Declaration sur l'honneur |
| Nouveau | `WizardStepCadastre.tsx` | Visualisation cadastrale |
| Nouveau | `WizardStepRecap.tsx` | Recapitulatif final |
| Renomme | `WizardStepDocuments.tsx` -> `WizardStepDeclarant.tsx` | Devient etape 1 |
| Modifie | `NouveauDossier.tsx` | 8 etapes + nouveaux champs |
| Modifie | `WizardPreview.tsx` | Sidebar avec 8 sections |
| Modifie | `validations.ts` | Nouveaux schemas |
| Supprime | `WizardStepDP.tsx` | Remplace par les nouvelles etapes |

et crée un dashboard admin pour moi avec des graphes et autres détails comme un django admin


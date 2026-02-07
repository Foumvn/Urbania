import { z } from "zod";

// Validation pour l'étape 1 : Déclarant
export const declarantStepSchema = z.object({
  ownerLastName: z.string()
    .min(1, "Le nom est obligatoire")
    .max(100, "Le nom ne doit pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne doit contenir que des lettres"),
  ownerFirstName: z.string()
    .min(1, "Le prénom est obligatoire")
    .max(100, "Le prénom ne doit pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne doit contenir que des lettres"),
  ownerEmail: z.string()
    .min(1, "L'email est obligatoire")
    .email("Veuillez entrer une adresse email valide"),
  ownerPhone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Veuillez entrer un numéro de téléphone français valide")
    .or(z.literal("")),
  ownerAddress: z.string().optional(),
  ownerPostalCode: z.string()
    .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres")
    .or(z.literal(""))
    .optional(),
  ownerCity: z.string().optional(),
});

// Validation pour l'étape 2 : Type de projet
export const projectStepSchema = z.object({
  projectType: z.string().min(1, "Veuillez sélectionner un type de projet"),
  projectDescription: z.string().max(500, "La description ne doit pas dépasser 500 caractères").optional(),
});

// Validation pour l'étape 3 : Localisation
export const locationStepSchema = z.object({
  address: z.string()
    .min(1, "L'adresse est obligatoire")
    .max(200, "L'adresse ne doit pas dépasser 200 caractères"),
  postalCode: z.string()
    .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres"),
  city: z.string()
    .min(1, "La ville est obligatoire")
    .max(100, "Le nom de la ville ne doit pas dépasser 100 caractères"),
  cadastralReference: z.string()
    .max(50, "La référence cadastrale ne doit pas dépasser 50 caractères")
    .optional(),
});

// Validation pour l'étape 4 : Dimensions
export const dimensionsStepSchema = z.object({
  existingSurface: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Veuillez entrer un nombre valide"),
  newSurface: z.string()
    .min(1, "La surface créée est obligatoire")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, "La surface doit être supérieure à 0"),
  totalHeight: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50), "La hauteur doit être entre 0 et 50 mètres"),
  groundFootprint: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Veuillez entrer un nombre valide"),
});

// Validation pour l'étape 5 : Pièces à joindre
export const piecesStepSchema = z.object({
  piecesRequired: z.array(z.string()).min(1, "Sélectionnez au moins une pièce à joindre"),
});

// Validation pour l'étape 6 : Engagement
export const engagementStepSchema = z.object({
  engagementAccepted: z.boolean().refine(val => val === true, "Vous devez accepter l'engagement"),
  engagementSignature: z.string().min(1, "La signature est obligatoire"),
  engagementDate: z.string().optional(),
});

// Types dérivés
export type DeclarantStepData = z.infer<typeof declarantStepSchema>;
export type ProjectStepData = z.infer<typeof projectStepSchema>;
export type LocationStepData = z.infer<typeof locationStepSchema>;
export type DimensionsStepData = z.infer<typeof dimensionsStepSchema>;
export type PiecesStepData = z.infer<typeof piecesStepSchema>;
export type EngagementStepData = z.infer<typeof engagementStepSchema>;

// Fonction de validation générique
export function validateStep<T>(
  schema: z.ZodSchema<T>,
  data: Partial<T>
): { success: boolean; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0].toString()] = err.message;
    }
  });
  
  return { success: false, errors };
}

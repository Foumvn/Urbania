// Validation utilities for form fields

// Validate email format
export function validateEmail(email) {
    if (!email) return { valid: false, message: 'L\'adresse email est requise' };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Format d\'email invalide (ex: exemple@email.fr)' };
    }
    return { valid: true, message: '' };
}

// Validate French phone number
export function validatePhone(phone) {
    if (!phone) return { valid: true, message: '' }; // Optional
    const cleanPhone = phone.replace(/[\s.-]/g, '');

    // French phone formats
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
        if (!/^0[1-9][0-9]{8}$/.test(cleanPhone)) {
            return { valid: false, message: 'Numéro de téléphone invalide' };
        }
        return { valid: true, message: '' };
    }

    if (cleanPhone.startsWith('+33') || cleanPhone.startsWith('0033')) {
        const suffix = cleanPhone.replace(/^\+33|^0033/, '');
        if (suffix.length !== 9 || !/^[1-9][0-9]{8}$/.test(suffix)) {
            return { valid: false, message: 'Format international invalide (ex: +33 6 12 34 56 78)' };
        }
        return { valid: true, message: '' };
    }

    return { valid: false, message: 'Format de téléphone invalide (ex: 06 12 34 56 78)' };
}

// Validate SIRET number (14 digits with Luhn check)
export function validateSiret(siret) {
    if (!siret) return { valid: false, message: 'Le numéro SIRET est requis' };
    const cleanSiret = siret.replace(/\s/g, '');

    if (!/^\d{14}$/.test(cleanSiret)) {
        return { valid: false, message: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    // Luhn algorithm check for SIRET
    let sum = 0;
    for (let i = 0; i < 14; i++) {
        let digit = parseInt(cleanSiret[i], 10);
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }

    if (sum % 10 !== 0) {
        return { valid: false, message: 'Numéro SIRET invalide (vérification Luhn échouée)' };
    }

    return { valid: true, message: '' };
}

// Validate French postal code
export function validatePostalCode(code) {
    if (!code) return { valid: false, message: 'Le code postal est requis' };
    const cleanCode = code.trim();

    if (!/^\d{5}$/.test(cleanCode)) {
        return { valid: false, message: 'Le code postal doit contenir 5 chiffres' };
    }

    // Check if code starts with valid department
    const dept = parseInt(cleanCode.substring(0, 2), 10);
    if (dept === 0 || (dept > 95 && dept < 97) || dept > 98) {
        // Allow DOM-TOM codes (97xxx, 98xxx) and mainland (01-95)
        if (cleanCode.substring(0, 3) !== '200' && // Corse
            !(dept >= 97 && dept <= 98)) { // DOM-TOM
            return { valid: false, message: 'Code postal invalide pour la France' };
        }
    }

    return { valid: true, message: '' };
}

// Validate date format (DD/MM/YYYY)
export function validateDate(date) {
    if (!date) return { valid: true, message: '' }; // Optional in most cases

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);

    if (!match) {
        return { valid: false, message: 'Format de date invalide (utilisez JJ/MM/AAAA)' };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) {
        return { valid: false, message: 'Mois invalide (01-12)' };
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
        return { valid: false, message: `Jour invalide pour ce mois (1-${daysInMonth})` };
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
        return { valid: false, message: `Année invalide (1900-${currentYear})` };
    }

    return { valid: true, message: '' };
}

// Validate required field
export function validateRequired(value, fieldName = 'Ce champ') {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { valid: false, message: `${fieldName} est obligatoire` };
    }
    return { valid: true, message: '' };
}

// Validate number (positive)
export function validatePositiveNumber(value, fieldName = 'Ce champ') {
    if (!value) return { valid: true, message: '' }; // Optional
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, message: `${fieldName} doit être un nombre` };
    }
    if (num < 0) {
        return { valid: false, message: `${fieldName} doit être positif` };
    }
    return { valid: true, message: '' };
}

// Validate surface (positive number with reasonable range)
export function validateSurface(value, fieldName = 'La surface') {
    if (!value) return { valid: true, message: '' };
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, message: `${fieldName} doit être un nombre` };
    }
    if (num < 0) {
        return { valid: false, message: `${fieldName} ne peut pas être négative` };
    }
    if (num > 100000) {
        return { valid: false, message: `${fieldName} semble trop grande (max 100 000 m²)` };
    }
    return { valid: true, message: '' };
}

// Validate cadastral reference
export function validateCadastralReference(prefix, section, numero) {
    if (!section || !numero) {
        return { valid: false, message: 'La section et le numéro de parcelle sont requis' };
    }

    // Section: 1 or 2 uppercase letters
    if (!/^[A-Z]{1,2}$/i.test(String(section).trim())) {
        return { valid: false, message: 'La section doit contenir 1 ou 2 lettres (ex: A, AB)' };
    }

    // Numero: 1 to 4 digits
    if (!/^\d{1,5}$/.test(String(numero).trim())) {
        return { valid: false, message: 'Le numéro de parcelle doit contenir 1 à 5 chiffres' };
    }

    // Prefix is optional but if provided, should be 1-3 digits
    if (prefix && String(prefix).trim() !== '' && !/^\d{1,3}$/.test(String(prefix).trim())) {
        return { valid: false, message: 'Le préfixe doit contenir 1 à 3 chiffres (ex: 000, 23)' };
    }

    return { valid: true, message: '' };
}

// Validate name (no numbers, reasonable length)
export function validateName(value, fieldName = 'Ce champ') {
    if (!value) return { valid: false, message: `${fieldName} est obligatoire` };

    const trimmed = value.trim();

    if (trimmed.length < 2) {
        return { valid: false, message: `${fieldName} est trop court (min. 2 caractères)` };
    }

    if (trimmed.length > 50) {
        return { valid: false, message: `${fieldName} est trop long (max. 50 caractères)` };
    }

    if (/\d/.test(trimmed)) {
        return { valid: false, message: `${fieldName} ne doit pas contenir de chiffres` };
    }

    return { valid: true, message: '' };
}

// Validate step data
export function validateStep(step, data) {
    const errors = {};

    switch (step) {
        case 0: // Type de déclarant
            if (!data.typeDeclarant) {
                errors.typeDeclarant = 'Veuillez sélectionner votre qualité (particulier ou personne morale)';
            }
            break;

        case 1: // Identité
            if (data.typeDeclarant === 'particulier') {
                if (!data.civilite) errors.civilite = 'La civilité est requise';

                const nomValidation = validateName(data.nom, 'Le nom');
                if (!nomValidation.valid) errors.nom = nomValidation.message;

                const prenomValidation = validateName(data.prenom, 'Le prénom');
                if (!prenomValidation.valid) errors.prenom = prenomValidation.message;

                if (data.dateNaissance) {
                    const dateValidation = validateDate(data.dateNaissance);
                    if (!dateValidation.valid) errors.dateNaissance = dateValidation.message;
                }
            } else if (data.typeDeclarant === 'personne_morale') {
                if (!data.denomination || data.denomination.trim() === '') {
                    errors.denomination = 'La dénomination est requise';
                }

                const siretValidation = validateSiret(data.siret);
                if (!siretValidation.valid) errors.siret = siretValidation.message;

                const repNomValidation = validateName(data.representantNom, 'Le nom du représentant');
                if (!repNomValidation.valid) errors.representantNom = repNomValidation.message;

                const repPrenomValidation = validateName(data.representantPrenom, 'Le prénom du représentant');
                if (!repPrenomValidation.valid) errors.representantPrenom = repPrenomValidation.message;
            }
            break;

        case 2: // Coordonnées
            if (!data.adresse || data.adresse.trim() === '') {
                errors.adresse = 'L\'adresse est requise';
            } else if (data.adresse.trim().length < 5) {
                errors.adresse = 'L\'adresse semble trop courte';
            }

            const cpValidation = validatePostalCode(data.codePostal);
            if (!cpValidation.valid) errors.codePostal = cpValidation.message;

            if (!data.ville || data.ville.trim() === '') {
                errors.ville = 'La ville est requise';
            }

            const emailValidation = validateEmail(data.email);
            if (!emailValidation.valid) errors.email = emailValidation.message;

            if (data.telephone) {
                const phoneValidation = validatePhone(data.telephone);
                if (!phoneValidation.valid) errors.telephone = phoneValidation.message;
            }
            break;

        case 3: // Terrain
            if (!data.terrainAdresse || data.terrainAdresse.trim() === '') {
                errors.terrainAdresse = 'L\'adresse du terrain est requise';
            }

            const terrainCpValidation = validatePostalCode(data.terrainCodePostal);
            if (!terrainCpValidation.valid) errors.terrainCodePostal = terrainCpValidation.message;

            if (!data.terrainVille || data.terrainVille.trim() === '') {
                errors.terrainVille = 'La ville du terrain est requise';
            }

            const cadastreValidation = validateCadastralReference(data.prefixe, data.section, data.numeroParcelle);
            if (!cadastreValidation.valid) {
                errors.referenceCadastrale = cadastreValidation.message;
            }

            if (data.surfaceTerrain) {
                const surfaceValidation = validateSurface(data.surfaceTerrain, 'La superficie');
                if (!surfaceValidation.valid) errors.surfaceTerrain = surfaceValidation.message;
            }
            break;

        case 4: // Type de travaux
            if (!data.typeTravaux) {
                errors.typeTravaux = 'Le type de travaux est requis';
            }
            if (!data.natureTravaux || data.natureTravaux.length === 0) {
                errors.natureTravaux = 'Veuillez sélectionner au moins une nature de travaux';
            }
            break;

        case 5: // Description
            const description = String(data.descriptionProjet || '');
            if (!description || description.trim() === '') {
                errors.descriptionProjet = 'La description du projet est requise';
            } else if (description.trim().length < 20) {
                errors.descriptionProjet = 'La description est trop courte (minimum 20 caractères)';
            }
            break;

        case 6: // Surfaces
            if (data.surfacePlancherCreee) {
                const validation = validateSurface(data.surfacePlancherCreee);
                if (!validation.valid) errors.surfacePlancherCreee = validation.message;
            }
            if (data.empriseSolCreee) {
                const validation = validateSurface(data.empriseSolCreee);
                if (!validation.valid) errors.empriseSolCreee = validation.message;
            }
            break;

        case 7: // Pièces jointes
            // Optional - no mandatory validation
            break;

        case 8: // Engagements
            if (!data.engagementExactitude) {
                errors.engagementExactitude = 'Vous devez attester de l\'exactitude des informations fournies';
            }
            if (!data.engagementReglementation) {
                errors.engagementReglementation = 'Vous devez vous engager à respecter la réglementation';
            }
            if (!data.lieuDeclaration || data.lieuDeclaration.trim() === '') {
                errors.lieuDeclaration = 'Le lieu de signature est requis';
            }
            break;

        case 9: // Plan cadastral
            // No strict validation for now
            break;

        case 10: // Récapitulatif
            // Final check - usually no errors
            break;

        default:
            break;
    }

    return errors;
}

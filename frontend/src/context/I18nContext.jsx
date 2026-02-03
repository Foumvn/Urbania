import { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext(null);

const translations = {
    fr: {
        // Common
        'app.title': 'Urbania',
        'auth.login': 'Connexion',
        'auth.register': 'Inscription',
        'auth.logout': 'Déconnexion',
        'nav.dashboard': 'Tableau de bord',
        'nav.form': 'Nouveau Dossier',
        'nav.admin': 'Administration',
        'nav.profile': 'Profil',
        'nav.settings': 'Paramètres',
        // Wizard Steps
        'wizard.step1.title': 'Quelle est votre qualité ?',
        'wizard.step1.subtitle': 'Sélectionnez si vous êtes un particulier ou une personne morale',
        'wizard.step2.title': 'Votre identité',
        'wizard.step2.subtitle': 'Renseignez vos informations personnelles',
        'wizard.step3.title': 'Vos coordonnées',
        'wizard.step3.subtitle': 'Adresse et moyens de contact',
        'wizard.step4.title': 'Le terrain concerné',
        'wizard.step4.subtitle': 'Localisation et références cadastrales',
        'wizard.step5.title': 'Nature des travaux',
        'wizard.step5.subtitle': 'Type et description de votre projet',
        'wizard.step6.title': 'Description du projet',
        'wizard.step6.subtitle': 'Détails, matériaux et couleurs',
        'wizard.step7.title': 'Surfaces',
        'wizard.step7.subtitle': 'Calcul des surfaces de plancher et emprise au sol',
        'wizard.step8.title': 'Pièces à joindre',
        'wizard.step8.subtitle': 'Documents nécessaires pour votre dossier',
        'wizard.step9.title': 'Engagements',
        'wizard.step9.subtitle': 'Attestations et signature',
        'wizard.step10.title': 'Récapitulatif',
        'wizard.step10.subtitle': 'Vérifiez et générez votre déclaration',
        'wizard.step11.title': 'Plan cadastral',
        'wizard.step11.subtitle': 'Générez et téléchargez votre plan de situation',
        'preview.show': 'Voir l\'aperçu',
        'preview.hide': 'Cacher l\'aperçu',
        // Dashboard
        'dashboard.welcome': 'Bienvenue,',
        'dashboard.recent': 'Dossiers récents',
        'dashboard.no_dossiers': 'Aucun dossier pour le moment.',
        // Profile
        'profile.title': 'Mon Profil',
        'profile.details': 'Détails personnels',
        // Settings
        'settings.title': 'Paramètres',
        'settings.language': 'Langue de l\'application',
    },
    en: {
        // Common
        'app.title': 'Urbania',
        'auth.login': 'Login',
        'auth.register': 'Sign Up',
        'auth.logout': 'Logout',
        'nav.dashboard': 'Dashboard',
        'nav.form': 'New Application',
        'nav.admin': 'Administration',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        // Wizard Steps
        'wizard.step1.title': 'What is your status?',
        'wizard.step1.subtitle': 'Select if you are an individual or a legal entity',
        'wizard.step2.title': 'Your Identity',
        'wizard.step2.subtitle': 'Fill in your personal information',
        'wizard.step3.title': 'Contact Details',
        'wizard.step3.subtitle': 'Address and contact information',
        'wizard.step4.title': 'Relevant Land',
        'wizard.step4.subtitle': 'Location and cadastral references',
        'wizard.step5.title': 'Nature of Work',
        'wizard.step5.subtitle': 'Type and description of your project',
        'wizard.step6.title': 'Project Description',
        'wizard.step6.subtitle': 'Details, materials and colors',
        'wizard.step7.title': 'Surfaces',
        'wizard.step7.subtitle': 'Calculation of floor area and footprint',
        'wizard.step8.title': 'Attachments',
        'wizard.step8.subtitle': 'Documents needed for your application',
        'wizard.step9.title': 'Commitments',
        'wizard.step9.subtitle': 'Attestations and signature',
        'wizard.step10.title': 'Summary',
        'wizard.step10.subtitle': 'Verify and generate your declaration',
        'wizard.step11.title': 'Cadastral Plan',
        'wizard.step11.subtitle': 'Generate and download your site plan',
        'preview.show': 'Show Preview',
        'preview.hide': 'Hide Preview',
        // Dashboard
        'dashboard.welcome': 'Welcome,',
        'dashboard.recent': 'Recent applications',
        'dashboard.no_dossiers': 'No applications yet.',
        // Profile
        'profile.title': 'My Profile',
        'profile.details': 'Personal Details',
        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Application Language',
    }
};

export function I18nProvider({ children }) {
    const [lang, setLang] = useState(localStorage.getItem('urbania_lang') || 'fr');

    useEffect(() => {
        localStorage.setItem('urbania_lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => {
        return translations[lang][key] || key;
    };

    const value = {
        lang,
        setLang,
        t,
        translations: translations[lang]
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

export default I18nContext;

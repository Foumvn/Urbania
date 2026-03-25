# Cahier des Charges - Application Urbania

## 1. Présentation du Projet

### 1.1. Contexte et Objectif

Urbania est une application web innovante de génération assistée par IA de formulaires CERFA (documents administratifs français) pour les démarches d'urbanisme. L'application vise à simplifier et automatiser la création complexe de demandes de permis de construire et autres documents administratifs requis dans le cadre des projets d'urbanisation.

**Objectif principal** : Démocratiser l'accès aux outils de génération de documents administratifs français en intégrant l'intelligence artificielle pour réduire le temps de création et améliorer la qualité des dossiers soumis.

### 1.2. Problématique Adressée

- **Complexité administrative** : Les formulaires CERFA français sont notoirement complexes et nécessitent une connaissance approfondie du droit de l'urbanisme
- **Temps de préparation** : Création manuelle des plans techniques (DP1-DP4) extrêmement chronophage
- **Risques d'erreur** : Documents non conformes aux normes officielles entraînant des rejets administratifs
- **Accessibilité** : Outils professionnels coûteux réservés aux cabinets spécialisés

### 1.3. Solution Proposée

Une plateforme web full-stack intégrant :
- Un assistant IA guidé pour la saisie des données
- Génération automatique des plans techniques via IA
- Intégration des APIs officielles françaises (cadastre, géocodage)
- Export PDF conforme aux standards administratifs

## 2. Fonctionnalités Principales

### 2.1. Système d'Authentification

- **Inscription/Connexion** : Système traditionnel avec email/mot de passe
- **Authentification Google** : Via Firebase Authentication
- **Gestion des rôles** : Client et Administrateur
- **Validation des comptes** : Système d'approbation manuelle pour les administrateurs

### 2.2. Assistant CERFA Multi-Étapes

L'application guide l'utilisateur à travers 11 étapes structurées :

1. **Type de déclarant** : Particulier ou personne morale
2. **Identité et informations personnelles** : Données civiles complètes
3. **Coordonnées** : Adresse avec validation française automatique
4. **Terrain** : Références cadastrales (commune, section, parcelle)
5. **Nature des travaux** : Classification détaillée des interventions
6. **Description technique** : Détails architecturaux et constructifs
7. **Génération DP11** : Notice descriptive automatique via IA
8. **Surfaces** : Calculs conditionnels selon le type de projet
9. **Pièces jointes** : Upload et gestion des documents requis
10. **Engagements juridiques** : Acceptation des conditions administratives
11. **Récapitulatif et génération** : Validation finale et export PDF

### 2.3. Génération de Plans Techniques

#### DP1 - Plan Cadastral
- **Source** : API officielle du cadastre français
- **Méthode** : Génération automatisée via Puppeteer
- **Format** : Image PNG haute résolution

#### DP2 - Plan de Situation
- **Source** : IA Stability AI (SDXL)
- **Contenu** : Emplacement, accès, voirie
- **Style** : Représentation technique normalisée

#### DP3 - Plan de Coupe
- **Source** : IA Stability AI (SDXL)
- **Contenu** : Sections architecturales
- **Style** : Hachures techniques officielles

#### DP4 - Plan de Façade
- **Source** : IA Stability AI (SDXL)
- **Contenu** : Élévations avec dimensions
- **Style** : Dessins techniques normalisés

### 2.4. Services de Géolocalisation

- **Géocodage d'adresses** : Via api-adresse.data.gouv.fr
- **Recherche cadastrale** : Intégration cadastre.data.gouv.fr
- **Validation automatique** : Vérification des codes INSEE et références cadastrales
- **Cartes interactives** : Leaflet avec MapLibre GL

### 2.5. Gestion Administrative

- **Dashboard administrateur** : Suivi des utilisateurs et activités
- **Validation des comptes** : Processus d'approbation manuelle
- **Notifications** : Système d'alertes intégré
- **Statistiques** : Métriques d'utilisation et performance

## 3. Architecture Technique

### 3.1. Architecture Générale

L'application suit une architecture full-stack moderne :

#### Backend (Django REST Framework)
- **Framework** : Django 4.2.18 + DRF
- **Base de données** : PostgreSQL
- **Authentification** : JWT + Firebase OAuth
- **Serveur** : Gunicorn + Nginx (production)

#### Frontend (React)
- **Framework** : React 18 + Vite
- **UI Framework** : Material-UI + Radix UI + TailwindCSS
- **État** : Context API + useReducer
- **Routing** : React Router DOM

#### Déploiement
- **Plateforme** : Render (Web Service + Static Site)
- **Base de données** : PostgreSQL managé
- **CI/CD** : Automatique via GitHub Actions

### 3.2. Intégrations Externes

#### APIs IA
- **Mistral AI** : Génération de textes (notices, descriptions)
- **Stability AI** : Génération d'images techniques (plans DP2-DP4)
- **Hugging Face** : Solution de fallback pour l'IA

#### APIs Officielles Françaises
- **Cadastre.data.gouv.fr** : Données cadastrales officielles
- **Apicarto.ign.fr** : Recherche par commune/parcelle
- **Api-adresse.data.gouv.fr** : Géocodage et validation d'adresses

#### Services de Cartographie
- **Leaflet** : Cartes interactives
- **MapLibre GL** : Rendu vectoriel haute performance

### 3.3. Modes d'Exécution IA

Le système de génération IA propose trois modes de performance :

- **Mode Standard** : Équilibre performance/qualité
- **Mode Light** : Génération rapide (optimisé pour la vitesse)
- **Mode Dask** : Traitement distribué (pour gros volumes)

## 4. Exigences Fonctionnelles

### 4.1. Exigences Utilisateur

#### Pour les Particuliers
- Interface intuitive sans connaissance technique préalable
- Sauvegarde automatique des données en cours de saisie
- Validation en temps réel des informations saisies
- Aperçu des documents avant génération finale

#### Pour les Professionnels
- Import en masse de données projets
- Personnalisation des templates
- Export multi-formats (PDF, images séparées)
- API REST pour intégrations tierces

### 4.2. Exigences Techniques

#### Performance
- Temps de génération IA : < 30 secondes
- Taille maximale des fichiers upload : 10 MB
- Support concurrent : 100 utilisateurs simultanés
- Disponibilité : 99.5% uptime

#### Sécurité
- Chiffrement des données sensibles
- Validation côté serveur de toutes les entrées
- Protection contre les attaques CSRF/XSS
- Conformité RGPD pour les données personnelles

#### Accessibilité
- Conformité WCAG 2.1 niveau AA
- Support mobile responsive
- Navigation clavier complète
- Lecteurs d'écran compatibles

## 5. Contraintes et Risques

### 5.1. Contraintes Techniques

#### Dépendances IA
- **Disponibilité** : Risque d'indisponibilité des APIs externes
- **Quotas** : Limitations de génération (Stability AI, Hugging Face)
- **Coûts** : Tarification variable selon l'usage
- **Qualité** : Variabilité dans la génération automatique

#### Conformité Réglementaire
- **Validité juridique** : Documents générés non substituables aux originaux officiels
- **Évolution légale** : Adaptations nécessaires aux changements réglementaires
- **Responsabilité** : Clarification du rôle d'assistance IA

### 5.2. Risques Identifiés

#### Risques Techniques
- Dégradation des performances avec l'état complexe du frontend
- Dépendance critique aux services IA externes
- Gestion d'erreurs insuffisante (utilisation de print() au lieu de logging)
- Tests unitaires quasi inexistants

#### Risques Métier
- **Acceptation** : Résistance des administrations à l'IA
- **Concurrence** : Emergence d'outils similaires
- **Réglementation** : Évolutions du droit de l'urbanisme
- **Adoption** : Courbe d'apprentissage des utilisateurs

## 6. Plan de Développement

### 6.1. Phases de Développement

#### Phase 1 - Consolidation (1-2 mois)
- Implémentation des tests unitaires critiques
- Migration vers logging structuré
- Ajout de validation serveur
- Optimisation des performances frontend

#### Phase 2 - Performance (2-3 mois)
- Refactorisation de l'état frontend
- Mise en place du cache intelligent
- Génération IA asynchrone
- Monitoring et métriques

#### Phase 3 - Évolutivité (3-6 mois)
- Architecture microservices
- Intégration APIs officielles de validation
- Templates personnalisables
- Mode hors-ligne partiel

#### Phase 4 - Innovation (6+ mois)
- Nouvelles fonctionnalités IA avancées
- Intégrations métier spécialisées
- API publique pour développeurs
- Applications mobiles natives

### 6.2. Critères d'Acceptation

#### Qualité Code
- Couverture tests : minimum 80%
- Respect des standards PEP 8 (Python) et ESLint (JavaScript)
- Documentation technique complète
- Revue de code systématique

#### Performance
- Temps de réponse API : < 2 secondes
- Temps de génération IA : < 30 secondes
- Taille bundle frontend : < 2 MB
- Score Lighthouse : > 90/100

#### Sécurité
- Audit de sécurité externe
- Conformité RGPD validée
- Chiffrement des données sensibles
- Gestion des secrets sécurisée

## 7. Budget et Ressources

### 7.1. Équipe Recommandée

- **Développement Backend** : 2 développeurs Django/Python
- **Développement Frontend** : 2 développeurs React/TypeScript
- **DevOps/Infra** : 1 ingénieur cloud
- **UX/UI Design** : 1 designer
- **Product Management** : 1 chef de projet
- **QA/Testing** : 1 testeur automatisation

### 7.2. Coûts Estimés

#### Infrastructure Cloud (mensuel)
- Render Web Service : 25€
- PostgreSQL managé : 15€
- APIs IA (estimation) : 50-200€
- Domaines et certificats : 20€
**Total mensuel** : ~110-260€

#### Développement (phase initiale 6 mois)
- Équipe de 6 personnes : ~60k€
- Outils et licences : ~10k€
- Formation IA/APIs : ~5k€
**Total développement** : ~75k€

### 7.3. Revenus Potentiels

#### Modèle Freemium
- Version gratuite : 5 générations/mois
- Version Pro : 50€/mois (professionnels)
- Version Entreprise : 200€/mois (cabinets)

#### Projections (année 1)
- Utilisateurs actifs : 1,000
- Taux conversion pro : 20% (200 clients payants)
- CA annuel : ~120k€ (hors infrastructure)

## 8. Métriques de Succès

### 8.1. Indicateurs Techniques
- **Performance** : Temps moyen de génération < 20 secondes
- **Fiabilité** : Taux d'erreur IA < 5%
- **Disponibilité** : Uptime > 99.5%
- **Satisfaction** : Score NPS > 70

### 8.2. Indicateurs Métier
- **Adoption** : 500 utilisateurs actifs mensuels (M6)
- **Rétention** : Taux de rétention > 80%
- **Conversion** : 15% des utilisateurs passent à la version payante
- **Impact** : Réduction de 70% du temps de préparation des dossiers

### 8.3. Indicateurs Qualité
- **Conformité** : 95% des documents générés conformes
- **Satisfaction** : Note moyenne > 4.5/5
- **Support** : Temps de réponse support < 24h
- **Innovation** : Nouvelles fonctionnalités tous les 2 mois

## 9. Conclusion

Urbania représente une innovation majeure dans le domaine de l'administration numérique française, combinant intelligence artificielle et APIs officielles pour simplifier des démarches administratives complexes. Le projet présente un équilibre prometteur entre innovation technologique et contraintes réglementaires françaises.

**Recommandation** : Lancement pilote avec un public restreint (professionnels de l'immobilier) pour valider l'approche avant déploiement grand public. Focus initial sur la robustesse technique et la conformité réglementaire.

---

**Document créé le** : Mars 2026
**Version** : 1.0
**Auteur** : Équipe Urbania
**Statut** : Approuvé pour développement

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Shield, Lock, Eye, Users, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const sections = [
    {
      icon: FileText,
      title: "Données collectées",
      content: [
        "Informations d'identification (nom, prénom, email)",
        "Données relatives à votre projet (adresse du terrain, nature des travaux)",
        "Documents téléchargés (photos, plans existants)",
        "Données de connexion et d'utilisation de la plateforme"
      ]
    },
    {
      icon: Shield,
      title: "Finalités du traitement",
      content: [
        "Création et gestion de votre dossier de déclaration préalable",
        "Génération automatique des plans DP1 à DP6",
        "Communication relative à votre dossier",
        "Amélioration de nos services et de l'expérience utilisateur"
      ]
    },
    {
      icon: Lock,
      title: "Protection des données",
      content: [
        "Chiffrement SSL/TLS pour toutes les transmissions",
        "Stockage sécurisé sur des serveurs en France",
        "Accès restreint aux données personnelles",
        "Audits de sécurité réguliers"
      ]
    },
    {
      icon: Users,
      title: "Partage des données",
      content: [
        "Aucune vente de vos données à des tiers",
        "Partage limité aux prestataires techniques essentiels",
        "Transmission aux autorités uniquement sur obligation légale",
        "Sous-traitants soumis aux mêmes obligations de confidentialité"
      ]
    },
    {
      icon: Eye,
      title: "Vos droits",
      content: [
        "Droit d'accès à vos données personnelles",
        "Droit de rectification des informations inexactes",
        "Droit à l'effacement (droit à l'oubli)",
        "Droit à la portabilité de vos données",
        "Droit d'opposition au traitement"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">Urbania</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nous nous engageons à protéger vos données personnelles conformément au RGPD 
              et à la loi Informatique et Libertés.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Dernière mise à jour : 30 janvier 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Urbania (« nous », « notre ») est une plateforme d'aide à la création de dossiers 
              de déclaration préalable de travaux. Cette politique de confidentialité décrit comment 
              nous collectons, utilisons et protégeons vos informations personnelles lorsque vous 
              utilisez notre service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En utilisant Urbania, vous consentez aux pratiques décrites dans cette politique. 
              Nous vous invitons à la lire attentivement.
            </p>
          </motion.section>

          {/* Sections */}
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          ))}

          {/* Cookies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Notre site utilise des cookies pour améliorer votre expérience de navigation :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Cookies essentiels</h3>
                <p className="text-sm text-muted-foreground">
                  Nécessaires au fonctionnement du site (session, authentification)
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">Cookies analytiques</h3>
                <p className="text-sm text-muted-foreground">
                  Nous aident à comprendre comment vous utilisez le site
                </p>
              </div>
            </div>
          </motion.section>

          {/* Conservation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Durée de conservation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités 
              pour lesquelles elles ont été collectées. Les dossiers de déclaration préalable sont 
              conservés pendant 10 ans conformément aux obligations légales en matière d'urbanisme. 
              Vous pouvez demander la suppression de votre compte à tout moment.
            </p>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Contact</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question relative à cette politique ou pour exercer vos droits :
                </p>
                <p className="text-foreground font-medium">
                  Email : privacy@urbania.fr
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Délégué à la Protection des Données (DPO)<br />
                  Urbania - Service Juridique<br />
                  Paris, France
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Urbania. Tous droits réservés.{" "}
            <Link to="/terms" className="text-primary hover:underline">CGU</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;

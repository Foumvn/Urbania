import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, FileText, Scale, AlertTriangle, Ban, Copyright, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: "Objet du service",
      content: `Urbania est une plateforme en ligne d'aide à la création de dossiers de déclaration préalable de travaux. Notre service vous permet de générer automatiquement les plans et documents nécessaires (DP1 à DP6) pour constituer votre dossier auprès de votre mairie.

Le service est fourni à titre d'assistance et ne se substitue pas aux conseils d'un professionnel de l'urbanisme. Urbania n'est pas responsable des décisions prises par les autorités compétentes concernant votre dossier.`
    },
    {
      icon: Scale,
      title: "Conditions d'utilisation",
      content: `En utilisant Urbania, vous vous engagez à :

• Fournir des informations exactes et complètes concernant votre projet
• Ne pas utiliser le service à des fins illégales ou frauduleuses
• Respecter les droits de propriété intellectuelle d'Urbania
• Ne pas tenter de contourner les mesures de sécurité du site
• Ne pas revendre ou redistribuer les documents générés à des fins commerciales`
    },
    {
      icon: Copyright,
      title: "Propriété intellectuelle",
      content: `L'ensemble du contenu du site Urbania (textes, images, logos, logiciels, bases de données) est protégé par le droit de la propriété intellectuelle et appartient à Urbania ou à ses partenaires.

Les documents générés pour votre dossier de déclaration préalable vous sont concédés sous licence d'utilisation personnelle et non exclusive, limitée à leur usage administratif prévu.`
    },
    {
      icon: AlertTriangle,
      title: "Limitation de responsabilité",
      content: `Urbania s'efforce de fournir un service de qualité mais ne peut garantir :

• L'acceptation de votre dossier par les autorités d'urbanisme
• L'absence d'erreurs dans les documents générés
• La disponibilité continue et ininterrompue du service
• La compatibilité avec tous les règlements locaux d'urbanisme

En aucun cas, Urbania ne pourra être tenue responsable des dommages directs ou indirects résultant de l'utilisation de ses services.`
    },
    {
      icon: Ban,
      title: "Comportements interdits",
      content: `Sont strictement interdits sur la plateforme :

• Toute tentative d'accès non autorisé aux systèmes
• L'utilisation de robots ou scripts automatisés
• La création de faux documents ou l'usurpation d'identité
• Le harcèlement des autres utilisateurs ou du personnel
• La diffusion de contenu illicite ou diffamatoire`
    },
    {
      icon: RefreshCw,
      title: "Modification des CGU",
      content: `Urbania se réserve le droit de modifier les présentes Conditions Générales d'Utilisation à tout moment. Les utilisateurs seront informés des modifications substantielles par email ou notification sur le site.

La poursuite de l'utilisation du service après modification des CGU vaut acceptation des nouvelles conditions.`
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
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veuillez lire attentivement ces conditions avant d'utiliser la plateforme Urbania.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Dernière mise à jour : 30 janvier 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Acceptance notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
          >
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important :</strong> En créant un compte ou en utilisant 
              les services d'Urbania, vous acceptez d'être lié par les présentes Conditions Générales 
              d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </motion.div>

          {/* Sections */}
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          {/* Pricing and Payment */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Tarifs et paiement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Les tarifs applicables sont ceux affichés sur le site au moment de la commande. 
              Le paiement s'effectue en ligne par carte bancaire de manière sécurisée.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation 
              ne peut être exercé pour les contenus numériques fournis sur un support immatériel 
              dont l'exécution a commencé avec l'accord du consommateur.
            </p>
          </motion.section>

          {/* Applicable law */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Droit applicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux 
              français seront seuls compétents. Avant toute action judiciaire, les parties s'engagent 
              à rechercher une solution amiable.
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
                  Pour toute question relative aux présentes CGU :
                </p>
                <p className="text-foreground font-medium">
                  Email : legal@urbania.fr
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Urbania SAS<br />
                  Service Juridique<br />
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
            <Link to="/privacy" className="text-primary hover:underline">Confidentialité</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;

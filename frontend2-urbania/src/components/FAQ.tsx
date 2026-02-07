import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce qu'une déclaration préalable de travaux ?",
    answer: "Une déclaration préalable (DP) est une autorisation d'urbanisme obligatoire pour certains travaux : piscine, garage, extension, modification de façade, clôture, etc. Elle est moins complexe qu'un permis de construire mais tout aussi réglementée."
  },
  {
    question: "Combien de temps faut-il pour créer mon dossier ?",
    answer: "Grâce à notre IA, votre dossier complet est généré en moins d'une heure. Vous répondez à quelques questions simples, et nous nous occupons du reste : CERFA rempli, plans DP1 à DP6, vérification de conformité."
  },
  {
    question: "Quels documents sont inclus dans le dossier ?",
    answer: "Votre dossier contient le formulaire CERFA officiel pré-rempli, le plan de situation (DP1), le plan de masse (DP2), le plan de coupe (DP3), les plans de façades (DP4), et l'insertion paysagère (DP6) générée par IA."
  },
  {
    question: "Comment l'IA vérifie-t-elle la conformité de mon projet ?",
    answer: "Notre système analyse automatiquement les règles du PLU (Plan Local d'Urbanisme) de votre commune, les contraintes ABF si vous êtes en zone protégée, et les servitudes applicables à votre parcelle."
  },
  {
    question: "Que se passe-t-il si mon dossier est refusé par la mairie ?",
    answer: "Nos dossiers ont un taux d'acceptation de 98%. En cas de demande de pièces complémentaires, nous vous accompagnons pour les fournir. Notre équipe est disponible pour vous aider à chaque étape."
  },
  {
    question: "Puis-je utiliser Urbania pour un permis de construire ?",
    answer: "Actuellement, Urbania se concentre sur les déclarations préalables. Le support des permis de construire est prévu dans une future version. Contactez-nous pour en savoir plus."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-card">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur les déclarations préalables et notre plateforme.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem 
                  value={`item-${index}`} 
                  className="bg-background border border-border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

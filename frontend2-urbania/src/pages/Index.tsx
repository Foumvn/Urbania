import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  Download, 
  ArrowRight,
  Building2,
  Clock,
  Shield,
  Users,
  Sparkles,
  Zap,
  Target,
  Award
} from "lucide-react";
import FAQ from "@/components/FAQ";
import { useRef } from "react";

// Import images
import heroBlueprint from "@/assets/hero-blueprint.jpg";
import neighborhoodAerial from "@/assets/neighborhood-aerial.jpg";
import documentsDesk from "@/assets/documents-desk.jpg";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: MessageSquare,
      title: "Dialogue intelligent",
      description: "Notre IA vous guide pas à pas pour collecter toutes les informations nécessaires à votre déclaration.",
      color: "bg-[hsl(225_60%_96%)]"
    },
    {
      icon: FileText,
      title: "CERFA automatisé",
      description: "Le formulaire officiel est rempli automatiquement avec une précision chirurgicale.",
      color: "bg-[hsl(225_60%_96%)]"
    },
    {
      icon: CheckCircle,
      title: "Conformité garantie",
      description: "Vérification automatique du PLU et des règles locales pour éviter tout refus.",
      color: "bg-[hsl(225_60%_96%)]"
    },
    {
      icon: Download,
      title: "Dossier complet",
      description: "Téléchargez un dossier prêt à déposer : CERFA + plans DP1 à DP6.",
      color: "bg-[hsl(225_60%_96%)]"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Choisissez votre projet",
      description: "Sélectionnez le type de travaux parmi nos catégories : piscine, extension, garage, abri de jardin...",
      icon: Target
    },
    {
      number: "2",
      title: "Personnalisez votre dossier",
      description: "Remplissez chaque section avec l'aide de notre IA. Utilisez la vérification automatique pour éviter les erreurs !",
      icon: Sparkles
    },
    {
      number: "3",
      title: "Téléchargez votre dossier",
      description: "Téléchargez votre dossier complet au format PDF. Il ne vous reste plus qu'à déposer en mairie !",
      icon: Download
    }
  ];

  const stats = [
    { value: "< 1h", label: "Temps moyen de création", icon: Clock },
    { value: "98%", label: "Dossiers acceptés", icon: Award },
    { value: "6", label: "Plans générés automatiquement", icon: FileText },
    { value: "0", label: "Erreur de saisie", icon: Shield }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Rapide et efficace",
      description: "Créez votre dossier en moins d'une heure au lieu de plusieurs jours."
    },
    {
      icon: Shield,
      title: "Conforme aux normes",
      description: "Vérification automatique du PLU et des règles d'urbanisme locales."
    },
    {
      icon: Award,
      title: "Qualité professionnelle",
      description: "Des plans et documents de qualité architecturale professionnelle."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Building2 className="h-8 w-8 md:h-9 md:w-9 text-primary" />
              </motion.div>
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Urbania</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-10">
              {[
                { href: "#fonctionnalites", label: "Fonctionnalités" },
                { href: "#comment-ca-marche", label: "Comment ça marche" },
                { href: "#faq", label: "FAQ" },
                { href: "/rendez-vous", label: "Rendez-vous", isLink: true }
              ].map((item) => (
                item.isLink ? (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a 
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Connexion</Button>
              </Link>
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="shadow-lg shadow-primary/25">Commencer</Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="pt-16 md:pt-20">
        {/* Hero Section - Style MonCVParfait */}
        <section ref={heroRef} className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--urbania-blue-light))] via-background to-background" />
          
          {/* Decorative shapes */}
          <motion.div 
            className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <motion.div 
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-4 w-4" />
                Automatisé par l'Intelligence Artificielle
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Créez votre{" "}
                <span className="text-primary relative">
                  déclaration préalable
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    <motion.path
                      d="M2 8C50 4 100 2 150 6C200 10 250 8 298 4"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </motion.svg>
                </span>
                {" "}en ligne en 5 minutes
              </motion.h1>
              
              <motion.div 
                className="space-y-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ol className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-muted-foreground">
                  {[
                    "Sélectionnez votre type de projet",
                    "Rédigez avec l'aide de l'IA",
                    "Téléchargez votre dossier complet"
                  ].map((step, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-center gap-2 text-sm sm:text-base"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link to="/signup">
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -2 }} 
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Button size="lg" className="gap-2 text-base px-10 py-6 rounded-xl shadow-xl shadow-primary/30 font-semibold">
                      Créer mon dossier
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/rendez-vous">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="lg" className="gap-2 text-base px-10 py-6 rounded-xl font-semibold border-2">
                      <Clock className="h-5 w-5" />
                      Prendre rendez-vous
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Steps Section - Style MonCVParfait avec numéros stylisés */}
        <section className="py-16 md:py-24 bg-[hsl(var(--urbania-blue-light))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Votre dossier en quelques clics
              </h2>
            </motion.div>

            <motion.div 
              className="grid lg:grid-cols-3 gap-8 lg:gap-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Large styled number */}
                  <motion.div 
                    className="absolute -top-6 left-8 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {step.number}
                  </motion.div>

                  <div className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="gap-2 px-10 py-6 rounded-xl text-base font-semibold shadow-lg shadow-primary/25">
                    Créer mon dossier
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Image */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image side */}
              <motion.div
                className="relative rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <img 
                  src={neighborhoodAerial} 
                  alt="Vue aérienne d'un quartier résidentiel français avec piscines" 
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                
                <motion.div 
                  className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm md:text-base text-foreground font-medium">
                    🏡 Piscines, extensions, abris de jardin... Tous les projets nécessitant une déclaration préalable.
                  </p>
                </motion.div>
              </motion.div>

              {/* Stats side */}
              <div className="order-1 lg:order-2">
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                    En chiffres
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Des résultats concrets
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Notre plateforme a déjà aidé des centaines de particuliers à simplifier leurs démarches administratives.
                  </p>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4 md:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index} 
                      className="relative text-center p-5 md:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                      variants={itemVariants}
                      whileHover={{ y: -3, scale: 1.02 }}
                    >
                      <motion.div 
                        className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                        whileHover={{ rotate: 10 }}
                      >
                        <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </motion.div>
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fonctionnalites" className="py-16 md:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                Fonctionnalités
              </motion.span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Une plateforme complète
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour créer votre dossier de déclaration préalable de travaux.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="group relative p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Blueprint Visual Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroBlueprint} 
              alt="Plan architectural" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  Plans professionnels
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Des plans générés par l'IA conformes aux exigences
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Notre intelligence artificielle génère automatiquement les 6 plans réglementaires 
                  (DP1 à DP6) nécessaires à votre dossier de déclaration préalable.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: "DP1", name: "Plan de situation" },
                    { code: "DP2", name: "Plan de masse" },
                    { code: "DP3", name: "Plan en coupe" },
                    { code: "DP4", name: "Plan des façades" },
                    { code: "DP5", name: "Représentation de l'aspect" },
                    { code: "DP6", name: "Insertion paysagère" }
                  ].map((plan, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {plan.code}
                      </div>
                      <span className="text-sm font-medium text-foreground">{plan.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                  <img 
                    src={heroBlueprint} 
                    alt="Plan architectural détaillé" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
                
                {/* Floating badge */}
                <motion.div 
                  className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-xl font-bold text-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                >
                  6 plans générés
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section - Nouveau */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  Pourquoi Urbania ?
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Simplifiez vos démarches d'urbanisme
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Fini les heures passées à remplir des formulaires complexes. Notre plateforme automatise 
                  l'ensemble du processus pour vous faire gagner du temps et éviter les erreurs.
                </p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex gap-4 items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={documentsDesk} 
                    alt="Documents CERFA et plans architecturaux" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                  
                  {/* Floating cards over image */}
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "CERFA rempli", icon: FileText },
                      { label: "Plans DP1-DP6", icon: Target }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="bg-card/95 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-border/50 flex items-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="comment-ca-marche" className="py-16 md:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                Processus
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Un processus simple en 4 étapes pour obtenir votre dossier complet.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2" />
              
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {[
                  { number: "01", title: "Décrivez votre projet", description: "Piscine, garage, extension... Expliquez simplement ce que vous souhaitez construire." },
                  { number: "02", title: "L'IA analyse et collecte", description: "Récupération automatique des données cadastrales et vérification des règles PLU." },
                  { number: "03", title: "Génération des plans", description: "Création automatique des plans réglementaires DP1 à DP6 et insertion paysagère." },
                  { number: "04", title: "Téléchargez votre dossier", description: "Recevez votre dossier complet prêt à déposer en mairie ou via le GNAU." }
                ].map((step, index) => (
                  <motion.div 
                    key={index} 
                    className="relative text-center"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-xl shadow-primary/30"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Prêt à simplifier vos démarches ?
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Rejoignez les particuliers qui ont déjà fait confiance à Urbania pour leurs projets de travaux.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="secondary" className="gap-2 text-base px-10 py-6 rounded-xl font-semibold shadow-xl">
                    Créer mon compte
                    <Users className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/rendez-vous">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="gap-2 text-base px-10 py-6 rounded-xl font-semibold bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Nous contacter
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Building2 className="h-7 w-7" />
                <span className="text-xl font-bold">Urbania</span>
              </div>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                Plateforme d'automatisation des démarches d'urbanisme par l'intelligence artificielle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li><a href="#fonctionnalites" className="hover:text-primary-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#comment-ca-marche" className="hover:text-primary-foreground transition-colors">Comment ça marche</a></li>
                <li><a href="#faq" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
                <li><Link to="/rendez-vous" className="hover:text-primary-foreground transition-colors">Rendez-vous</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Compte</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li><Link to="/login" className="hover:text-primary-foreground transition-colors">Connexion</Link></li>
                <li><Link to="/signup" className="hover:text-primary-foreground transition-colors">Inscription</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li><Link to="/privacy" className="hover:text-primary-foreground transition-colors">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-primary-foreground transition-colors">CGU</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/70">
            <p>© 2025 Urbania. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

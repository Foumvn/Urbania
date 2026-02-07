import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Download,
  Edit3,
  MessageSquare,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Search,
  Filter,
  User,
  LogOut,
  Settings,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import api from "@/services/api";

const Dashboard = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await api.get('/dossiers/');
      const formattedDocs = response.data.map((doc: any) => ({
        id: doc.id,
        title: getProjectTitle(doc.data),
        type: getProjectTypeLabel(doc.data?.projectType),
        status: doc.status || "draft",
        date: new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        address: doc.data?.address ? `${doc.data.address}, ${doc.data.postalCode} ${doc.data.city}` : "Adresse non définie"
      }));
      setDocuments(formattedDocs);
    } catch (error) {
      console.error("Failed to fetch dossiers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectTitle = (data: any) => {
    if (!data) return "Nouveau dossier";
    const type = getProjectTypeLabel(data.projectType);
    return `${type} - ${data.city || 'Projet'}`;
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'extension': return "Extension";
      case 'new_construction': return "Nouvelle construction";
      case 'pool': return "Piscine";
      case 'fencing': return "Clôture";
      case 'renovation': return "Rénovation";
      case 'annex': return "Annexe";
      default: return "Déclaration Préalable";
    }
  };

  const quickActions = [
    {
      icon: Plus,
      title: "Nouveau dossier",
      description: "Créer une nouvelle déclaration préalable",
      color: "bg-primary",
      link: "/nouveau-dossier"
    },
    {
      icon: Download,
      title: "Télécharger CERFA",
      description: "Télécharger un dossier complet",
      color: "bg-[hsl(155_60%_40%)]",
      link: "/telecharger"
    },
    {
      icon: Edit3,
      title: "Modifier un dossier",
      description: "Reprendre un dossier existant",
      color: "bg-[hsl(25_90%_55%)]",
      link: "/modifier"
    },
    {
      icon: MessageSquare,
      title: "Nous contacter",
      description: "Besoin d'aide ? Contactez-nous",
      color: "bg-[hsl(280_70%_50%)]",
      link: "/rendez-vous"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Terminé
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            En cours
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            Brouillon
          </span>
        );
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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

  return (
    <div className="min-h-screen bg-[hsl(var(--urbania-blue-light))]">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-card border-b border-border shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Urbania</span>
            </Link>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">Jean Dupont</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/rendez-vous" className="flex items-center cursor-pointer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Welcome Section */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bonjour, Jean 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez vos déclarations préalables de travaux en toute simplicité.
          </p>
        </motion.div>

        {/* Quick Actions - Style MonCVParfait */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {quickActions.map((action, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link to={action.link}>
                <motion.div
                  className="relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden h-full"
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Colored accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${action.color}`} />

                  <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>

                  <ChevronRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">Mes dossiers</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-auto"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrer</span>
              </Button>
            </div>
          </div>

          {/* Documents Grid */}
          <motion.div
            className="grid gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                className="bg-card rounded-2xl p-5 md:p-6 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:shadow-lg transition-all">
                      <FileText className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{doc.address}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{doc.type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-16 md:ml-0">
                    {getStatusBadge(doc.status)}

                    <div className="flex items-center gap-2">
                      {doc.status === "completed" && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </Button>
                        </motion.div>
                      )}
                      {doc.status !== "completed" && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Continuer</span>
                          </Button>
                        </motion.div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border shadow-lg z-50">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State (hidden when there are documents) */}
          {documents.length === 0 && (
            <motion.div
              className="text-center py-16 bg-card rounded-2xl border border-dashed border-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Aucun dossier</h3>
              <p className="text-muted-foreground mb-6">Créez votre premier dossier de déclaration préalable</p>
              <Link to="/nouveau-dossier">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau dossier
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-6 md:p-8 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <MessageSquare className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Besoin d'aide ?</h3>
                <p className="text-muted-foreground">Notre équipe est disponible pour vous accompagner</p>
              </div>
            </div>
            <Link to="/rendez-vous">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                  Prendre rendez-vous
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Settings,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Edit3,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for charts
const dossiersPerMonth = [
  { month: "Jan", dossiers: 12, completed: 8 },
  { month: "Fév", dossiers: 19, completed: 15 },
  { month: "Mar", dossiers: 25, completed: 20 },
  { month: "Avr", dossiers: 32, completed: 28 },
  { month: "Mai", dossiers: 28, completed: 24 },
  { month: "Juin", dossiers: 35, completed: 30 },
  { month: "Juil", dossiers: 42, completed: 38 },
];

const projectTypes = [
  { name: "Extension", value: 35, color: "hsl(var(--primary))" },
  { name: "Piscine", value: 22, color: "hsl(210, 70%, 50%)" },
  { name: "Abri jardin", value: 18, color: "hsl(150, 60%, 45%)" },
  { name: "Carport", value: 15, color: "hsl(280, 60%, 50%)" },
  { name: "Clôture", value: 10, color: "hsl(30, 80%, 55%)" },
];

const recentDossiers = [
  { id: 1, reference: "DP-2025-0042", declarant: "Jean Dupont", type: "Extension", status: "completed", date: "2025-02-03", commune: "Paris 15e" },
  { id: 2, reference: "DP-2025-0041", declarant: "Marie Martin", type: "Piscine", status: "in_progress", date: "2025-02-02", commune: "Lyon 6e" },
  { id: 3, reference: "DP-2025-0040", declarant: "Pierre Durand", type: "Abri jardin", status: "pending", date: "2025-02-01", commune: "Bordeaux" },
  { id: 4, reference: "DP-2025-0039", declarant: "Sophie Bernard", type: "Carport", status: "completed", date: "2025-01-31", commune: "Toulouse" },
  { id: 5, reference: "DP-2025-0038", declarant: "Lucas Petit", type: "Extension", status: "rejected", date: "2025-01-30", commune: "Marseille 8e" },
  { id: 6, reference: "DP-2025-0037", declarant: "Emma Richard", type: "Clôture", status: "completed", date: "2025-01-29", commune: "Nantes" },
];

const activityLog = [
  { id: 1, action: "Dossier DP-2025-0042 validé", user: "Admin", time: "Il y a 5 min" },
  { id: 2, action: "Nouvel utilisateur inscrit", user: "Système", time: "Il y a 15 min" },
  { id: 3, action: "PDF généré pour DP-2025-0041", user: "Marie Martin", time: "Il y a 1h" },
  { id: 4, action: "Commentaire ajouté sur DP-2025-0039", user: "Admin", time: "Il y a 2h" },
  { id: 5, action: "Dossier DP-2025-0038 rejeté", user: "Admin", time: "Il y a 3h" },
];

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7j");

  const stats = [
    { 
      title: "Total dossiers", 
      value: "193", 
      change: "+12%", 
      trend: "up",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Utilisateurs actifs", 
      value: "847", 
      change: "+8%", 
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      title: "Taux complétion", 
      value: "86%", 
      change: "+3%", 
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      title: "En attente", 
      value: "23", 
      change: "-5%", 
      trend: "down",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30"
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels = {
      completed: "Terminé",
      in_progress: "En cours",
      pending: "En attente",
      rejected: "Rejeté",
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-card border-b border-border shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <Building2 className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold text-foreground">Urbania</span>
              </Link>
              <span className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Settings className="h-3 w-3" />
                Administration
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Rechercher un dossier..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
              </Button>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Tableau de bord administrateur
            </h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de l'activité Urbania
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["24h", "7j", "30j", "12m"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-2 text-xs font-medium",
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {stat.change} vs mois dernier
                      </div>
                    </div>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgColor)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Évolution des dossiers</CardTitle>
                  <CardDescription>Dossiers créés et complétés par mois</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dossiersPerMonth}>
                    <defs>
                      <linearGradient id="colorDossiers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="dossiers" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDossiers)" 
                      name="Créés"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="hsl(150, 60%, 45%)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                      name="Complétés"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Types de projets</CardTitle>
              <CardDescription>Répartition par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {projectTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {projectTypes.map((type) => (
                  <div key={type.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-muted-foreground truncate">{type.name}</span>
                    <span className="font-medium text-foreground ml-auto">{type.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table and Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Dossiers Table */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Dossiers récents</CardTitle>
                  <CardDescription>Dernières déclarations préalables</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrer
                  </Button>
                  <Link to="/nouveau-dossier">
                    <Button size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Nouveau
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Déclarant</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Commune</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDossiers.map((dossier) => (
                    <TableRow key={dossier.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-medium">
                        {dossier.reference}
                      </TableCell>
                      <TableCell>{dossier.declarant}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {dossier.type}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {dossier.commune}
                      </TableCell>
                      <TableCell>{getStatusBadge(dossier.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit3 className="h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Affichage 1-6 sur 193 dossiers
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Activité récente</CardTitle>
                  <CardDescription>Journal des actions</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{log.user}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                Voir l'historique complet
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { title: "Exporter les données", icon: Download, description: "CSV, Excel, PDF" },
            { title: "Gérer les utilisateurs", icon: Users, description: "847 utilisateurs" },
            { title: "Paramètres système", icon: Settings, description: "Configuration" },
            { title: "Statistiques avancées", icon: BarChart3, description: "Analytics détaillés" },
          ].map((action) => (
            <Card 
              key={action.title} 
              className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <action.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;

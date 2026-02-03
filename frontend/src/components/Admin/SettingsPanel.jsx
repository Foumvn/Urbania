import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

function SettingsPanel() {
    const [settings, setSettings] = useState({
        // Paramètres généraux
        siteName: 'Urbania CERFA Builder',
        siteDescription: 'Application de génération de déclarations préalables de travaux',
        adminEmail: 'admin@urbania.fr',
        supportEmail: 'support@urbania.fr',

        // Paramètres CERFA
        cerfaVersion: '13703*08',
        autoSaveInterval: 30,
        sessionTimeout: 60,
        maxSessionsPerUser: 10,

        // Notifications
        emailNotifications: true,
        notifyOnComplete: true,
        notifyOnAbandon: false,

        // Stockage
        storageType: 'local',
        autoCleanup: true,
        cleanupDays: 90,

        // Sécurité
        requireAuth: false,
        allowAnonymous: true,
        captchaEnabled: false,
    });

    const [saved, setSaved] = useState(false);
    const [communes, setCommunes] = useState([
        { code: '75056', nom: 'Paris', departement: '75' },
        { code: '13055', nom: 'Marseille', departement: '13' },
        { code: '69123', nom: 'Lyon', departement: '69' },
    ]);
    const [communeDialogOpen, setCommuneDialogOpen] = useState(false);
    const [newCommune, setNewCommune] = useState({ code: '', nom: '', departement: '' });

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings({ ...settings, [field]: value });
        setSaved(false);
    };

    const handleSave = () => {
        // Save to localStorage or API
        localStorage.setItem('urbania_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Réinitialiser tous les paramètres par défaut ?')) {
            localStorage.removeItem('urbania_settings');
            window.location.reload();
        }
    };

    const handleAddCommune = () => {
        if (newCommune.code && newCommune.nom) {
            setCommunes([...communes, newCommune]);
            setNewCommune({ code: '', nom: '', departement: '' });
            setCommuneDialogOpen(false);
        }
    };

    const handleDeleteCommune = (code) => {
        setCommunes(communes.filter(c => c.code !== code));
    };

    const SectionTitle = ({ icon, title, subtitle }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={700}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box>
            {saved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Paramètres sauvegardés avec succès !
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Général */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <SectionTitle
                            icon={<SettingsIcon />}
                            title="Paramètres généraux"
                            subtitle="Configuration de base du site"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nom du site"
                                    value={settings.siteName}
                                    onChange={handleChange('siteName')}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={settings.siteDescription}
                                    onChange={handleChange('siteDescription')}
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email admin"
                                    value={settings.adminEmail}
                                    onChange={handleChange('adminEmail')}
                                    size="small"
                                    type="email"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email support"
                                    value={settings.supportEmail}
                                    onChange={handleChange('supportEmail')}
                                    size="small"
                                    type="email"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* CERFA */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <SectionTitle
                            icon={<DescriptionIcon />}
                            title="Paramètres CERFA"
                            subtitle="Configuration du formulaire CERFA 13703"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Version CERFA"
                                    value={settings.cerfaVersion}
                                    onChange={handleChange('cerfaVersion')}
                                    size="small"
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Sauvegarde auto (secondes)"
                                    value={settings.autoSaveInterval}
                                    onChange={handleChange('autoSaveInterval')}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Timeout session (minutes)"
                                    value={settings.sessionTimeout}
                                    onChange={handleChange('sessionTimeout')}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Max sessions/utilisateur"
                                    value={settings.maxSessionsPerUser}
                                    onChange={handleChange('maxSessionsPerUser')}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Notifications */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <SectionTitle
                            icon={<EmailIcon />}
                            title="Notifications"
                            subtitle="Paramètres d'envoi d'emails"
                        />

                        <List sx={{ py: 0 }}>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="Notifications par email"
                                    secondary="Activer l'envoi d'emails automatiques"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onChange={handleChange('emailNotifications')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="Déclaration terminée"
                                    secondary="Envoyer un email à la fin du formulaire"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifyOnComplete}
                                        onChange={handleChange('notifyOnComplete')}
                                        disabled={!settings.emailNotifications}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="Session abandonnée"
                                    secondary="Relancer les utilisateurs qui n'ont pas terminé"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifyOnAbandon}
                                        onChange={handleChange('notifyOnAbandon')}
                                        disabled={!settings.emailNotifications}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Stockage */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <SectionTitle
                            icon={<StorageIcon />}
                            title="Stockage des données"
                            subtitle="Gestion du stockage des sessions"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Type de stockage</InputLabel>
                                    <Select
                                        value={settings.storageType}
                                        onChange={handleChange('storageType')}
                                        label="Type de stockage"
                                    >
                                        <MenuItem value="local">Stockage local (localStorage)</MenuItem>
                                        <MenuItem value="server">Serveur (base de données)</MenuItem>
                                        <MenuItem value="cloud">Cloud (AWS S3)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.autoCleanup}
                                        onChange={handleChange('autoCleanup')}
                                    />
                                }
                                label="Nettoyage automatique des anciennes sessions"
                            />
                            {settings.autoCleanup && (
                                <TextField
                                    fullWidth
                                    label="Supprimer après (jours)"
                                    value={settings.cleanupDays}
                                    onChange={handleChange('cleanupDays')}
                                    size="small"
                                    type="number"
                                    sx={{ mt: 2 }}
                                />
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Sécurité */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <SectionTitle
                            icon={<SecurityIcon />}
                            title="Sécurité"
                            subtitle="Paramètres de sécurité et d'accès"
                        />

                        <List sx={{ py: 0 }}>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="Authentification requise"
                                    secondary="Les utilisateurs doivent se connecter"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.requireAuth}
                                        onChange={handleChange('requireAuth')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="Sessions anonymes"
                                    secondary="Permettre les déclarations sans compte"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.allowAnonymous}
                                        onChange={handleChange('allowAnonymous')}
                                        disabled={settings.requireAuth}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                    primary="CAPTCHA"
                                    secondary="Protection anti-bot sur le formulaire"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.captchaEnabled}
                                        onChange={handleChange('captchaEnabled')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Communes configurées */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Communes configurées
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setCommuneDialogOpen(true)}
                            >
                                Ajouter
                            </Button>
                        </Box>

                        <List sx={{ py: 0 }}>
                            {communes.map((commune, index) => (
                                <ListItem
                                    key={commune.code}
                                    sx={{ px: 0 }}
                                    divider={index < communes.length - 1}
                                >
                                    <ListItemText
                                        primary={commune.nom}
                                        secondary={`Code INSEE: ${commune.code} • Département: ${commune.departement}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton size="small" onClick={() => handleDeleteCommune(commune.code)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Actions */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RestoreIcon />}
                    onClick={handleReset}
                    color="error"
                >
                    Réinitialiser
                </Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                        background: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)',
                    }}
                >
                    Sauvegarder les paramètres
                </Button>
            </Box>

            {/* Add Commune Dialog */}
            <Dialog open={communeDialogOpen} onClose={() => setCommuneDialogOpen(false)}>
                <DialogTitle>Ajouter une commune</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nom de la commune"
                                value={newCommune.nom}
                                onChange={(e) => setNewCommune({ ...newCommune, nom: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Code INSEE"
                                value={newCommune.code}
                                onChange={(e) => setNewCommune({ ...newCommune, code: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Département"
                                value={newCommune.departement}
                                onChange={(e) => setNewCommune({ ...newCommune, departement: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommuneDialogOpen(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddCommune}>Ajouter</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SettingsPanel;

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

    const SectionTitle = ({ icon, title, subtitle, colorClass = "bg-blue-50 text-blue-600" }) => (
        <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{subtitle}</p>
            </div>
        </div>
    );

    const CustomInput = ({ label, ...props }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            <input
                {...props}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 disabled:opacity-50"
            />
        </div>
    );

    const CustomSwitch = ({ label, checked, onChange, disabled }) => (
        <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${checked ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-slate-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-200'}`}>
            <span className="text-sm font-bold text-slate-700">{label}</span>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
        </label>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {saved && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-[24px] flex items-center gap-3 font-bold text-sm shadow-sm animate-in zoom-in-95 duration-300">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    Paramètres sauvegardés avec succès !
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Général */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle
                        icon={<SettingsIcon />}
                        title="Paramètres généraux"
                        subtitle="Configuration de base du site"
                        colorClass="bg-blue-50 text-blue-600"
                    />

                    <div className="space-y-4">
                        <CustomInput
                            label="Nom du site"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName')(e)}
                        />
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleChange('siteDescription')(e)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <CustomInput
                                label="Email admin"
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => handleChange('adminEmail')(e)}
                            />
                            <CustomInput
                                label="Email support"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange('supportEmail')(e)}
                            />
                        </div>
                    </div>
                </div>

                {/* CERFA */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle
                        icon={<DescriptionIcon />}
                        title="Paramètres CERFA"
                        subtitle="Moteur de génération 13703"
                        colorClass="bg-indigo-50 text-indigo-600"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <CustomInput
                            label="Version CERFA"
                            value={settings.cerfaVersion}
                            disabled
                        />
                        <CustomInput
                            label="Sauvegarde auto (sec)"
                            type="number"
                            value={settings.autoSaveInterval}
                            onChange={(e) => handleChange('autoSaveInterval')(e)}
                        />
                        <CustomInput
                            label="Timeout session (min)"
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => handleChange('sessionTimeout')(e)}
                        />
                        <CustomInput
                            label="Max sessions / user"
                            type="number"
                            value={settings.maxSessionsPerUser}
                            onChange={(e) => handleChange('maxSessionsPerUser')(e)}
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle
                        icon={<EmailIcon />}
                        title="Notifications"
                        subtitle="Flux de communication sortant"
                        colorClass="bg-amber-50 text-amber-600"
                    />

                    <div className="space-y-3">
                        <CustomSwitch
                            label="Notifications par email"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleChange('emailNotifications')(e)}
                        />
                        <CustomSwitch
                            label="Déclaration terminée"
                            checked={settings.notifyOnComplete}
                            disabled={!settings.emailNotifications}
                            onChange={(e) => handleChange('notifyOnComplete')(e)}
                        />
                        <CustomSwitch
                            label="Relance session abandonnée"
                            checked={settings.notifyOnAbandon}
                            disabled={!settings.emailNotifications}
                            onChange={(e) => handleChange('notifyOnAbandon')(e)}
                        />
                    </div>
                </div>

                {/* Stockage */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle
                        icon={<StorageIcon />}
                        title="Stockage des données"
                        subtitle="Cycle de vie des fichiers"
                        colorClass="bg-emerald-50 text-emerald-600"
                    />

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type de stockage</label>
                            <select
                                value={settings.storageType}
                                onChange={(e) => handleChange('storageType')(e)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="local">Stockage local (localStorage)</option>
                                <option value="server">Serveur (base de données)</option>
                                <option value="cloud">Cloud (AWS S3)</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <CustomSwitch
                                label="Nettoyage automatique"
                                checked={settings.autoCleanup}
                                onChange={(e) => handleChange('autoCleanup')(e)}
                            />
                        </div>

                        {settings.autoCleanup && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <CustomInput
                                    label="Délai de rétention (jours)"
                                    type="number"
                                    value={settings.cleanupDays}
                                    onChange={(e) => handleChange('cleanupDays')(e)}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Sécurité */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <SectionTitle
                        icon={<SecurityIcon />}
                        title="Sécurité & Accès"
                        subtitle="Protocoles de protection"
                        colorClass="bg-red-50 text-red-600"
                    />

                    <div className="space-y-3">
                        <CustomSwitch
                            label="Authentification stricte"
                            checked={settings.requireAuth}
                            onChange={(e) => handleChange('requireAuth')(e)}
                        />
                        <CustomSwitch
                            label="Autoriser invité (Anonymous)"
                            checked={settings.allowAnonymous}
                            disabled={settings.requireAuth}
                            onChange={(e) => handleChange('allowAnonymous')(e)}
                        />
                        <CustomSwitch
                            label="Protection CAPTCHA"
                            checked={settings.captchaEnabled}
                            onChange={(e) => handleChange('captchaEnabled')(e)}
                        />
                    </div>
                </div>

                {/* Communes */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle
                            icon={<DescriptionIcon />}
                            title="Communes"
                            subtitle="Localités supportées"
                            colorClass="bg-slate-900 text-white"
                        />
                        <button
                            onClick={() => setCommuneDialogOpen(true)}
                            className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            <AddIcon fontSize="small" />
                        </button>
                    </div>

                    <div className="flex-grow space-y-2 max-h-[280px] overflow-auto px-1">
                        {communes.length === 0 ? (
                            <div className="py-12 text-center text-slate-300 font-bold italic text-sm">
                                Aucune commune configurée
                            </div>
                        ) : (
                            communes.map((commune) => (
                                <div key={commune.code} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-slate-300">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight">{commune.nom}</h4>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                            INSEE: {commune.code} • Dept: {commune.departement}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCommune(commune.code)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <DeleteIcon fontSize="inherit" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Final Actions Container */}
            <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-900/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-white">
                    <p className="font-black text-xl tracking-tight">Appliquer les modifications ?</p>
                    <p className="text-slate-400 text-sm font-medium">Certains changement peuvent affecter les sessions actives.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex-grow md:flex-initial px-8 py-4 bg-slate-800 text-white font-black text-sm rounded-2xl hover:bg-red-900/20 hover:text-red-400 transition-all border border-slate-700 active:scale-95"
                    >
                        Réinitialiser
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-grow md:flex-initial px-10 py-4 bg-white text-slate-900 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        <SaveIcon style={{ fontSize: 18 }} />
                        Appliquer
                    </button>
                </div>
            </div>

            {/* Add Commune Modal Styled */}
            {communeDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCommuneDialogOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-8"
                    >
                        <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Nouvelle Commune</h3>
                        <div className="space-y-6">
                            <CustomInput
                                label="Nom de la commune"
                                placeholder="ex: Paris"
                                value={newCommune.nom}
                                onChange={(e) => setNewCommune({ ...newCommune, nom: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <CustomInput
                                    label="Code INSEE"
                                    placeholder="ex: 75056"
                                    value={newCommune.code}
                                    onChange={(e) => setNewCommune({ ...newCommune, code: e.target.value })}
                                />
                                <CustomInput
                                    label="Département"
                                    placeholder="ex: 75"
                                    value={newCommune.departement}
                                    onChange={(e) => setNewCommune({ ...newCommune, departement: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setCommuneDialogOpen(false)}
                                className="flex-1 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddCommune}
                                className="flex-1 py-4 bg-[#0f172a] text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                Ajouter
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default SettingsPanel;

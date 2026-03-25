import React, { useState } from 'react';
import {
    Box, Typography, Grid, Button, CircularProgress,
    Snackbar, Alert, Collapse, Paper, Chip, Divider
} from '@mui/material';
import {
    Sparkles, Paintbrush, Home, Waves, Fence,
    ArrowRightLeft, Info, Layers, Warehouse
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import FormSelect from '../Common/FormSelect';
import {
    BLOCS, BLOCS_INFO, getProjectConfig,
    CHAMPS_CERFA, DESTINATIONS_CERFA
} from '../../config/projectConfigs';

// ── Icônes par bloc ──────────────────────────────────────────────────────────
const BLOCS_ICONS = {
    [BLOCS.ASPECT]: { icon: Paintbrush, color: '#f59e0b' },
    [BLOCS.CONSTRUCTION]: { icon: Home, color: '#10b981' },
    [BLOCS.PISCINE]: { icon: Waves, color: '#06b6d4' },
    [BLOCS.CLOTURE]: { icon: Fence, color: '#8b5cf6' },
    [BLOCS.CHANGEMENT_DESTINATION]: { icon: ArrowRightLeft, color: '#ec4899' },
    [BLOCS.STATIONNEMENT]: { icon: Home, color: '#3b82f6' },
    [BLOCS.LEGISLATIONS_CONNEXES]: { icon: Info, color: '#ef4444' },
};

// ── Rendus d'un champ CERFA ──────────────────────────────────────────────────
function CerfaField({ fieldName, config, data, onChange }) {
    if (!config) return null;

    if (config.type === 'select') {
        return (
            <FormSelect
                label={config.label}
                name={fieldName}
                value={data[fieldName] ?? ''}
                onChange={onChange}
                options={(config.options || []).map(o => ({ value: o, label: o }))}
            />
        );
    }
    if (config.type === 'boolean') {
        return (
            <FormSelect
                label={config.label}
                name={fieldName}
                value={data[fieldName] === true ? 'Oui' : data[fieldName] === false ? 'Non' : ''}
                onChange={(name, val) => onChange(name, val === 'Oui')}
                options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
            />
        );
    }
    return (
        <FormField
            label={config.label}
            name={fieldName}
            value={data[fieldName] ?? ''}
            onChange={onChange}
            type={config.type === 'number' ? 'number' : 'text'}
            endAdornment={config.suffix}
            readOnly={config.readonly}
        />
    );
}

// ── En-tête de section ───────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, label, cerfaRef }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box sx={{
                width: 40, height: 40, borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: `${color}15`
            }}>
                <Icon size={20} color={color} />
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={700} color="#1e293b">{label}</Typography>
                {cerfaRef && (
                    <Typography variant="caption" color="text.secondary">{cerfaRef}</Typography>
                )}
            </Box>
        </Box>
    );
}

// ── Composant principal ──────────────────────────────────────────────────────
function Step6DescriptionProjet() {
    const {
        data, setField, errors,
        generateDescriptionWithAI,
        projectConfig
    } = useForm();

    const [isGenerating, setIsGenerating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleChange = (name, value) => setField(name, value);

    const handleGenerateDescription = async () => {
        if (!data.natureTravaux?.length && !data.descriptionProjet) {
            setSnackbar({ open: true, message: 'Sélectionnez d\'abord un type de projet', severity: 'warning' });
            return;
        }
        setIsGenerating(true);
        try {
            const desc = await generateDescriptionWithAI(data.typeTravaux, data.natureTravaux, data.autreNatureTravaux);
            if (desc) {
                setField('descriptionProjet', desc);
                setSnackbar({ open: true, message: 'Description générée !', severity: 'success' });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const activatedBlocs = projectConfig?.blocs || [];
    const natureType = (data.natureTravaux || [])[0];

    // ── Champs emprise au sol (calcul auto total) ────────────────────────────
    const empriseExistante = parseFloat(data.empriseExistante) || 0;
    const empriseCreee = parseFloat(data.empriseCreee) || 0;
    const empriseSupprimee = parseFloat(data.empriseSupprimee) || 0;
    const empriseTotale = empriseExistante + empriseCreee - empriseSupprimee;

    const showEmprise = activatedBlocs.some(b =>
        [BLOCS.CONSTRUCTION, BLOCS.PISCINE, 'stationnement'].includes(b)
    );

    // ── Logements conditionnels ──────────────────────────────────────────────
    const nombreLogements = parseInt(data.nombreLogements) || 0;
    const showLogementDetails = nombreLogements > 0;
    const modeUtilisation = data.modeUtilisation || '';
    const showTypeResidence = modeUtilisation === 'Occupation personnelle';
    const showFinancements = showLogementDetails;
    const showPieces = showLogementDetails;

    // ── Législations connexes filtrées selon type ────────────────────────────
    const legislationsChamps = projectConfig?.legislationsChamps || [];

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                Complétez les informations techniques. Les champs affichés correspondent exactement aux
                cadres du CERFA 16702-02 requis pour votre type de projet.
            </Typography>

            {/* Badges blocs actifs */}
            {activatedBlocs.length > 0 && (
                <Box sx={{ mb: 4, p: 2, borderRadius: '12px', bgcolor: 'rgba(0,35,149,0.04)', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="body2" fontWeight={600} color="#002395">Catégories actives :</Typography>
                    {activatedBlocs.map(bloc => {
                        const info = BLOCS_INFO[bloc];
                        const { icon: BlocIcon, color } = BLOCS_ICONS[bloc] || { icon: Info, color: '#64748b' };
                        return (
                            <Chip
                                key={bloc}
                                icon={<BlocIcon size={13} />}
                                label={info?.label || bloc}
                                size="small"
                                sx={{ bgcolor: `${color}15`, color, fontWeight: 600, '& .MuiChip-icon': { color } }}
                            />
                        );
                    })}
                </Box>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CADRE 4.1 — Description du projet (TOUJOURS PRÉSENTE)       */}
            {/* ════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 8, height: 24, borderRadius: '4px', bgcolor: '#002395' }} />
                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                        Cadre 4.1 — Description du projet
                    </Typography>
                    <Chip label="Obligatoire" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>
                <Box sx={{ position: 'relative' }}>
                    <FormField
                        label="Courte description de votre projet ou de vos travaux *"
                        name="descriptionProjet"
                        value={data.descriptionProjet}
                        onChange={handleChange}
                        error={errors?.descriptionProjet}
                        required
                        multiline
                        rows={4}
                        placeholder="Ex : Construction d'un abri de jardin, hauteur ≤ 4m, surface ≤ 20m²..."
                    />
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={isGenerating ? <CircularProgress size={13} color="inherit" /> : <Sparkles size={13} />}
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        sx={{
                            position: 'absolute', bottom: 12, right: 12,
                            borderRadius: '8px', textTransform: 'none', bgcolor: '#002395',
                            fontWeight: 600, fontSize: '0.75rem', '&:hover': { bgcolor: '#001a6e' }
                        }}
                    >
                        {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
                    </Button>
                </Box>
            </Paper>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CADRE 4.2 — Construction / Informations complémentaires     */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.CONSTRUCTION) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Home} color="#10b981" label="Cadre 4.2 — Informations complémentaires" cerfaRef="Construction / Extension" />

                    <Grid container spacing={3}>
                        {/* Nombre de logements créés */}
                        <Grid item xs={12} sm={4}>
                            <FormField
                                label="Nombre total de logements créés"
                                name="nombreLogements"
                                value={data.nombreLogements ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField
                                label="Dont individuels"
                                name="nombreLogementsIndividuels"
                                value={data.nombreLogementsIndividuels ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField
                                label="Dont collectifs"
                                name="nombreLogementsCollectifs"
                                value={data.nombreLogementsCollectifs ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>

                        {/* Mode d'utilisation */}
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Mode d'utilisation principale"
                                name="modeUtilisation"
                                value={data.modeUtilisation ?? ''}
                                onChange={handleChange}
                                options={['Occupation personnelle', 'Vente', 'Location'].map(o => ({ value: o, label: o }))}
                            />
                        </Grid>

                        {/* Type de résidence — conditionnel */}
                        {showTypeResidence && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Type de résidence"
                                    name="typeResidence"
                                    value={data.typeResidence ?? ''}
                                    onChange={handleChange}
                                    options={['Résidence principale', 'Résidence secondaire'].map(o => ({ value: o, label: o }))}
                                />
                            </Grid>
                        )}

                        {/* Niveaux */}
                        <Grid item xs={12} sm={6}>
                            <FormField
                                label="Nombre de niveaux au-dessus du sol"
                                name="nombreNiveauxDessus"
                                value={data.nombreNiveauxDessus ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormField
                                label="Nombre de niveaux au-dessous du sol"
                                name="nombreNiveauxDessous"
                                value={data.nombreNiveauxDessous ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>

                        {/* Destination service public */}
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Destination pour service public ou collectif"
                                name="destinationServicePublic"
                                value={data.destinationServicePublic ?? ''}
                                onChange={handleChange}
                                options={['Transport', 'Enseignement et recherche', 'Action sociale', 'Ouvrage spécial', 'Santé', 'Culture et loisir', 'Aucun'].map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                    </Grid>

                    {/* Répartition logements — conditionnelle si logements > 0 */}
                    <Collapse in={showLogementDetails}>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2 }}>
                            Répartition par type de financement
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { field: 'logementLocatifSocial', label: 'Logement Locatif Social' },
                                { field: 'accessionSociale', label: 'Accession Sociale' },
                                { field: 'preTauxZero', label: 'Prêt à taux zéro' },
                                { field: 'autresFinancements', label: 'Autres financements' },
                            ].map(({ field, label }) => (
                                <Grid item xs={6} sm={3} key={field}>
                                    <FormField label={label} name={field} value={data[field] ?? ''} onChange={handleChange} type="number" />
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2 }}>
                            Répartition par type de résidence
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { field: 'residencePersonnesAgees', label: 'Résidence personnes âgées' },
                                { field: 'residenceEtudiants', label: 'Résidence étudiants' },
                                { field: 'residenceHoteliere', label: 'Résidence hôtelière' },
                                { field: 'residenceSociale', label: 'Résidence sociale' },
                                { field: 'residenceHandicapes', label: 'Résidence personnes handicapées' },
                                { field: 'autresResidences', label: 'Autres résidences' },
                            ].map(({ field, label }) => (
                                <Grid item xs={6} sm={4} key={field}>
                                    <FormField label={label} name={field} value={data[field] ?? ''} onChange={handleChange} type="number" />
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2 }}>
                            Répartition selon le nombre de pièces
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { field: 'nombrePieces1', label: '1 pièce' },
                                { field: 'nombrePieces2', label: '2 pièces' },
                                { field: 'nombrePieces3', label: '3 pièces' },
                                { field: 'nombrePieces4', label: '4 pièces' },
                                { field: 'nombrePieces5', label: '5 pièces' },
                                { field: 'nombrePieces6Plus', label: '6 pièces et plus' },
                            ].map(({ field, label }) => (
                                <Grid item xs={6} sm={4} key={field}>
                                    <FormField label={label} name={field} value={data[field] ?? ''} onChange={handleChange} type="number" />
                                </Grid>
                            ))}
                        </Grid>
                    </Collapse>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CADRE 4.3 — Emprise au sol                                  */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.some(b =>
                [BLOCS.CONSTRUCTION, BLOCS.PISCINE, 'stationnement'].includes(b)
            ) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Layers} color="#3b82f6" label="Cadre 4.3 — Emprise au sol" cerfaRef="Projection verticale du volume de la construction (Art. R420-1)" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={3}>
                            <FormField label="Avant travaux (m²)" name="empriseSolExistante" value={data.empriseSolExistante ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormField label="Créée (m²)" name="empriseSolCreee" value={data.empriseSolCreee ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormField label="Supprimée (m²)" name="empriseSolSupprimee" value={data.empriseSolSupprimee ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Totale après travaux (m²)
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color="#3b82f6">
                                    {(parseFloat(data.empriseSolExistante) || 0) + (parseFloat(data.empriseSolCreee) || 0) - (parseFloat(data.empriseSolSupprimee) || 0) > 0 ? ((parseFloat(data.empriseSolExistante) || 0) + (parseFloat(data.empriseSolCreee) || 0) - (parseFloat(data.empriseSolSupprimee) || 0)).toFixed(1) : '—'}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">Calculé automatiquement</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CADRE 4.4 — Surface de plancher                             */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.CONSTRUCTION) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Home} color="#8b5cf6" label="Cadre 4.4 — Surface de plancher" cerfaRef="Art. R.111-22 du code de l'urbanisme" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Surface existante avant travaux (m²)" name="surfacePlancherExistante" value={data.surfacePlancherExistante ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Surface créée (m²)" name="surfacePlancherCreee" value={data.surfacePlancherCreee ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Surface supprimée (m²)" name="surfacePlancherSupprimee" value={data.surfacePlancherSupprimee ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ASPECT EXTÉRIEUR (Cadre 4.1 / DPC) — Notices descriptives   */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.ASPECT) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Paintbrush} color="#f59e0b" label="Aspect extérieur" cerfaRef="Cadre 4.1, 4.2 — Notice descriptive DPC11" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Couleur des façades"
                                name="couleurFacade"
                                value={data.couleurFacade ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.aspectExterieur.couleurFacade.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Matériau des façades"
                                name="materiauFacade"
                                value={data.materiauFacade ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.aspectExterieur.materiauFacade.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Couleur de la toiture"
                                name="couleurToiture"
                                value={data.couleurToiture ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.aspectExterieur.couleurToiture.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Matériau de la toiture"
                                name="materiauToiture"
                                value={data.materiauToiture ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.aspectExterieur.materiauToiture.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormField
                                label="Hauteur de la construction (m)"
                                name="hauteurConstruction"
                                value={data.hauteurConstruction ?? ''}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* PISCINE                                                      */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.PISCINE) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Waves} color="#06b6d4" label="Piscine / Bassin" cerfaRef="Cadre 4.2 — Type : Piscine" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormField label="Longueur (m)" name="longueurPiscine" value={data.longueurPiscine ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormField label="Largeur (m)" name="largeurPiscine" value={data.largeurPiscine ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormField label="Surface du bassin (m²)" name="surfaceBassin" value={data.surfaceBassin ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormField label="Profondeur moyenne (m)" name="profondeurMoyenne" value={data.profondeurMoyenne ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Dispositif de sécurité"
                                name="dispositifSecurite"
                                value={data.dispositifSecurite ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.piscine.dispositifSecurite.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Piscine couverte"
                                name="piscineCouverte"
                                value={data.piscineCouverte === true ? 'Oui' : data.piscineCouverte === false ? 'Non' : ''}
                                onChange={(name, val) => handleChange(name, val === 'Oui')}
                                options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CLÔTURE                                                      */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.CLOTURE) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={Fence} color="#8b5cf6" label="Clôture / Portail" cerfaRef="Cadre 4.1 — Clôture" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Hauteur maximale (m)" name="hauteurMax" value={data.hauteurMax ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormSelect
                                label="Matériau"
                                name="materiauCloture"
                                value={data.materiauCloture ?? ''}
                                onChange={handleChange}
                                options={CHAMPS_CERFA.cloture.materiau.options.map(o => ({ value: o, label: o }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Linéaire total (m)" name="lineaireTotal" value={data.lineaireTotal ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Inclut un portail ?"
                                name="includePortail"
                                value={data.includePortail === true ? 'Oui' : data.includePortail === false ? 'Non' : ''}
                                onChange={(name, val) => handleChange(name, val === 'Oui')}
                                options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                            />
                        </Grid>
                        {data.includePortail === true && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Type de portail"
                                    name="typePortail"
                                    value={data.typePortail ?? ''}
                                    onChange={handleChange}
                                    options={CHAMPS_CERFA.cloture.typePortail.options.map(o => ({ value: o, label: o }))}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CHANGEMENT DE DESTINATION (Cadre 4.4)                       */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.CHANGEMENT_DESTINATION) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <SectionHeader icon={ArrowRightLeft} color="#ec4899" label="Changement de destination" cerfaRef="Cadre 4.4 — Destination et surfaces" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Destination actuelle *"
                                name="destinationActuelle"
                                value={data.destinationActuelle ?? ''}
                                onChange={handleChange}
                                options={DESTINATIONS_CERFA.map(d => ({ value: d.value, label: d.label }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                label="Destination future *"
                                name="destinationFuture"
                                value={data.destinationFuture ?? ''}
                                onChange={handleChange}
                                options={DESTINATIONS_CERFA.map(d => ({ value: d.value, label: d.label }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormField label="Surface transformée (m²)" name="surfaceTransforme" value={data.surfaceTransforme ?? ''} onChange={handleChange} type="number" />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* CADRE 5 — Législations connexes (filtrées par type)         */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activatedBlocs.includes(BLOCS.LEGISLATIONS_CONNEXES) && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #fef2f2', bgcolor: 'rgba(239,68,68,0.02)' }}>
                    <SectionHeader icon={Info} color="#ef4444" label="Cadre 5 — Législations connexes" cerfaRef="Loi sur l'eau, environnement, monuments historiques" />

                    <Grid container spacing={3}>
                        {/* Champs filtrés selon le type de projet */}
                        {legislationsChamps.includes('iota') && (
                            <Grid item xs={12}>
                                <FormSelect
                                    label="Installation, ouvrage, travaux ou activité (IOTA) soumis à déclaration Loi sur l'eau"
                                    name="iota"
                                    value={data.iota ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('autorisationEnv') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Travaux soumis à autorisation environnementale"
                                    name="autorisationEnv"
                                    value={data.autorisationEnv ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('derogationEspeces') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Dérogation espèces protégées (L.411-2 4°)"
                                    name="derogationEspeces"
                                    value={data.derogationEspeces ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('enregistrement') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Installation classée soumise à enregistrement (L.512-7)"
                                    name="enregistrement"
                                    value={data.enregistrement ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('avisABF') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Relevé de l'article L.632-2-1 du code du patrimoine (avis ABF)"
                                    name="avisABF"
                                    value={data.avisABF ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('alleeArbres') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Atteinte à une allée d'arbres ou un alignement (L.350-3)"
                                    name="alleeArbres"
                                    value={data.alleeArbres ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('autreLegislations') && (
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Demande d'autorisation au titre d'une autre législation"
                                    name="autreLegislations"
                                    value={data.autreLegislations ?? ''}
                                    onChange={handleChange}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {data.autreLegislations === 'Oui' && (
                            <Grid item xs={12} sm={6}>
                                <FormField
                                    label="Précisez laquelle"
                                    name="precisezAutreLegislations"
                                    value={data.precisezAutreLegislations ?? ''}
                                    onChange={handleChange}
                                />
                            </Grid>
                        )}

                        {/* Périmètres de protection — toujours affichés dans législations */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2, mt: 1 }}>
                                Votre projet se situe-t-il dans les périmètres de protection suivants ?
                            </Typography>
                        </Grid>
                        {legislationsChamps.includes('sitePatrimonialRemarquable') && (
                            <Grid item xs={12} sm={4}>
                                <FormSelect
                                    label="Périmètre site patrimonial remarquable"
                                    name="sitePatrimonialRemarquable"
                                    value={data.sitePatrimonialRemarquable === true ? 'Oui' : data.sitePatrimonialRemarquable === false ? 'Non' : ''}
                                    onChange={(name, val) => handleChange(name, val === 'Oui')}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('abordsMonumentHistorique') && (
                            <Grid item xs={12} sm={4}>
                                <FormSelect
                                    label="Abords d'un monument historique"
                                    name="abordsMonumentHistorique"
                                    value={data.abordsMonumentHistorique === true ? 'Oui' : data.abordsMonumentHistorique === false ? 'Non' : ''}
                                    onChange={(name, val) => handleChange(name, val === 'Oui')}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                        {legislationsChamps.includes('siteClasse') && (
                            <Grid item xs={12} sm={4}>
                                <FormSelect
                                    label="Site classé ou en instance de classement"
                                    name="siteClasse"
                                    value={data.siteClasse === true ? 'Oui' : data.siteClasse === false ? 'Non' : ''}
                                    onChange={(name, val) => handleChange(name, val === 'Oui')}
                                    options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            {/* Message si aucun bloc n'est activé */}
            {activatedBlocs.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: '16px' }}>
                    <Typography variant="body2">
                        <strong>Sélectionnez d'abord un type de projet</strong> à l'étape précédente pour voir les champs CERFA correspondants.
                    </Typography>
                </Alert>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Step6DescriptionProjet;

import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Divider, Alert, Paper, Collapse } from '@mui/material';
import { 
    Info, 
    Home, 
    Car, 
    Coins, 
    Pickaxe,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import FormSelect from '../Common/FormSelect';
import { 
    BLOCS, 
    BLOCS_INFO, 
    getProjectConfig,
    getChampsFiscaux,
    CHAMPS_CERFA
} from '../../config/projectConfigs';

function Step7Surfaces() {
    const { data, setField, setMultipleFields } = useForm();

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const projectConfig = getProjectConfig(data.natureTravaux || []);
    const activatedBlocs = projectConfig.blocs || [];
    const fiscalite = projectConfig.fiscalite || { taxeAmenagement: false, stationnement: false, archeologie: false };
    
    const champsFiscaux = useMemo(() => getChampsFiscaux(activatedBlocs, fiscalite), [activatedBlocs, fiscalite]);

    const showConstruction = activatedBlocs.includes(BLOCS.CONSTRUCTION);
    const showPiscine = activatedBlocs.includes(BLOCS.PISCINE);
    const showChangementDest = activatedBlocs.includes(BLOCS.CHANGEMENT_DESTINATION);
    const showStationnement = fiscalite.stationnement && (showConstruction || showChangementDest);
    const showTaxeAmenagement = fiscalite.taxeAmenagement && showConstruction;
    const showArcheologie = fiscalite.archeologie && showConstruction;

    useEffect(() => {
        const habExist = parseFloat(data.surfaceLogementExistante) || 0;
        const habCree = parseFloat(data.surfaceLogementCreee) || 0;
        const habSupp = parseFloat(data.surfaceLogementSupprimee) || 0;
        const habTotal = habExist + habCree - habSupp;

        const annExist = parseFloat(data.surfaceAnnexeExistante) || 0;
        const annCree = parseFloat(data.surfaceAnnexeCreee) || 0;
        const annSupp = parseFloat(data.surfaceAnnexeSupprimee) || 0;
        const annTotal = annExist + annCree - annSupp;

        const totalExist = habExist + annExist;
        const totalCree = habCree + annCree;
        const totalSupp = habSupp + annSupp;
        const totalGeneral = habTotal + annTotal;

        const empExist = parseFloat(data.empriseSolExistante) || 0;
        const empCree = parseFloat(data.empriseSolCreee) || 0;
        const empSupp = parseFloat(data.empriseSolSupprimee) || 0;
        const empTotal = empExist + empCree - empSupp;

        setMultipleFields({
            surfaceLogementTotal: habTotal > 0 ? habTotal.toString() : '',
            surfaceAnnexeTotal: annTotal > 0 ? annTotal.toString() : '',
            surfacePlancherExistante: totalExist > 0 ? totalExist.toString() : '',
            surfacePlancherCreee: totalCree > 0 ? totalCree.toString() : '',
            surfacePlancherSupprimee: totalSupp > 0 ? totalSupp.toString() : '',
            surfacePlancherTotale: totalGeneral > 0 ? totalGeneral.toString() : '',
            empriseSolTotale: empTotal > 0 ? empTotal.toString() : '',
            surfaceTaxable: totalCree > 0 ? totalCree.toString() : '',
        });
    }, [
        data.surfaceLogementExistante, data.surfaceLogementCreee, data.surfaceLogementSupprimee,
        data.surfaceAnnexeExistante, data.surfaceAnnexeCreee, data.surfaceAnnexeSupprimee,
        data.empriseSolExistante, data.empriseSolCreee, data.empriseSolSupprimee,
        setMultipleFields
    ]);

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Saisissez les surfaces de votre projet. Les sections affichées dépendent des catégories activées.
            </Typography>

            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(0, 35, 149, 0.03)',
                border: '1px solid rgba(0, 35, 149, 0.08)',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start'
            }}>
                <Info size={22} color="#002395" style={{ marginTop: 2 }} />
                <Box>
                    <Typography variant="body2" color="#002395" fontWeight={600}>
                        Surface de plancher
                    </Typography>
                    <Typography variant="caption" color="#64748b" sx={{ lineHeight: 1.5, display: 'block' }}>
                        Somme des surfaces closes et couvertes sous une hauteur de plafond &gt; 1m80, calculée à partir du nu intérieur des façades.
                    </Typography>
                </Box>
            </Box>

            <Collapse in={showConstruction || showPiscine || showChangementDest}>
                <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                    1. Surfaces de plancher
                </Typography>
                
                {showConstruction && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748b', fontWeight: 600 }}>
                            Habitation (Logement)
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Existante" name="surfaceLogementExistante" value={data.surfaceLogementExistante} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Créée" name="surfaceLogementCreee" value={data.surfaceLogementCreee} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Supprimée" name="surfaceLogementSupprimee" value={data.surfaceLogementSupprimee} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Sous-total" name="surfaceLogementTotal" value={data.surfaceLogementTotal} disabled endAdornment="m²" />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748b', fontWeight: 600 }}>
                            Annexes (Garage, Piscine, Abri...)
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Existante" name="surfaceAnnexeExistante" value={data.surfaceAnnexeExistante} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Créée" name="surfaceAnnexeCreee" value={data.surfaceAnnexeCreee} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Supprimée" name="surfaceAnnexeSupprimee" value={data.surfaceAnnexeSupprimee} onChange={handleChange} type="number" endAdornment="m²" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormField label="Sous-total" name="surfaceAnnexeTotal" value={data.surfaceAnnexeTotal} disabled endAdornment="m²" />
                            </Grid>
                        </Grid>
                    </>
                )}

                {showChangementDest && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748b', fontWeight: 600 }}>
                            Surface à transformer (Changement de destination)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormField 
                                    label="Surface à transformer" 
                                    name="surfaceTransforme" 
                                    value={data.surfaceTransforme} 
                                    onChange={handleChange} 
                                    type="number" 
                                    endAdornment="m²" 
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />

                <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                    2. Emprise au sol
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Projection verticale du volume de la construction, tout débords et surplomb inclus.
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <FormField label="Existante" name="empriseSolExistante" value={data.empriseSolExistante} onChange={handleChange} type="number" endAdornment="m²" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormField label="Créée" name="empriseSolCreee" value={data.empriseSolCreee} onChange={handleChange} type="number" endAdornment="m²" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormField label="Totale après projet" name="empriseSolTotale" value={data.empriseSolTotale} disabled endAdornment="m²" />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />
            </Collapse>

            <Collapse in={showStationnement}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Car size={22} color="#10b981" />
                    <Typography variant="h6" sx={{ color: '#1e293b' }} fontWeight={700}>
                        3. Stationnement
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Obligation de stationnement selon le PLU communal (obligatoire pour nouvelles constructions et changements de destination).
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <FormField label="Nombre de places avant projet" name="placesAvant" value={data.placesAvant} onChange={handleChange} type="number" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField label="Nombre de places après projet" name="placesApres" value={data.placesApres} onChange={handleChange} type="number" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField label="Places non couvertes" name="placesParkingDecouvertes" value={data.placesParkingDecouvertes} onChange={handleChange} type="number" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField label="Places couvertes" name="placesParkingCouvertes" value={data.placesParkingCouvertes} onChange={handleChange} type="number" />
                    </Grid>
                </Grid>
                <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />
            </Collapse>

            <Collapse in={Object.keys(champsFiscaux).length > 0}>
                <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                    Informations fiscales
                </Typography>

                {showTaxeAmenagement && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', bgcolor: 'rgba(245, 158, 11, 0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Coins size={20} color="#f59e0b" />
                            <Typography variant="subtitle1" fontWeight={700} color="#b45309">
                                Taxe d'aménagement
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Applicable si surface créée &gt; 5m². Taux variable selon la commune.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormField 
                                    label="Surface taxable" 
                                    name="surfaceTaxable" 
                                    value={data.surfaceTaxable} 
                                    onChange={handleChange} 
                                    type="number" 
                                    endAdornment="m²"
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Puit ou forage prévu ?"
                                    name="puitsForage"
                                    value={data.puitsForage === true ? 'oui' : data.puitsForage === false ? 'non' : ''}
                                    onChange={(name, val) => handleChange(name, val === 'oui')}
                                    options={[
                                        { value: 'oui', label: 'Oui' },
                                        { value: 'non', label: 'Non' }
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {showArcheologie && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Pickaxe size={20} color="#ef4444" />
                            <Typography variant="subtitle1" fontWeight={700} color="#dc2626">
                                Redevance archéologique préventive
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Applicable si creusement à plus de 50cm de profondeur.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormSelect
                                    label="Creusez-vous à plus de 50cm de profondeur ?"
                                    name="creusement"
                                    value={data.creusement === true ? 'oui' : data.creusement === false ? 'non' : ''}
                                    onChange={(name, val) => handleChange(name, val === 'oui')}
                                    options={[
                                        { value: 'oui', label: 'Oui' },
                                        { value: 'non', label: 'Non' }
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {showConstruction && !showTaxeAmenagement && !showArcheologie && (
                    <Alert severity="success" sx={{ borderRadius: '12px', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={18} />
                            <Typography variant="body2">
                                <strong>Aucune taxe applicable</strong> pour ce projet (surface &lt; 5m² et pas de creusement).
                            </Typography>
                        </Box>
                    </Alert>
                )}
            </Collapse>

            {!showConstruction && !showPiscine && !showChangementDest && (
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={18} />
                        <Typography variant="body2">
                            Aucune surface à déclarer pour ce type de projet.
                        </Typography>
                    </Box>
                </Alert>
            )}
        </Box>
    );
}

export default Step7Surfaces;

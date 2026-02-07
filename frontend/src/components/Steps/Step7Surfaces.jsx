import React, { useEffect } from 'react';
import { Box, Typography, Grid, Divider, Alert } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { Info } from 'lucide-react';

function Step7Surfaces() {
    const { data, setField, setMultipleFields } = useForm();

    const handleChange = (name, value) => {
        setField(name, value);
    };

    // Auto-calculate totals
    useEffect(() => {
        // Habitation totals
        const habExist = parseFloat(data.surfaceLogementExistante) || 0;
        const habCree = parseFloat(data.surfaceLogementCreee) || 0;
        const habSupp = parseFloat(data.surfaceLogementSupprimee) || 0;
        const habTotal = habExist + habCree - habSupp;

        // Annexe totals
        const annExist = parseFloat(data.surfaceAnnexeExistante) || 0;
        const annCree = parseFloat(data.surfaceAnnexeCreee) || 0;
        const annSupp = parseFloat(data.surfaceAnnexeSupprimee) || 0;
        const annTotal = annExist + annCree - annSupp;

        // Grand totals
        const totalExist = habExist + annExist;
        const totalCree = habCree + annCree;
        const totalSupp = habSupp + annSupp;
        const totalGeneral = habTotal + annTotal;

        // Emprise totals
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
        });
    }, [
        data.surfaceLogementExistante, data.surfaceLogementCreee, data.surfaceLogementSupprimee,
        data.surfaceAnnexeExistante, data.surfaceAnnexeCreee, data.surfaceAnnexeSupprimee,
        data.empriseSolExistante, data.empriseSolCreee, data.empriseSolSupprimee,
        setMultipleFields
    ]);

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Décrivez les surfaces de plancher par type de destination. Ces informations sont cruciales pour le calcul des taxes d'urbanisme.
            </Typography>

            <Box sx={{
                mb: 6,
                p: 3,
                borderRadius: '20px',
                bgcolor: 'rgba(0, 35, 149, 0.03)',
                border: '1px solid rgba(0, 35, 149, 0.08)',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start'
            }}>
                <Info size={24} color="#002395" style={{ shrink: 0, marginTop: 2 }} />
                <Typography variant="body2" color="#002395" fontWeight={500} sx={{ lineHeight: 1.6 }}>
                    <strong>Surface de plancher</strong> : somme des surfaces closes et couvertes sous une hauteur de plafond &gt; 1m80, calculée à partir du nu intérieur des façades.
                </Typography>
            </Box>

            {/* Habitation */}
            <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                1. Habitation (Logement)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
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

            {/* Annexes */}
            <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                2. Annexes (Garage, Piscine, Abri...)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
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

            <Divider sx={{ my: 6, borderColor: '#f1f5f9' }} />

            {/* Emprise au sol */}
            <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                3. Emprise au sol totale
            </Typography>
            <Grid container spacing={2} sx={{ mb: 6 }}>
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

            <Divider sx={{ my: 6, borderColor: '#f1f5f9' }} />

            {/* Stationnement */}
            <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }} fontWeight={700}>
                4. Stationnement
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                    <FormField label="Nombre de places avant projet" name="placesAvant" value={data.placesAvant} onChange={handleChange} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField label="Nombre de places après projet" name="placesApres" value={data.placesApres} onChange={handleChange} type="number" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step7Surfaces;

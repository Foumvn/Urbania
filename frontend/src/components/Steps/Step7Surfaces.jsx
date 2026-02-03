import { useEffect } from 'react';
import { Box, Typography, Grid, Divider, Alert } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step7Surfaces() {
    const { data, setField, setMultipleFields, errors } = useForm();

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
        data.empriseSolExistante, data.empriseSolCreee, data.empriseSolSupprimee
    ]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Surfaces et Stationnement
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Détaillez les surfaces de plancher par type de destination.
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                <strong>Surface de plancher</strong> : somme des surfaces closes et couvertes sous une hauteur de plafond &gt; 1m80.
            </Alert>

            {/* Habitation */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }} fontWeight={600}>
                1. Habitation (Logement)
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

            {/* Annexes */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }} fontWeight={600}>
                2. Annexes (Garage, Piscine, Abri...)
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

            <Divider sx={{ my: 4 }} />

            {/* Emprise au sol */}
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight={600}>
                3. Emprise au sol totale (m²)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <FormField label="Existante" name="empriseSolExistante" value={data.empriseSolExistante} onChange={handleChange} type="number" endAdornment="m²" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormField label="Créée" name="empriseSolCreee" value={data.empriseSolCreee} onChange={handleChange} type="number" endAdornment="m²" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormField label="Totale" name="empriseSolTotale" value={data.empriseSolTotale} disabled endAdornment="m²" />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Stationnement */}
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight={600}>
                4. Stationnement (Nombre de places)
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormField label="Places avant projet" name="placesAvant" value={data.placesAvant} onChange={handleChange} type="number" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField label="Places après projet" name="placesApres" value={data.placesApres} onChange={handleChange} type="number" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step7Surfaces;

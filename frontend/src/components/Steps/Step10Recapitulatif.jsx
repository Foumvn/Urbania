import { Box, Typography, Grid, Paper, Divider, Button, Chip, List, ListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from '../../context/FormContext';

const travauxLabels = {
    piscine: 'Piscine',
    garage: 'Garage / Carport',
    extension: 'Extension',
    cloture: 'Clôture / Portail',
    abri_jardin: 'Abri de jardin',
    veranda: 'Véranda',
    terrasse: 'Terrasse',
    autre: 'Autre',
};

function Step10Recapitulatif() {
    const { data, goToStep } = useForm();
    const isParticulier = data.typeDeclarant === 'particulier';

    const Section = ({ title, step, children }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="primary.dark">
                    {title}
                </Typography>
                <IconButton
                    size="small"
                    color="primary"
                    onClick={() => goToStep(step)}
                    sx={{ backgroundColor: 'primary.50' }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
            {children}
        </Paper>
    );

    const InfoRow = ({ label, value }) => (
        <Box sx={{ display: 'flex', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {value || '-'}
            </Typography>
        </Box>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Récapitulatif
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Vérifiez toutes les informations avant de générer votre déclaration PDF.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {/* Déclarant */}
                    <Section title="Déclarant" step={1}>
                        <Chip
                            label={isParticulier ? 'Particulier' : 'Personne morale'}
                            color="primary"
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        {isParticulier ? (
                            <>
                                <InfoRow label="Civilité" value={data.civilite} />
                                <InfoRow label="Nom" value={data.nom} />
                                <InfoRow label="Prénom" value={data.prenom} />
                                <InfoRow label="Date de naissance" value={data.dateNaissance} />
                                <InfoRow label="Lieu de naissance" value={data.lieuNaissance} />
                            </>
                        ) : (
                            <>
                                <InfoRow label="Dénomination" value={data.denomination} />
                                <InfoRow label="SIRET" value={data.siret} />
                                <InfoRow label="Type de société" value={data.typeSociete} />
                                <InfoRow label="Représentant" value={`${data.representantPrenom} ${data.representantNom}`} />
                            </>
                        )}
                    </Section>

                    {/* Coordonnées */}
                    <Section title="Coordonnées" step={2}>
                        <InfoRow label="Adresse" value={data.adresse} />
                        {data.complementAdresse && <InfoRow label="Complément" value={data.complementAdresse} />}
                        <InfoRow label="Code postal / Ville" value={`${data.codePostal} ${data.ville}`} />
                        <InfoRow label="Téléphone" value={data.telephone} />
                        <InfoRow label="Email" value={data.email} />
                    </Section>

                    {/* Terrain */}
                    <Section title="Terrain" step={3}>
                        <InfoRow label="Adresse du terrain" value={data.terrainAdresse} />
                        <InfoRow label="Code postal / Ville" value={`${data.terrainCodePostal} ${data.terrainVille}`} />
                        <InfoRow label="Référence cadastrale" value={`${data.prefixe || ''}${data.section || ''} ${data.numeroParcelle || ''}`} />
                        <InfoRow label="Surface du terrain" value={data.surfaceTerrain ? `${data.surfaceTerrain} m²` : '-'} />
                    </Section>

                    {/* Travaux */}
                    <Section title="Travaux" step={4}>
                        <InfoRow label="Type de travaux" value={data.typeTravaux} />
                        <Box sx={{ display: 'flex', py: 0.75, alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                                Nature des travaux
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(data.natureTravaux || []).map((type) => (
                                    <Chip key={type} label={travauxLabels[type] || type} size="small" />
                                ))}
                            </Box>
                        </Box>
                    </Section>

                    {/* Description */}
                    <Section title="Description du projet" step={5}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {data.descriptionProjet || '-'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <InfoRow label="Couleur façade" value={data.couleurFacade} />
                                <InfoRow label="Matériau façade" value={data.materiauFacade} />
                            </Grid>
                            <Grid item xs={6}>
                                <InfoRow label="Couleur toiture" value={data.couleurToiture} />
                                <InfoRow label="Matériau toiture" value={data.materiauToiture} />
                            </Grid>
                        </Grid>
                        <InfoRow label="Hauteur construction" value={data.hauteurConstruction ? `${data.hauteurConstruction} m` : '-'} />
                    </Section>

                    {/* Surfaces */}
                    <Section title="Surfaces" step={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Surface de plancher
                                </Typography>
                                <InfoRow label="Existante" value={data.surfacePlancherExistante ? `${data.surfacePlancherExistante} m²` : '0 m²'} />
                                <InfoRow label="Créée" value={data.surfacePlancherCreee ? `${data.surfacePlancherCreee} m²` : '0 m²'} />
                                <InfoRow label="Totale après travaux" value={data.surfacePlancherTotale ? `${data.surfacePlancherTotale} m²` : '0 m²'} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Emprise au sol
                                </Typography>
                                <InfoRow label="Existante" value={data.empriseSolExistante ? `${data.empriseSolExistante} m²` : '0 m²'} />
                                <InfoRow label="Créée" value={data.empriseSolCreee ? `${data.empriseSolCreee} m²` : '0 m²'} />
                                <InfoRow label="Totale après travaux" value={data.empriseSolTotale ? `${data.empriseSolTotale} m²` : '0 m²'} />
                            </Grid>
                        </Grid>
                    </Section>

                    {/* Engagements */}
                    <Section title="Engagements" step={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleIcon color={data.engagementExactitude ? 'success' : 'disabled'} sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                Attestation d'exactitude des informations
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CheckCircleIcon color={data.engagementReglementation ? 'success' : 'disabled'} sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                Engagement au respect de la réglementation
                            </Typography>
                        </Box>
                        <InfoRow label="Lieu" value={data.lieuDeclaration} />
                        <InfoRow label="Date" value={data.dateDeclaration} />
                    </Section>

                    {/* Plan Cadastral */}
                    <Section title="Plan cadastral" step={9}>
                        <InfoRow label="Dimensions" value={`${data.cadastralPlan?.mainParcel?.width || '-'}m x ${data.cadastralPlan?.mainParcel?.depth || '-'}m`} />
                        <InfoRow label="Orientation" value={`${data.cadastralPlan?.orientation || 0}°`} />
                        <InfoRow label="Échelle" value={data.cadastralPlan?.scale || '-'} />
                        <InfoRow label="Parcelles voisines" value={data.cadastralPlan?.neighboringParcels?.length || 0} />
                        <InfoRow label="Voies adjacentes" value={data.cadastralPlan?.streets?.length || 0} />
                    </Section>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step10Recapitulatif;

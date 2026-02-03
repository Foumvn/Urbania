import { Box, Typography, Paper, Grid } from '@mui/material';
import { useI18n } from '../../context/I18nContext';

const Field = ({ label, value, flex = 1 }) => (
    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1.5, flex }}>
        {label && (
            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                {label} :
            </Typography>
        )}
        <Box sx={{
            flex: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: '1.2rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'primary.main',
            px: 1,
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            {value || ''}
        </Box>
    </Box>
);

const SectionTitle = ({ title, mt = 2 }) => (
    <Box sx={{
        bgcolor: '#003366',
        color: 'white',
        p: 0.5,
        mt,
        mb: 2,
        fontWeight: 'bold',
        fontSize: '0.85rem'
    }}>
        {title}
    </Box>
);

const Checkbox = ({ label, checked }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mr: 2 }}>
        <Box sx={{
            width: 14,
            height: 14,
            border: '1px solid black',
            mr: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            bgcolor: checked ? 'rgba(0,0,0,0.05)' : 'transparent'
        }}>
            {checked ? 'X' : ''}
        </Box>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{label}</Typography>
    </Box>
);

const PageWrapper = ({ children, pageNumber, totalPages }) => (
    <Paper
        elevation={3}
        sx={{
            p: 5,
            bgcolor: 'white',
            color: 'black',
            width: '100%',
            maxWidth: '800px',
            minHeight: '1120px', // A4 Ratio approximately
            mx: 'auto',
            mb: 4,
            fontFamily: 'Arial, sans-serif',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            '& *': { color: 'black !important' }
        }}
    >
        <Box sx={{ flex: 1 }}>
            {children}
        </Box>

        {/* Footer with Page Number */}
        <Box sx={{
            mt: 2,
            pt: 1,
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#666 !important' }}>
                Page {pageNumber} / {totalPages}
            </Typography>
        </Box>
    </Paper>
);

const CerfaWebPreview = ({ data }) => {
    const { t } = useI18n();
    const isParticulier = data.typeDeclarant === 'particulier';
    const totalPages = 3;

    return (
        <Box sx={{
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#f0f1f4' : '#0f172a',
            p: { xs: 1, md: 3 },
            borderRadius: 2,
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* PAGE 1 */}
            <PageWrapper pageNumber={1} totalPages={totalPages}>
                <Box sx={{ textAlign: 'right', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>N° 16702*01</Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
                        Déclaration préalable
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Constructions et travaux non soumis à permis de construire
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666 !important', mt: 1, display: 'block' }}>
                        Ministère en charge de l'urbanisme
                    </Typography>
                </Box>

                <SectionTitle title="1 Identité du déclarant" />
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                        <Checkbox label="Vous êtes un particulier" checked={isParticulier} />
                        <Checkbox label="Vous êtes une personne morale" checked={!isParticulier} />
                    </Box>

                    {isParticulier ? (
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Field label="Nom" value={data.nom} /></Grid>
                            <Grid item xs={6}><Field label="Prénom" value={data.prenom} /></Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Field label="Date de naissance" value={data.dateNaissance} />
                                    <Field label="Lieu" value={data.lieuNaissance} />
                                </Box>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12}><Field label="Dénomination" value={data.denomination} /></Grid>
                            <Grid item xs={6}><Field label="N° SIRET" value={data.siret} /></Grid>
                            <Grid item xs={6}><Field label="Type" value={data.typeSociete} /></Grid>
                        </Grid>
                    )}
                </Box>

                <SectionTitle title="2 Coordonnées du déclarant" />
                <Box sx={{ mb: 3 }}>
                    <Field label="Adresse" value={data.adresse} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Field label="Code postal" value={data.codePostal} />
                        <Field label="Ville" value={data.ville} />
                    </Box>
                    <Field label="Téléphone" value={data.telephone} />
                    <Field label="Adresse électronique" value={data.email} />
                </Box>
            </PageWrapper>

            {/* PAGE 2 */}
            <PageWrapper pageNumber={2} totalPages={totalPages}>
                <SectionTitle title="3 Le terrain" />
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>3.1 Localisation du terrain</Typography>
                    <Field label="Adresse" value={data.terrainAdresse || data.adresse} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Field label="Code postal" value={data.terrainCodePostal || data.codePostal} />
                        <Field label="Ville" value={data.terrainVille || data.ville} />
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>Références cadastrales :</Typography>
                    <Box sx={{ border: '1px solid black', p: 1 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={3}><Typography variant="caption" align="center" sx={{ fontWeight: 'bold' }}>Préfixe</Typography></Grid>
                            <Grid item xs={3}><Typography variant="caption" align="center" sx={{ fontWeight: 'bold' }}>Section</Typography></Grid>
                            <Grid item xs={3}><Typography variant="caption" align="center" sx={{ fontWeight: 'bold' }}>Numéro</Typography></Grid>
                            <Grid item xs={3}><Typography variant="caption" align="center" sx={{ fontWeight: 'bold' }}>Surface (m²)</Typography></Grid>
                            <Grid item xs={3}><Field value={data.prefixe} /></Grid>
                            <Grid item xs={3}><Field value={data.section} /></Grid>
                            <Grid item xs={3}><Field value={data.numeroParcelle} /></Grid>
                            <Grid item xs={3}><Field value={data.surfaceTerrain} /></Grid>
                        </Grid>
                    </Box>
                </Box>

                <SectionTitle title="4 Nature du projet" />
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                        <Checkbox label="Nouvelle construction" checked={data.typeTravaux === 'construction'} />
                        <Checkbox label="Travaux sur construction existante" checked={data.typeTravaux === 'existant'} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Description :</Typography>
                    <Paper variant="outlined" sx={{ p: 2, minHeight: 120, bgcolor: '#fafafa' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {data.descriptionProjet || '...'}
                        </Typography>
                    </Paper>
                </Box>
            </PageWrapper>

            {/* PAGE 3 */}
            <PageWrapper pageNumber={3} totalPages={totalPages}>
                <SectionTitle title="Surfaces et Signature" />
                <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>Récapitulatif des surfaces (en m²)</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={4}><Field label="Emprise existante" value={data.empriseSolExistante || '0'} /></Grid>
                        <Grid item xs={4}><Field label="Emprise créée" value={data.empriseSolCreee || '0'} /></Grid>
                        <Grid item xs={4}><Field label="Emprise totale" value={data.empriseSolTotale || '0'} /></Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 10, p: 3, border: '1px solid black', position: 'relative' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 3 }}>Engagement et signature du déclarant</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 4 }}>
                        Je certifie l'exactitude des renseignements fournis et je m'engage à respecter les règles d'urbanisme applicables.
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Field label="Fait à" value={data.lieuDeclaration} />
                            <Field label="Le" value={data.dateDeclaration} />
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{
                                border: '1px dashed #999',
                                height: 100,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#fdfdfd'
                            }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Signature
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Corner Stamp */}
                    <Box sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        opacity: 0.1,
                        transform: 'rotate(15deg)',
                        border: '4px double black',
                        p: 1
                    }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>URBANIA PROOF</Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto', pt: 10, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.disabled">
                        Document généré électroniquement par l'application Urbania.
                    </Typography>
                </Box>
            </PageWrapper>
        </Box>
    );
};

export default CerfaWebPreview;

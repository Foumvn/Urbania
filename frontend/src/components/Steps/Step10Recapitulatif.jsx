import { Box, Typography, Grid, Paper, Divider, Button, Chip, List, ListItem, ListItemText, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useForm } from '../../context/FormContext';
import { PROJECT_TYPES } from '../../config/projectConfigs';
import { useState } from 'react';

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
    const { data, goToStep, projectConfig, generateCerfaPDF } = useForm();
    const [isGenerating, setIsGenerating] = useState(false);
    const isParticulier = data.typeDeclarant === 'particulier';
    const selectedNatureLabels = (data.natureTravaux || []).map(t => travauxLabels[t] || t);

    const Section = ({ title, step, children }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: '24px',
                border: '1px solid #f1f5f9',
                bgcolor: 'white',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={800} color="#002395" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1rem' }}>
                    {title}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => goToStep(step)}
                    sx={{ bgcolor: 'rgba(0, 35, 149, 0.05)', color: '#002395', '&:hover': { bgcolor: 'rgba(0, 35, 149, 0.1)' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
            {children}
        </Paper>
    );

    const InfoRow = ({ label, value }) => (
        <Box sx={{ display: 'flex', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 260 }}>
                {label} :
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#002395">
                {value || '-'}
            </Typography>
        </Box>
    );

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem' }}>
                Veuillez vérifier attentivement l'exactitude des informations ci-dessous avant de procéder à la génération finale.
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                    onClick={async () => {
                        setIsGenerating(true);
                        await generateCerfaPDF();
                        setIsGenerating(false);
                    }}
                    disabled={isGenerating}
                    sx={{
                        py: 2.5,
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        background: 'linear-gradient(135deg, #002395 0%, #0045ff 100%)',
                        boxShadow: '0 8px 16px -4px rgba(0, 35, 149, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #001a70 0%, #0037cc 100%)',
                            boxShadow: '0 12px 20px -6px rgba(0, 35, 149, 0.5)',
                        }
                    }}
                >
                    {isGenerating ? 'GÉNÉRATION EN COURS...' : 'TÉLÉCHARGER LE CERFA REMPLI (PDF)'}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {/* Déclarant */}
                    <Section title="1 - Déclarant" step={0}>
                        <Chip
                            label={isParticulier ? 'Particulier' : 'Personne morale'}
                            sx={{ mb: 2, bgcolor: 'rgba(0, 35, 149, 0.1)', color: '#002395', fontWeight: 700 }}
                            size="small"
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
                    <Section title="2 - Coordonnées" step={2}>
                        <InfoRow label="Adresse" value={data.adresse} />
                        <InfoRow label="Code postal / Ville" value={`${data.codePostal} ${data.ville}`} />
                        <InfoRow label="Téléphone" value={data.telephone} />
                        <InfoRow label="Email" value={data.email} />
                    </Section>

                    {/* Terrain */}
                    <Section title="3 - Terrain" step={3}>
                        <InfoRow label="Adresse du terrain" value={data.terrainAdresse} />
                        <InfoRow label="Ville" value={data.terrainVille} />
                        <InfoRow label="Référence cadastrale" value={`${data.prefixe || ''}${data.section || ''} ${data.numeroParcelle || ''}`} />
                        <InfoRow label="Surface du terrain" value={data.surfaceTerrain ? `${data.surfaceTerrain} m²` : '-'} />
                    </Section>

                    {/* Projet */}
                    <Section title="4 - Nature du Projet" step={4}>
                        <InfoRow label="Type de travaux" value={PROJECT_TYPES[data.typeTravaux]?.label || data.typeTravaux} />
                        <InfoRow label="Nature" value={selectedNatureLabels.join(', ')} />
                    </Section>

                    {/* Description & Aspects techniques */}
                    <Section title="5 - Description & Matériaux" step={5}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Description courte (CERFA)
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, p: 2, bgcolor: '#f8fafc', borderRadius: '12px', color: '#002395' }}>
                                {data.descriptionProjet || '-'}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Aspect extérieur (Matériaux & Couleurs)
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Murs / Façade" value={`${data.materiauFacade || '-'} (${data.couleurFacade || '-'})`} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Toiture" value={`${data.materiauToiture || '-'} (${data.couleurToiture || '-'})`} />
                            </Grid>
                            <Grid item xs={12}>
                                <InfoRow label="Hauteur au faîtage" value={data.hauteurConstruction ? `${data.hauteurConstruction} m` : '-'} />
                            </Grid>
                        </Grid>

                        {data.aiProjectConfig?.specificQuestions?.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Détails complémentaires
                                </Typography>
                                {data.aiProjectConfig.specificQuestions.map(q => (
                                    <InfoRow
                                        key={q.field}
                                        label={q.label}
                                        value={data[q.field] === true ? 'Oui' : data[q.field] === false ? 'Non' : data[q.field]}
                                    />
                                ))}
                            </>
                        )}
                    </Section>

                    {/* Notice Descriptive */}
                    <Section title="6 - Notice Descriptive (DP11)" step={6}>
                        <Box sx={{
                            p: 2.5,
                            bgcolor: 'rgba(0,35,149,0.02)',
                            borderRadius: '16px',
                            border: '1px solid rgba(0,35,149,0.1)'
                        }}>
                            <Typography variant="body2" sx={{
                                whiteSpace: 'pre-wrap',
                                color: '#002395',
                                fontWeight: 500,
                                lineHeight: 1.7,
                                fontSize: '0.9rem'
                            }}>
                                {data.noticeDescriptive || 'Notice non rédigée'}
                            </Typography>
                        </Box>
                    </Section>

                    {/* Surfaces & Stationnement */}
                    {projectConfig?.pdfSections?.includes('surfaces') && (
                        <Section title="7 - Surfaces & Stationnement" step={7}>
                            <Box sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: '16px', overflow: 'hidden', mb: 3 }}>
                                <Grid container sx={{ bgcolor: '#f1f5f9', py: 1.5 }}>
                                    <Grid item xs={4}><Typography variant="caption" align="center" fontWeight={800}>DESTINATION</Typography></Grid>
                                    <Grid item xs={2}><Typography variant="caption" align="center" fontWeight={800}>EXISTANT</Typography></Grid>
                                    <Grid item xs={2}><Typography variant="caption" align="center" fontWeight={800}>CRÉÉ</Typography></Grid>
                                    <Grid item xs={2}><Typography variant="caption" align="center" fontWeight={800}>SUPPRIMÉ</Typography></Grid>
                                    <Grid item xs={2}><Typography variant="caption" align="center" fontWeight={800}>TOTAL</Typography></Grid>
                                </Grid>
                                <Box sx={{ p: 2 }}>
                                    <Grid container alignItems="center" sx={{ py: 1 }}>
                                        <Grid item xs={4}><Typography variant="body2" fontWeight={600}>1. Habitation</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceLogementExistante || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceLogementCreee || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceLogementSupprimee || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700} color="#002395">{data.surfaceLogementTotal || '0'}</Typography></Grid>
                                    </Grid>
                                    <Grid container alignItems="center" sx={{ py: 1 }}>
                                        <Grid item xs={4}><Typography variant="body2" fontWeight={600}>2. Annexes</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceAnnexeExistante || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceAnnexeCreee || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700}>{data.surfaceAnnexeSupprimee || '0'}</Typography></Grid>
                                        <Grid item xs={2} align="center"><Typography variant="body2" fontWeight={700} color="#002395">{data.surfaceAnnexeTotal || '0'}</Typography></Grid>
                                    </Grid>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                                <Typography variant="body2">Emprise au sol totale : <Box component="span" fontWeight={800} color="#002395">{data.empriseSolTotale || '0'} m²</Box></Typography>
                                <Typography variant="body2">Stationnement (final) : <Box component="span" fontWeight={800} color="#002395">{data.placesApres || '0'} places</Box></Typography>
                            </Box>
                        </Section>
                    )}

                    {/* Plan Interactif */}
                    <Section title="10 - Plan Cadastral" step={10}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Dimensions terrain" value={`${data.cadastralPlan?.mainParcel?.width || '-'}m x ${data.cadastralPlan?.mainParcel?.depth || '-'}m`} />
                                <InfoRow label="Échelle" value={data.cadastralPlan?.scale || '1:500'} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoRow label="Orientation" value={`${data.cadastralPlan?.orientation || 0}°`} />
                                <InfoRow label="Bâtiment dessiné" value={data.cadastralPlan?.mainParcel?.hasBuilding ? 'Oui' : 'Non'} />
                            </Grid>
                        </Grid>
                    </Section>

                    {/* Engagements */}
                    <Section title="Engagements & Signature" step={9}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#059669', px: 2.5, py: 1.2, borderRadius: '14px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}>
                                <CheckCircleIcon sx={{ color: 'white', fontSize: 18, mr: 1 }} />
                                <Typography variant="caption" fontWeight={900} color="white">DOSSIER COMPLET</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#059669', px: 2.5, py: 1.2, borderRadius: '14px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}>
                                <CheckCircleIcon sx={{ color: 'white', fontSize: 18, mr: 1 }} />
                                <Typography variant="caption" fontWeight={900} color="white">CERTIFIÉ EXACT</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <InfoRow label="Fait à" value={data.lieuDeclaration} />
                            <InfoRow label="Le" value={data.dateDeclaration} />
                        </Box>
                    </Section>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step10Recapitulatif;

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, IconButton, Slider, Tooltip, Skeleton } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen, Download } from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';
import { DOCUMENTS_INFO } from '../../config/projectConfigs';

// ============================================
// COMPOSANTS RÉUTILISABLES
// ============================================

// Champ de saisie avec label et ligne de soulignement
const Field = ({ label, value, width = '100%', inline = false }) => (
    <Box sx={{
        display: inline ? 'inline-flex' : 'flex',
        alignItems: 'baseline',
        mb: 0.75,
        width: inline ? 'auto' : width,
        mr: inline ? 2 : 0
    }}>
        {label && (
            <Typography sx={{
                fontWeight: 500,
                mr: 0.5,
                whiteSpace: 'nowrap',
                fontSize: '0.7rem',
                color: '#000'
            }}>
                {label} :
            </Typography>
        )}
        <Box sx={{
            flex: 1,
            borderBottom: '1px solid #000',
            minHeight: '1rem',
            minWidth: inline ? '80px' : '50px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#003366',
            px: 0.5,
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            {value || ''}
        </Box>
    </Box>
);

// Case à cocher style CERFA
const Checkbox = ({ label, checked = false, inline = true }) => (
    <Box sx={{
        display: inline ? 'inline-flex' : 'flex',
        alignItems: 'center',
        mb: 0.5,
        mr: 1.5
    }}>
        <Box sx={{
            width: 10,
            height: 10,
            border: '1px solid #000',
            mr: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            bgcolor: checked ? 'rgba(0,0,0,0.03)' : 'transparent'
        }}>
            {checked ? '×' : ''}
        </Box>
        <Typography sx={{ fontSize: '0.65rem', color: '#000' }}>{label}</Typography>
    </Box>
);

// Titre de section (fond bleu foncé)
const SectionTitle = ({ title, mt = 1.5 }) => (
    <Box sx={{
        bgcolor: '#003366',
        color: 'white',
        px: 1,
        py: 0.3,
        mt,
        mb: 1,
        fontWeight: 'bold',
        fontSize: '0.75rem'
    }}>
        {title}
    </Box>
);

// Encadré informatif (fond gris clair)
const InfoBox = ({ children }) => (
    <Box sx={{
        bgcolor: '#f0f0f0',
        p: 1,
        mb: 1,
        fontSize: '0.6rem',
        lineHeight: 1.4,
        color: '#000'
    }}>
        {children}
    </Box>
);

// Wrapper de page avec numérotation
const PageWrapper = ({ children, pageNumber, totalPages, id }) => (
    <Paper
        elevation={3}
        id={id}
        sx={{
            p: 3,
            bgcolor: 'white',
            color: 'black',
            width: '210mm',
            minHeight: '297mm',
            mx: 'auto',
            mb: 3,
            fontFamily: 'Arial, Helvetica, sans-serif',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.7rem',
            lineHeight: 1.3,
            scrollMarginTop: '20px',
            '@media print': {
                boxShadow: 'none',
                pageBreakAfter: 'always',
                margin: 0
            }
        }}
    >
        {/* En-tête officiel République Française - Uniquement sur les pages 1 et 2 */}
        {(pageNumber === 1 || pageNumber === 2) && (
            <>
                <Box sx={{
                    position: 'absolute',
                    top: 15,
                    left: 20,
                    width: 80,
                    zIndex: 5
                }}>
                    <img
                        src="/logo-rf.png"
                        alt="République Française"
                        style={{ width: '100%', height: 'auto' }}
                    />
                </Box>
                <Box sx={{
                    position: 'absolute',
                    top: 15,
                    right: 20,
                    width: 70,
                    zIndex: 5,
                    textAlign: 'right'
                }}>
                    <img
                        src="/logo.png"
                        alt="Urbania"
                        style={{ width: '100%', height: 'auto' }}
                    />
                </Box>
            </>
        )}

        <Box sx={{ flex: 1, mt: 4 }}>{children}</Box>
        <Box sx={{ textAlign: 'center', mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
            <Typography sx={{ fontSize: '0.6rem', color: '#999' }}>
                {pageNumber} / {totalPages}
            </Typography>
        </Box>
    </Paper>
);

// Tableau cadastral
const CadastralTable = ({ prefixe, section, numero, surface }) => (
    <Box sx={{ border: '1px solid #000', mb: 0.5 }}>
        <Grid container>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>Préfixe :</Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>Section :</Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>Numéro :</Typography>
            </Grid>
            <Grid item xs={4.5} sx={{ borderBottom: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>Superficie (m²) :</Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', p: 0.5, minHeight: 24 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#003366', fontWeight: 600 }}>{prefixe}</Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#003366', fontWeight: 600 }}>{section}</Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ borderRight: '1px solid #000', p: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#003366', fontWeight: 600 }}>{numero}</Typography>
            </Grid>
            <Grid item xs={4.5} sx={{ p: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#003366', fontWeight: 600 }}>{surface}</Typography>
            </Grid>
        </Grid>
    </Box>
);

// ============================================
// SKELETON LOADER MODERNE
// ============================================

const CerfaSkeleton = () => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            bgcolor: 'white',
            width: '210mm',
            minHeight: '297mm',
            mx: 'auto',
            mb: 3,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}
    >
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Skeleton variant="rectangular" width={80} height={40} />
            <Box sx={{ textAlign: 'right' }}>
                <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={150} height={30} />
            </Box>
        </Box>

        {/* Section Title Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={25} sx={{ mb: 1 }} />

        {/* Field Row Skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="60%" />
            </Box>
        ))}

        {/* Info Box Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ my: 2, opacity: 0.5 }} />

        {/* Grid Skeletons */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
                <Skeleton variant="rectangular" width="100%" height={100} />
            </Grid>
            <Grid item xs={6}>
                <Skeleton variant="rectangular" width="100%" height={100} />
            </Grid>
        </Grid>

        {/* More fields */}
        <Box sx={{ mt: 4 }}>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={150} />
        </Box>
    </Paper>
);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CerfaOfficialPreview = ({ data = {}, currentStep = 0 }) => {
    const { t } = useI18n();
    const isParticulier = data.typeDeclarant === 'particulier';
    const piecesJointes = data.piecesJointes || {};
    const attachedDocs = Object.entries(piecesJointes).filter(([key, value]) => value && value.length > 50); // Filtrer les strings Base64 valides
    const totalPages = 10 + attachedDocs.length;

    // Mapping steps to PDF pages
    const stepToPageMap = {
        0: 'page-2', // Type de déclarant
        1: 'page-3', // Identité
        2: 'page-3', // Coordonnées
        3: 'page-4', // Terrain
        4: 'page-5', // Type de travaux
        5: 'page-5', // Description
        6: 'page-6', // Surfaces
        7: 'page-8', // Pièces jointes
        8: 'page-9', // Engagements
        9: 'page-4', // Plan Cadastral (associé au terrain)
        10: 'page-1' // Récapitulatif -> Récépissé
    };

    const [isLoading, setIsLoading] = useState(false);

    // Initial loading simulation
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3500); // Augmenté à 3.5s selon demande utilisateur

        return () => clearTimeout(timer);
    }, []);

    // Effect for auto-scroll on step change (without reloading skeleton)
    useEffect(() => {
        if (!isLoading) {
            const pageId = stepToPageMap[currentStep];
            if (pageId) {
                const element = document.getElementById(pageId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }, [currentStep, isLoading]);

    // Zoom state (30% to 150%)
    const [zoom, setZoom] = useState(110);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 30));
    const handleFitScreen = () => setZoom(110);
    const handleZoomChange = (event, newValue) => setZoom(newValue);

    return (
        <Box id="cerfa-preview-root" sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#2c3e50', // Thème sombre Overleaf
            overflow: 'hidden'
        }}>
            {/* Toolbar de zoom modernisée */}
            <Paper elevation={4} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 0.5, sm: 2 },
                p: 1,
                bgcolor: '#34495e',
                color: 'white',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
                borderRadius: 0,
                zIndex: 10
            }}>
                <Tooltip title="Zoom arrière">
                    <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 30} sx={{ color: 'white', opacity: zoom <= 30 ? 0.3 : 0.8 }}>
                        <ZoomOut fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Slider
                    value={zoom}
                    onChange={handleZoomChange}
                    min={30}
                    max={150}
                    step={5}
                    sx={{
                        width: { xs: 60, sm: 100, md: 120 },
                        color: 'primary.light',
                        '& .MuiSlider-thumb': { bgcolor: 'white' },
                        '& .MuiSlider-track': { border: 'none' },
                        '& .MuiSlider-rail': { opacity: 0.3, bgcolor: '#95a5a6' }
                    }}
                    size="small"
                />

                <Tooltip title="Zoom avant">
                    <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 150} sx={{ color: 'white', opacity: zoom >= 150 ? 0.3 : 0.8 }}>
                        <ZoomIn fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Typography sx={{ fontSize: '0.7rem', minWidth: 35, textAlign: 'center', fontWeight: 600, color: '#ecf0f1' }}>
                    {zoom}%
                </Typography>

                <Tooltip title="Ajuster à l'écran">
                    <IconButton size="small" onClick={handleFitScreen} sx={{ color: 'white', opacity: 0.8 }}>
                        <FitScreen fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />

                <Tooltip title="Télécharger le dossier complet">
                    <IconButton
                        size="small"
                        onClick={() => window.print()}
                        sx={{
                            color: 'primary.light',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Download fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Container scrollable avec zoom */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                p: { xs: 1, md: 2 },
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-out',
                    width: '100%'
                }}>
                    {isLoading ? (
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CerfaSkeleton />
                            <CerfaSkeleton />
                        </Box>
                    ) : (
                        <>
                            <PageWrapper pageNumber={1} totalPages={totalPages} id="page-1">
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        Récépissé de dépôt d'une déclaration préalable*
                                    </Typography>
                                </Box>

                                {/* Visuel du Projet */}
                                <Box sx={{
                                    mb: 3,
                                    p: 1.5,
                                    bgcolor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    borderRadius: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#003366', alignSelf: 'flex-start', mb: 1, textTransform: 'uppercase' }}>
                                        Visuel de votre projet
                                    </Typography>
                                    <img
                                        src="/project-hero.png"
                                        alt="Aperçu du projet"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '120px',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                        }}
                                    />
                                </Box>

                                <Typography sx={{ fontSize: '0.55rem', fontStyle: 'italic', mb: 2 }}>
                                    * Dans le cadre d'une saisine par voie électronique, le récépissé est constitué par un accusé de réception électronique.
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography sx={{ fontSize: '0.65rem', mb: 1 }}>
                                            Vous avez déposé une déclaration préalable pour des travaux ou des constructions non soumis à permis.
                                            Le délai d'instruction de votre dossier est d'<strong>UN MOIS</strong> et, si vous ne recevez pas de réponse
                                            de l'administration dans ce délai, vous bénéficierez d'une décision de non-opposition à ces travaux ou aménagements.
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', mb: 1 }}>
                                            → Toutefois, dans le mois qui suit le dépôt de votre dossier, l'administration peut vous contacter :
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1, mb: 0.5 }}>
                                            – soit pour vous avertir qu'un autre délai est applicable ;
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1, mb: 1 }}>
                                            – soit pour vous indiquer qu'il manque une ou plusieurs pièces à votre dossier.
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', mb: 1 }}>
                                            → Si vous n'avez rien reçu à la fin du mois suivant le dépôt de votre déclaration, vous pourrez commencer les travaux après avoir :
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1, mb: 0.5 }}>
                                            – affiché sur le terrain ce récépissé pour attester la date de dépôt ;
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1 }}>
                                            – installé sur le terrain, pendant toute la durée du chantier, un panneau visible de la voie publique.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography sx={{ fontSize: '0.65rem', mb: 1 }}>
                                            La décision de non-opposition n'est définitive qu'en l'absence de recours ou de retrait :
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1, mb: 1 }}>
                                            – dans le délai de deux mois à compter de son affichage sur le terrain, sa légalité peut être contestée par un tiers devant le tribunal administratif.
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', ml: 1 }}>
                                            – dans le délai de trois mois après la date de la déclaration préalable, l'autorité compétente peut la retirer.
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Cadre Mairie */}
                                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f0f0' }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                                        Cadre réservé à la mairie
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        <Field label="Le projet ayant fait l'objet d'une déclaration n°" value={data.numeroDossier} inline />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Typography sx={{ fontSize: '0.65rem' }}>déposé à la mairie le :</Typography>
                                        <Field label="" value="" width="30px" inline />
                                        <Typography sx={{ fontSize: '0.65rem' }}>/</Typography>
                                        <Field label="" value="" width="30px" inline />
                                        <Typography sx={{ fontSize: '0.65rem' }}>/</Typography>
                                        <Field label="" value="" width="50px" inline />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Box sx={{
                                            border: '1px solid #000',
                                            width: 150,
                                            height: 80,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#666' }}>Cachet de la mairie</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </PageWrapper>

                            {/* ========== PAGE 2 : FORMULAIRE PRINCIPAL - GARDE ========== */}
                            <PageWrapper pageNumber={2} totalPages={totalPages} id="page-2">
                                <Box sx={{ textAlign: 'right', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>N° 16702*01</Typography>
                                </Box>

                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        Déclaration préalable
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                                        Constructions et travaux non soumis à permis de construire
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#666', mt: 0.5 }}>
                                        Ministère en charge de l'urbanisme
                                    </Typography>
                                </Box>

                                <InfoBox>
                                    Depuis le 1er janvier 2022, vous pouvez déposer votre demande par voie dématérialisée
                                    selon les modalités définies par la commune compétente pour la recevoir.
                                </InfoBox>

                                <InfoBox>
                                    Depuis le 1er septembre 2022, de nouvelles modalités de gestion des taxes d'urbanisme sont applicables.
                                    Sauf cas particuliers, pour toute demande d'autorisation d'urbanisme déposée à compter de cette date,
                                    une déclaration devra être effectuée auprès des services fiscaux, dans les 90 jours suivant l'achèvement
                                    de la construction sur l'espace sécurisé du site www.impots.gouv.fr
                                </InfoBox>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    Ce formulaire peut se remplir facilement sur ordinateur avec un lecteur pdf.
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={7}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                            Vous devez utiliser ce formulaire si :
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', mb: 1 }}>
                                            • vous réalisez des travaux (construction, modification de construction existante…)
                                            ou un changement de destination soumis à simple déclaration.
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem' }}>
                                            Pour savoir précisément à quelle(s) formalité(s) est soumis votre projet, vous pouvez
                                            vous reporter à la notice explicative ou vous renseigner auprès de la mairie du lieu de votre projet.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Box sx={{ bgcolor: '#f0f0f0', p: 1, textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', mb: 1 }}>
                                                Cadre réservé à la mairie du lieu du projet
                                            </Typography>
                                            <Box sx={{ border: '1px solid #000', p: 0.5 }}>
                                                <Grid container>
                                                    <Grid item xs={12} sx={{ borderBottom: '1px solid #000', p: 0.5 }}>
                                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>D P</Typography>
                                                    </Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', p: 0.3, fontSize: '0.5rem' }}>Dpt</Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', p: 0.3, fontSize: '0.5rem' }}>Commune</Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', p: 0.3, fontSize: '0.5rem' }}>Année</Grid>
                                                    <Grid item xs={3} sx={{ p: 0.3, fontSize: '0.5rem' }}>N° dossier</Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', borderTop: '1px solid #000', p: 0.5, minHeight: 25 }}></Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', borderTop: '1px solid #000', p: 0.5 }}></Grid>
                                                    <Grid item xs={3} sx={{ borderRight: '1px solid #000', borderTop: '1px solid #000', p: 0.5 }}></Grid>
                                                    <Grid item xs={3} sx={{ borderTop: '1px solid #000', p: 0.5 }}></Grid>
                                                </Grid>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <SectionTitle title="1 Identité du déclarant" mt={3} />
                                <InfoBox>
                                    Le déclarant indiqué dans le cadre ci-dessous pourra réaliser les travaux ou les aménagements en l'absence d'opposition.
                                    Il sera redevable des taxes d'urbanisme le cas échéant.
                                </InfoBox>
                            </PageWrapper>

                            {/* ========== PAGE 3 : IDENTITÉ ET COORDONNÉES ========== */}
                            <PageWrapper pageNumber={3} totalPages={totalPages} id="page-3">
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mb: 1 }}>
                                    1.1 Vous êtes un particulier
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}><Field label="Civilité" value={isParticulier ? data.civilite : ''} /></Grid>
                                    <Grid item xs={4}><Field label="Nom" value={isParticulier ? data.nom : ''} /></Grid>
                                    <Grid item xs={4}><Field label="Prénom" value={isParticulier ? data.prenom : ''} /></Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Typography sx={{ fontSize: '0.65rem' }}>Date et lieu de naissance :</Typography>
                                    <Field label="Date" value={isParticulier ? data.dateNaissance : ''} inline />
                                    <Field label="Commune" value={isParticulier ? data.lieuNaissance : ''} inline />
                                </Box>

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    1.2 Vous êtes une personne morale
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}><Field label="Dénomination" value={!isParticulier ? data.denomination : ''} /></Grid>
                                    <Grid item xs={6}><Field label="N° SIRET" value={!isParticulier ? data.siret : ''} /></Grid>
                                    <Grid item xs={6}><Field label="Type de société" value={!isParticulier ? data.typeSociete : ''} /></Grid>
                                </Grid>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', mt: 1, mb: 0.5 }}>
                                    Représentant de la personne morale :
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}><Field label="Nom" value={!isParticulier ? data.representantNom : ''} /></Grid>
                                    <Grid item xs={4}><Field label="Prénom" value={!isParticulier ? data.representantPrenom : ''} /></Grid>
                                    <Grid item xs={4}><Field label="Qualité" value={!isParticulier ? data.representantQualite : ''} /></Grid>
                                </Grid>

                                <SectionTitle title="2 Coordonnées du déclarant" />
                                <Grid container spacing={1}>
                                    <Grid item xs={3}><Field label="Numéro" value={data.numero} /></Grid>
                                    <Grid item xs={9}><Field label="Voie" value={data.adresse} /></Grid>
                                    <Grid item xs={12}><Field label="Lieu-dit" value={data.lieuDit} /></Grid>
                                    <Grid item xs={12}><Field label="Localité" value={data.localite} /></Grid>
                                    <Grid item xs={4}><Field label="Code postal" value={data.codePostal} /></Grid>
                                    <Grid item xs={4}><Field label="BP" value={data.bp} /></Grid>
                                    <Grid item xs={4}><Field label="Cedex" value={data.cedex} /></Grid>
                                    <Grid item xs={6}><Field label="Téléphone" value={data.telephone} /></Grid>
                                    <Grid item xs={12}><Field label="Adresse électronique" value={data.email} /></Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <Checkbox
                                        label="J'accepte de recevoir à l'adresse électronique communiquée les réponses de l'administration"
                                        checked={data.acceptEmail}
                                        inline={false}
                                    />
                                </Box>
                            </PageWrapper>

                            {/* ========== PAGE 4 : LE TERRAIN ========== */}
                            <PageWrapper pageNumber={4} totalPages={totalPages} id="page-4">
                                <SectionTitle title="3 Le terrain" mt={0} />

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mb: 1 }}>
                                    3.1 Localisation du (ou des) terrain(s)
                                </Typography>
                                <InfoBox>
                                    Les informations et plans que vous fournissez doivent permettre à l'administration de localiser
                                    précisément le (ou les) terrain(s) concerné(s) par votre projet.
                                </InfoBox>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    Adresse du (ou des) terrain(s)
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={3}><Field label="Numéro" value={data.terrainNumero} /></Grid>
                                    <Grid item xs={9}><Field label="Voie" value={data.terrainAdresse} /></Grid>
                                    <Grid item xs={12}><Field label="Lieu-dit" value={data.terrainLieuDit} /></Grid>
                                    <Grid item xs={8}><Field label="Localité" value={data.terrainVille} /></Grid>
                                    <Grid item xs={4}><Field label="Code postal" value={data.terrainCodePostal} /></Grid>
                                </Grid>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    Références cadastrales :
                                </Typography>
                                <InfoBox>
                                    Si votre projet porte sur plus de 3 parcelles cadastrales, veuillez renseigner une ou plusieurs
                                    annexes Références cadastrales complémentaires.
                                </InfoBox>

                                <CadastralTable
                                    prefixe={data.prefixe}
                                    section={data.section}
                                    numero={data.numeroParcelle}
                                    surface={data.surfaceTerrain}
                                />
                                <CadastralTable prefixe="" section="" numero="" surface="" />
                                <CadastralTable prefixe="" section="" numero="" surface="" />

                                <Box sx={{ mt: 2 }}>
                                    <Field label="Superficie totale du terrain (en m²)" value={data.surfaceTotale} />
                                </Box>

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    3.2 Situation juridique du terrain
                                </Typography>
                                <InfoBox>
                                    Ces données, qui sont facultatives, peuvent toutefois vous permettre de faire valoir des droits
                                    à construire ou de bénéficier d'impositions plus favorables.
                                </InfoBox>

                                <Box sx={{ mb: 1 }}>
                                    <Typography sx={{ fontSize: '0.65rem', mb: 0.5 }}>Êtes-vous titulaire d'un certificat d'urbanisme pour ce terrain ?</Typography>
                                    <Checkbox label="Oui" checked={data.certificatUrbanisme === 'oui'} />
                                    <Checkbox label="Non" checked={data.certificatUrbanisme === 'non'} />
                                    <Checkbox label="Je ne sais pas" checked={data.certificatUrbanisme === 'nsp'} />
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <Typography sx={{ fontSize: '0.65rem', mb: 0.5 }}>Le terrain est-il situé dans un lotissement ?</Typography>
                                    <Checkbox label="Oui" checked={data.lotissement === 'oui'} />
                                    <Checkbox label="Non" checked={data.lotissement === 'non'} />
                                    <Checkbox label="Je ne sais pas" checked={data.lotissement === 'nsp'} />
                                </Box>
                            </PageWrapper>

                            {/* ========== PAGE 5 : NATURE DES TRAVAUX ========== */}
                            <PageWrapper pageNumber={5} totalPages={totalPages} id="page-5">
                                <SectionTitle title="4 À remplir pour une demande comprenant un projet de construction" mt={0} />

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mb: 1 }}>
                                    4.1 Nature des travaux envisagés
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Checkbox label="Nouvelle construction" checked={data.typeTravaux === 'construction'} inline={false} />
                                    <Checkbox label="Travaux ou changement de destination sur une construction existante" checked={data.typeTravaux === 'modification'} inline={false} />
                                    <Checkbox label="Clôture" checked={data.typeTravaux === 'cloture'} inline={false} />
                                </Box>

                                <Field label="Courte description de votre projet ou de vos travaux" value={data.descriptionProjet} />

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    4.2 Informations complémentaires
                                </Typography>

                                <Typography sx={{ fontSize: '0.65rem', mb: 0.5 }}>• Type de travaux :</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                                    <Checkbox label="Piscine" checked={data.natureTravaux?.includes('piscine')} />
                                    <Checkbox label="Garage" checked={data.natureTravaux?.includes('garage')} />
                                    <Checkbox label="Véranda" checked={data.natureTravaux?.includes('veranda')} />
                                    <Checkbox label="Abri de jardin" checked={data.natureTravaux?.includes('abri_jardin')} />
                                    <Checkbox label="Extension" checked={data.natureTravaux?.includes('extension')} />
                                    <Checkbox label="Clôture" checked={data.natureTravaux?.includes('cloture')} />
                                    <Checkbox label="Ravalement" checked={data.natureTravaux?.includes('ravalement')} />
                                </Box>

                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Field label="Nombre total de logements créés" value={data.nombreLogements} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Field label="dont individuels" value={data.logementsIndividuels} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Field label="dont collectifs" value={data.logementsCollectifs} />
                                    </Grid>
                                </Grid>

                                <Typography sx={{ fontSize: '0.65rem', mt: 2, mb: 0.5 }}>• Mode d'utilisation principale des logements :</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                                    <Checkbox label="Occupation personnelle" checked={data.modeUtilisation === 'personnel'} />
                                    <Checkbox label="Vente" checked={data.modeUtilisation === 'vente'} />
                                    <Checkbox label="Location" checked={data.modeUtilisation === 'location'} />
                                </Box>

                                <Typography sx={{ fontSize: '0.65rem', mb: 0.5 }}>S'il s'agit d'une occupation personnelle :</Typography>
                                <Checkbox label="Résidence principale" checked={data.typeResidence === 'principale'} />
                                <Checkbox label="Résidence secondaire" checked={data.typeResidence === 'secondaire'} />
                            </PageWrapper>

                            {/* ========== PAGE 6 : SURFACES ========== */}
                            <PageWrapper pageNumber={6} totalPages={totalPages} id="page-6">
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mb: 1 }}>
                                    4.3 Emprise au sol
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}><Field label="Emprise au sol avant travaux (m²)" value={data.empriseSolExistante} /></Grid>
                                    <Grid item xs={4}><Field label="Emprise au sol créée (m²)" value={data.empriseSolCreee} /></Grid>
                                    <Grid item xs={4}><Field label="Emprise au sol supprimée (m²)" value={data.empriseSolSupprimee} /></Grid>
                                </Grid>

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    4.4 Destination, sous-destination des constructions et tableau des surfaces
                                </Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', mb: 1 }}>
                                    Surface de plancher en m² (article R.111-22 du code de l'urbanisme)
                                </Typography>

                                {/* Tableau simplifié des surfaces */}
                                <Box sx={{ border: '1px solid #000', mb: 2 }}>
                                    <Grid container>
                                        <Grid item xs={4} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>Destinations</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.5rem', fontWeight: 'bold' }}>Existante (A)</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.5rem', fontWeight: 'bold' }}>Créée (B)</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.5rem', fontWeight: 'bold' }}>Supprimée (D)</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.5rem', fontWeight: 'bold' }}>Total</Typography>
                                        </Grid>

                                        {/* Habitation - Logement */}
                                        <Grid item xs={4} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.55rem' }}>Habitation - Logement</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceLogementExistante || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceLogementCreee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceLogementSupprimee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfaceLogementTotal || ''}</Typography>
                                        </Grid>

                                        {/* Annexes */}
                                        <Grid item xs={4} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.55rem' }}>Annexes (garage, piscine...)</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceAnnexeExistante || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceAnnexeCreee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>{data.surfaceAnnexeSupprimee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderBottom: '1px solid #000', p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfaceAnnexeTotal || ''}</Typography>
                                        </Grid>

                                        {/* Total */}
                                        <Grid item xs={4} sx={{ borderRight: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>SURFACES TOTALES</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfacePlancherExistante || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfacePlancherCreee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfacePlancherSupprimee || ''}</Typography>
                                        </Grid>
                                        <Grid item xs={2} sx={{ p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.6rem', color: '#003366', fontWeight: 'bold' }}>{data.surfacePlancherTotale || ''}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', mt: 2, mb: 1 }}>
                                    4.5 Stationnement
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}><Field label="Nombre de places avant réalisation" value={data.placesAvant} /></Grid>
                                    <Grid item xs={6}><Field label="Nombre de places après réalisation" value={data.placesApres} /></Grid>
                                </Grid>
                            </PageWrapper>

                            {/* ========== PAGE 7 : LÉGISLATION CONNEXE ========== */}
                            <PageWrapper pageNumber={7} totalPages={totalPages} id="page-7">
                                <SectionTitle title="5 Informations pour l'application d'une législation connexe" mt={0} />

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    Indiquez si votre projet :
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.6rem', flex: 1 }}>
                                            – porte sur une installation, un ouvrage, des travaux ou une activité (IOTA) soumis à déclaration Loi sur l'eau
                                        </Typography>
                                        <Box sx={{ display: 'flex' }}>
                                            <Checkbox label="Oui" checked={data.iotaOui} />
                                            <Checkbox label="Non" checked={!data.iotaOui} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.6rem', flex: 1 }}>
                                            – porte sur des travaux soumis à autorisation environnementale
                                        </Typography>
                                        <Box sx={{ display: 'flex' }}>
                                            <Checkbox label="Oui" checked={data.autorisationEnv} />
                                            <Checkbox label="Non" checked={!data.autorisationEnv} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.6rem', flex: 1 }}>
                                            – fait l'objet d'une dérogation espèces protégées
                                        </Typography>
                                        <Box sx={{ display: 'flex' }}>
                                            <Checkbox label="Oui" checked={data.derogationEspeces} />
                                            <Checkbox label="Non" checked={!data.derogationEspeces} />
                                        </Box>
                                    </Box>
                                </Box>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    Indiquez si votre projet se situe dans les périmètres de protection suivants :
                                </Typography>

                                <InfoBox>Informations complémentaires</InfoBox>

                                <Box sx={{ mb: 2 }}>
                                    <Checkbox label="se situe dans le périmètre d'un site patrimonial remarquable" checked={data.sitePatrimonial} inline={false} />
                                    <Checkbox label="se situe dans les abords d'un monument historique" checked={data.monumentHistorique} inline={false} />
                                    <Checkbox label="se situe dans un site classé ou en instance de classement" checked={data.siteClasse} inline={false} />
                                </Box>

                                <InfoBox>
                                    Si votre projet conduit à porter atteinte à une allée d'arbres ou à un alignement d'arbres bordant une voie
                                    ouverte à la circulation publique au sens de l'article L. 350-3 du code de l'environnement, une autorisation
                                    doit être obtenue ou une déclaration réalisée en application de cet article.
                                </InfoBox>
                            </PageWrapper>

                            {/* ========== PAGE 8 : BORDEREAU DES PIÈCES ========== */}
                            <PageWrapper pageNumber={8} totalPages={totalPages} id="page-8">
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Bordereau de dépôt des pièces jointes à une déclaration préalable
                                    </Typography>
                                </Box>

                                <InfoBox>
                                    Cochez les cases correspondant aux pièces jointes à votre déclaration et reportez le numéro
                                    correspondant sur la pièce jointe.
                                </InfoBox>

                                <Typography sx={{ fontSize: '0.6rem', mb: 2 }}>
                                    Cette liste est exhaustive et aucune autre pièce ne peut vous être demandée.
                                    Seule la pièce DP1 (plan de situation) est à joindre obligatoirement, dans tous les cas.
                                </Typography>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    1 Pièces obligatoires pour tous les dossiers
                                </Typography>

                                {/* Tableau des pièces obligatoires */}
                                <Box sx={{ border: '1px solid #000', mb: 2 }}>
                                    <Grid container>
                                        <Grid item xs={8} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>Pièce</Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>Nombre d'exemplaires</Typography>
                                        </Grid>
                                        <Grid item xs={8} sx={{ borderRight: '1px solid #000', p: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox label="" checked={!!data.piecesJointes?.dp1} />
                                                <Typography sx={{ fontSize: '0.55rem' }}>
                                                    <strong>DP1.</strong> Un plan de situation du terrain [Art. R. 431-36 a)]
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4} sx={{ p: 0.5 }}>
                                            <Typography sx={{ fontSize: '0.55rem' }}>1 ex. par dossier + 2 ex. supp.</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    2 Pièces complémentaires - À joindre si votre projet porte sur des constructions
                                </Typography>

                                <Box sx={{ border: '1px solid #000', mb: 2 }}>
                                    <Grid container>
                                        <Grid item xs={8} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>Pièce</Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ borderBottom: '1px solid #000', p: 0.5, bgcolor: '#f0f0f0' }}>
                                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>Nombre d'exemplaires</Typography>
                                        </Grid>
                                        {[
                                            { code: 'DP2', desc: 'Un plan de masse coté dans les 3 dimensions', checked: true },
                                            { code: 'DP3', desc: 'Un plan en coupe précisant l\'implantation', checked: data.hasPlanCoupe },
                                            { code: 'DP4', desc: 'Un plan des façades et des toitures', checked: data.hasPlanFacades },
                                            { code: 'DP5', desc: 'Une représentation de l\'aspect extérieur', checked: data.hasInsertion },
                                            { code: 'DP6', desc: 'Un document graphique (insertion)', checked: data.hasPhotos },
                                            { code: 'DP7', desc: 'Une photographie (environnement proche)', checked: data.hasPhotosEnvironnement },
                                            { code: 'DP8', desc: 'Une photographie (paysage lointain)', checked: data.hasPhotosEnvironnement },
                                        ].map((piece, idx) => (
                                            <Grid container key={idx}>
                                                <Grid item xs={8} sx={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', p: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Checkbox label="" checked={piece.checked} />
                                                        <Typography sx={{ fontSize: '0.5rem' }}>
                                                            <strong>{piece.code}.</strong> {piece.desc}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4} sx={{ borderBottom: '1px solid #000', p: 0.5 }}>
                                                    <Typography sx={{ fontSize: '0.5rem' }}>1 ex. par dossier</Typography>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </PageWrapper>

                            {/* ========== PAGE 9 : ENGAGEMENT ET SIGNATURE ========== */}
                            <PageWrapper pageNumber={9} totalPages={totalPages} id="page-9">
                                <SectionTitle title="6 Engagement du (des) déclarant(s)" mt={0} />

                                <Typography sx={{ fontSize: '0.65rem', mb: 1.5, lineHeight: 1.5 }}>
                                    J'atteste avoir qualité pour faire cette déclaration préalable. Je certifie exacts les renseignements fournis.
                                </Typography>

                                <Typography sx={{ fontSize: '0.65rem', mb: 1.5, lineHeight: 1.5 }}>
                                    J'ai pris connaissance des règles générales de construction prévues par le code de la construction et de l'habitation.
                                </Typography>

                                <Typography sx={{ fontSize: '0.65rem', mb: 1.5, lineHeight: 1.5 }}>
                                    Je suis informé(e) qu'une déclaration devra impérativement être effectuée auprès des services fiscaux dans les
                                    90 jours suivant l'achèvement des travaux (au sens de l'article 1406 du code général des impôts) en vue du calcul
                                    des impôts fonciers et des taxes d'urbanisme.
                                </Typography>

                                <InfoBox>
                                    <strong>Dans le cadre d'une saisine par voie papier</strong><br />
                                    Votre déclaration doit être établie en deux exemplaires et doit être déposée à la mairie du lieu du projet.
                                    Vous devrez produire :<br />
                                    – un exemplaire supplémentaire, si votre projet se situe dans le périmètre d'un site patrimonial remarquable ;<br />
                                    – un exemplaire supplémentaire, si votre projet se situe dans un site classé ou inscrit ;<br />
                                    – deux exemplaires supplémentaires, si votre projet se situe dans un cœur de parc national.
                                </InfoBox>

                                <Grid container spacing={2} sx={{ mt: 3 }}>
                                    <Grid item xs={5}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>Signature du déclarant</Typography>
                                        <Field label="À" value={data.lieuDeclaration || data.ville || data.terrainVille} />
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                            <Typography sx={{ fontSize: '0.65rem' }}>Le</Typography>
                                            <Field label="" value={data.dateDeclaration ? data.dateDeclaration.split('/')[0] : ''} width="30px" inline />
                                            <Typography sx={{ fontSize: '0.65rem' }}>/</Typography>
                                            <Field label="" value={data.dateDeclaration ? data.dateDeclaration.split('/')[1] : ''} width="30px" inline />
                                            <Typography sx={{ fontSize: '0.65rem' }}>/</Typography>
                                            <Field label="" value={data.dateDeclaration ? data.dateDeclaration.split('/')[2] : new Date().getFullYear().toString()} width="50px" inline />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Box sx={{
                                            border: '1px dashed #666',
                                            height: 120,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#fafafa'
                                        }}>
                                            <Typography sx={{ fontSize: '0.65rem', color: '#999', fontStyle: 'italic' }}>
                                                Signature
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </PageWrapper>

                            {/* ========== PAGE 10 : TRAITEMENT DES DONNÉES ========== */}
                            <PageWrapper pageNumber={10} totalPages={totalPages} id="page-10">
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Traitements des données à caractère personnel
                                    </Typography>
                                </Box>

                                <Typography sx={{ fontSize: '0.6rem', mb: 2, lineHeight: 1.5 }}>
                                    Conformément au Règlement (UE) 2016/679 relatif à la protection des personnes physiques à l'égard
                                    du traitement des données à caractère personnel et à la loi n° 78-17 du 6 janvier 1978 relative
                                    à l'informatique, aux fichiers et aux libertés modifiée, vous disposez d'un droit d'accès et de rectification.
                                </Typography>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    1 Traitement des données à des fins d'instruction de la demande d'autorisation
                                </Typography>

                                <Typography sx={{ fontSize: '0.6rem', mb: 2, lineHeight: 1.5 }}>
                                    Vos données recueillies seront transmises aux services compétents pour l'instruction de votre demande.
                                    Pour toute information, question ou exercice de vos droits portant sur la collecte et le traitement de vos
                                    données à des fins d'instruction, veuillez prendre contact avec la mairie du lieu de dépôt de votre dossier.
                                </Typography>

                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', mb: 1 }}>
                                    2 Traitements à des fins de mise en œuvre et de suivi des politiques publiques
                                </Typography>

                                <Typography sx={{ fontSize: '0.6rem', mb: 2, lineHeight: 1.5 }}>
                                    Vos données à caractère personnel sont traitées automatiquement par le Service des données et études statistiques (SDES),
                                    service statistique ministériel de l'énergie, du logement, du transport et de l'environnement rattaché au Ministère
                                    en charge de l'urbanisme, à des fins de mise en œuvre et de suivi des politiques publiques basées sur la construction
                                    neuve et de statistiques sur le fondement des articles R. 423-75 à R. 423-79 du code de l'urbanisme.
                                </Typography>

                                <Typography sx={{ fontSize: '0.6rem', mb: 2, lineHeight: 1.5 }}>
                                    Concernant SITADEL, vous pouvez exercer vos droits d'accès et de rectification auprès du délégué à la protection
                                    des données (DPD) du ministère en charge de l'urbanisme :<br />
                                    • à l'adresse suivante : rgpd.bacs.sdes.cgdd@developpement-durable.gouv.fr
                                </Typography>

                                <Typography sx={{ fontSize: '0.6rem', lineHeight: 1.5 }}>
                                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez faire une réclamation auprès de la
                                    Commission Nationale Informatique et Libertés (CNIL), à partir de son formulaire de contact https://www.cnil.fr/fr/plaintes
                                </Typography>

                                {/* Cachet Urbania */}
                                <Box sx={{
                                    mt: 4,
                                    p: 2,
                                    border: '2px double #003366',
                                    textAlign: 'center',
                                    opacity: 0.15,
                                    transform: 'rotate(-5deg)',
                                    maxWidth: 200,
                                    mx: 'auto'
                                }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#003366' }}>
                                        URBANIA
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.6rem', color: '#003366' }}>
                                        Document généré électroniquement
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 'auto', pt: 4, textAlign: 'center' }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography sx={{ fontSize: '0.55rem', color: '#666' }}>
                                        Document conforme au formulaire CERFA n° 13703*09 - Déclaration préalable
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.55rem', color: '#666' }}>
                                        Généré par l'application Urbania - © 2026
                                    </Typography>
                                </Box>
                            </PageWrapper>

                            {/* ========== PAGES PIÈCES JOINTES DYNAMIQUES ========== */}
                            {attachedDocs.map(([key, base64], index) => {
                                const docInfo = DOCUMENTS_INFO[key] || { label: key.toUpperCase(), description: '' };
                                return (
                                    <PageWrapper
                                        key={key}
                                        pageNumber={11 + index}
                                        totalPages={totalPages}
                                        id={`page-${11 + index}`}
                                    >
                                        <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #003366', pb: 2 }}>
                                            <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#003366' }}>
                                                {docInfo.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 1 }}>
                                                {docInfo.description}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f9f9f9',
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            p: 1
                                        }}>
                                            <img
                                                src={base64}
                                                alt={docInfo.label}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '230mm',
                                                    objectFit: 'contain',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ mt: 3, textAlign: 'right', fontStyle: 'italic', opacity: 0.6 }}>
                                            <Typography sx={{ fontSize: '0.65rem' }}>
                                                Dossier n° {data.numeroDossier || '---'} | Parcelle {data.section || ''} {data.numeroParcelle || ''}
                                            </Typography>
                                        </Box>
                                    </PageWrapper>
                                );
                            })}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CerfaOfficialPreview;

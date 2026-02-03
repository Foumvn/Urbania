import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

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

function PDFPreview({ data }) {
    const isParticulier = data.typeDeclarant === 'particulier';

    const SectionTitle = ({ children }) => (
        <Typography
            variant="subtitle2"
            sx={{
                backgroundColor: '#1e3a5f',
                color: 'white',
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: '0.7rem',
                mb: 1.5,
                fontWeight: 600,
                letterSpacing: '0.02em',
            }}
        >
            {children}
        </Typography>
    );

    const FieldRow = ({ label, value }) => (
        <Box sx={{ display: 'flex', fontSize: '0.7rem', mb: 0.75, alignItems: 'flex-start' }}>
            <Typography sx={{ fontSize: 'inherit', color: 'text.secondary', minWidth: 90, flexShrink: 0 }}>
                {label}:
            </Typography>
            <Typography sx={{ fontSize: 'inherit', fontWeight: 500, color: value ? 'text.primary' : 'text.disabled' }}>
                {value || '___________'}
            </Typography>
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <DescriptionIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        Aperçu du formulaire
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Prévisualisation en temps réel
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    border: 2,
                    borderColor: '#1e3a5f',
                    borderRadius: 2.5,
                    backgroundColor: '#fafbfc',
                    fontSize: '0.75rem',
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 2.5, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
                        RÉPUBLIQUE FRANÇAISE
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: '1rem', my: 0.5 }}>
                        DÉCLARATION PRÉALABLE
                    </Typography>
                    <Chip
                        label="CERFA 13703*08"
                        size="small"
                        sx={{
                            fontSize: '0.65rem',
                            height: 22,
                            bgcolor: 'rgba(30, 58, 95, 0.1)',
                            color: 'primary.main',
                            fontWeight: 600,
                        }}
                    />
                </Box>

                {/* Déclarant */}
                <SectionTitle>1. IDENTITÉ DU DÉCLARANT</SectionTitle>
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Chip
                            label={isParticulier ? '● Particulier' : '○ Particulier'}
                            size="small"
                            variant={isParticulier ? 'filled' : 'outlined'}
                            color={isParticulier ? 'primary' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 20 }}
                        />
                        <Chip
                            label={!isParticulier && data.typeDeclarant ? '● Personne morale' : '○ Personne morale'}
                            size="small"
                            variant={!isParticulier && data.typeDeclarant ? 'filled' : 'outlined'}
                            color={!isParticulier && data.typeDeclarant ? 'primary' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 20 }}
                        />
                    </Box>
                    {isParticulier ? (
                        <>
                            <FieldRow label="Civilité" value={data.civilite} />
                            <FieldRow label="Nom" value={data.nom} />
                            <FieldRow label="Prénom" value={data.prenom} />
                            <FieldRow label="Né(e) le" value={data.dateNaissance} />
                            <FieldRow label="À" value={data.lieuNaissance} />
                        </>
                    ) : (
                        <>
                            <FieldRow label="Dénomination" value={data.denomination} />
                            <FieldRow label="SIRET" value={data.siret} />
                            <FieldRow label="Représentant" value={`${data.representantPrenom || ''} ${data.representantNom || ''}`.trim()} />
                        </>
                    )}
                </Box>

                {/* Coordonnées */}
                <SectionTitle>2. COORDONNÉES</SectionTitle>
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <FieldRow label="Adresse" value={data.adresse} />
                    <FieldRow label="CP / Ville" value={`${data.codePostal || ''} ${data.ville || ''}`.trim()} />
                    <FieldRow label="Tél" value={data.telephone} />
                    <FieldRow label="Email" value={data.email} />
                </Box>

                {/* Terrain */}
                <SectionTitle>3. TERRAIN</SectionTitle>
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <FieldRow label="Adresse" value={data.terrainAdresse} />
                    <FieldRow label="CP / Ville" value={`${data.terrainCodePostal || ''} ${data.terrainVille || ''}`.trim()} />
                    <FieldRow label="Réf. cad." value={`${data.prefixe || ''}${data.section || ''} ${data.numeroParcelle || ''}`.trim()} />
                    <FieldRow label="Surface" value={data.surfaceTerrain ? `${data.surfaceTerrain} m²` : ''} />
                </Box>

                {/* Travaux */}
                <SectionTitle>4. NATURE DES TRAVAUX</SectionTitle>
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <FieldRow label="Type" value={data.typeTravaux} />
                    {(data.natureTravaux || []).length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {(data.natureTravaux || []).map((type) => (
                                <Chip
                                    key={type}
                                    label={travauxLabels[type] || type}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 20, bgcolor: 'secondary.main', color: 'white' }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Surfaces */}
                <SectionTitle>5. SURFACES</SectionTitle>
                <Box sx={{ mb: 2, pl: 0.5 }}>
                    <FieldRow label="Plancher créée" value={data.surfacePlancherCreee ? `${data.surfacePlancherCreee} m²` : '0 m²'} />
                    <FieldRow label="Plancher totale" value={data.surfacePlancherTotale ? `${data.surfacePlancherTotale} m²` : '0 m²'} />
                    <FieldRow label="Emprise créée" value={data.empriseSolCreee ? `${data.empriseSolCreee} m²` : '0 m²'} />
                </Box>

                {/* Signature */}
                <SectionTitle>6. SIGNATURE</SectionTitle>
                <Box sx={{ pl: 0.5 }}>
                    <FieldRow label="Fait à" value={data.lieuDeclaration} />
                    <FieldRow label="Le" value={data.dateDeclaration} />
                    <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mb: 0.5 }}>
                            Signature :
                        </Typography>
                        <Box
                            sx={{
                                height: 36,
                                border: '1.5px dashed',
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'white',
                            }}
                        >
                            <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>
                                [Signature manuscrite]
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default PDFPreview;

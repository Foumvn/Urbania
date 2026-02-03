import { Box, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Alert, Button, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DescriptionIcon from '@mui/icons-material/Description';
import { useForm } from '../../context/FormContext';
import { DOCUMENTS_INFO } from '../../config/projectConfigs';
import { useRef } from 'react';


function Step8PiecesJointes() {
    const { data, setField, projectConfig } = useForm();
    const fileInputRefs = useRef({});

    const isDocumentProvided = (docId) => {
        const pieces = data.piecesJointes || {};
        return pieces[docId] !== null && pieces[docId] !== undefined;
    };

    const getDocumentFile = (docId) => {
        const pieces = data.piecesJointes || {};
        return pieces[docId];
    };

    const handleUpload = (docId) => (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const pieces = { ...(data.piecesJointes || {}) };
                pieces[docId] = reader.result; // Stockage Base64
                setField('piecesJointes', pieces);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (docId) => {
        const pieces = { ...(data.piecesJointes || {}) };
        delete pieces[docId];
        setField('piecesJointes', pieces);
    };

    const triggerUpload = (docId) => {
        if (fileInputRefs.current[docId]) {
            fileInputRefs.current[docId].click();
        }
    };

    // Détermine si un document est obligatoire
    const isObligatoire = (docId) => {
        return projectConfig.requiredDocuments.includes(docId);
    };

    // Générer la liste des documents à partir de DOCUMENTS_INFO
    const allDocIds = Object.keys(DOCUMENTS_INFO);
    const dynamicDocuments = allDocIds.map(docId => ({
        id: docId,
        label: DOCUMENTS_INFO[docId].label,
        description: DOCUMENTS_INFO[docId].description,
        obligatoire: isObligatoire(docId)
    }));

    // Trier : obligatoires en premier
    dynamicDocuments.sort((a, b) => (b.obligatoire ? 1 : 0) - (a.obligatoire ? 1 : 0));

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Pièces à joindre
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Chargez les documents requis pour votre dossier. Ils seront intégrés à votre déclaration finale.
            </Typography>

            <Alert severity="warning" sx={{ mb: 4 }}>
                <Typography variant="body2">
                    Format recommandé : PNG ou JPG de bonne qualité. Les plans doivent être lisibles et orientés.
                </Typography>
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <List sx={{ py: 0 }}>
                            {dynamicDocuments.map((doc, index) => {
                                const fileData = getDocumentFile(doc.id);
                                return (
                                    <ListItem
                                        key={doc.id}
                                        sx={{
                                            borderBottom: index < dynamicDocuments.length - 1 ? 1 : 0,
                                            borderColor: 'divider',
                                            py: 2,
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'stretch', sm: 'center' },
                                            gap: 2,
                                            backgroundColor: doc.obligatoire && !fileData ? 'rgba(211, 47, 47, 0.02)' : 'transparent'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {fileData ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <RadioButtonUncheckedIcon color={doc.obligatoire ? 'error' : 'disabled'} />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography fontWeight={doc.obligatoire ? 600 : 500}>{doc.label}</Typography>
                                                        {doc.obligatoire ? (
                                                            <Chip label="Obligatoire" size="small" color="error" variant="outlined" />
                                                        ) : (
                                                            <Chip label="Facultatif" size="small" variant="outlined" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={doc.description}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                            {fileData && (
                                                <Box
                                                    component="img"
                                                    src={fileData}
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: 1,
                                                        objectFit: 'cover',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        mr: 1
                                                    }}
                                                />
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                ref={el => fileInputRefs.current[doc.id] = el}
                                                onChange={handleUpload(doc.id)}
                                            />

                                            {fileData ? (
                                                <IconButton color="error" onClick={() => handleDelete(doc.id)} size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<CloudUploadIcon />}
                                                    onClick={() => triggerUpload(doc.id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    Uploader
                                                </Button>
                                            )}
                                        </Box>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: 'primary.50',
                            border: 1,
                            borderColor: 'primary.200',
                            position: 'sticky',
                            top: 20
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600} color="primary.dark">
                                Conseils d'upload
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • Prenez des photos nettes avec un bon éclairage.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • Pour les plans, privilégiez les scans ou des photos bien de face sans reflets.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            • Les fichiers sont sauvegardés localement sur votre navigateur.
                        </Typography>
                        <Alert severity="info" icon={false} sx={{ mt: 2, '& .MuiAlert-message': { p: 0 } }}>
                            <Typography variant="caption">
                                Vos images seront automatiquement redimensionnées pour tenir dans le formulaire CERFA.
                            </Typography>
                        </Alert>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step8PiecesJointes;


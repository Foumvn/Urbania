import { Box, Typography, Grid, Checkbox, FormControlLabel, Paper, Alert, Button, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Draw as DrawIcon } from '@mui/icons-material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { useRef } from 'react';

function Step9Engagements() {
    const { data, setField, errors } = useForm();
    const signatureInputRef = useRef(null);

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleCheckbox = (name) => (event) => {
        setField(name, event.target.checked);
    };

    const handleSignatureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setField('signature', reader.result); // Stockage Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerSignatureUpload = () => {
        if (signatureInputRef.current) {
            signatureInputRef.current.click();
        }
    };

    const handleDeleteSignature = () => {
        setField('signature', null);
    };

    // Set current date if not set
    if (!data.dateDeclaration) {
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        setField('dateDeclaration', formattedDate);
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Engagements et signature
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Veuillez lire attentivement et accepter les engagements suivants pour finaliser votre déclaration.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            border: 2,
                            borderColor: errors.engagementExactitude ? 'error.main' : 'divider',
                            backgroundColor: data.engagementExactitude ? 'success.50' : 'background.paper',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.engagementExactitude || false}
                                    onChange={handleCheckbox('engagementExactitude')}
                                    color="primary"
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography fontWeight={500} color="text.primary">
                                        Attestation d'exactitude des informations *
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Je certifie sur l'honneur l'exactitude des renseignements fournis dans cette déclaration
                                        et dans les pièces jointes.
                                    </Typography>
                                </Box>
                            }
                            sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: 2,
                            border: 2,
                            borderColor: errors.engagementReglementation ? 'error.main' : 'divider',
                            backgroundColor: data.engagementReglementation ? 'success.50' : 'background.paper',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.engagementReglementation || false}
                                    onChange={handleCheckbox('engagementReglementation')}
                                    color="primary"
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography fontWeight={500} color="text.primary">
                                        Engagement au respect de la réglementation *
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Je m'engage à respecter les règles d'urbanisme applicables (PLU, règlement de lotissement...).
                                    </Typography>
                                </Box>
                            }
                            sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                    </Paper>

                    <Typography variant="h6" sx={{ mb: 3 }} fontWeight={500}>
                        Date et lieu de signature
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormField
                                label="Lieu de signature"
                                name="lieuDeclaration"
                                value={data.lieuDeclaration}
                                onChange={handleChange}
                                error={errors.lieuDeclaration}
                                required
                                placeholder="Paris"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormField
                                label="Date de signature"
                                name="dateDeclaration"
                                value={data.dateDeclaration}
                                onChange={handleChange}
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '2px dashed',
                            borderColor: data.signature ? 'success.main' : 'divider',
                            backgroundColor: data.signature ? 'success.50' : 'grey.50',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            minHeight: 300,
                            justifyContent: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DrawIcon color={data.signature ? 'success' : 'action'} />
                            <Typography variant="h6" fontWeight={600}>
                                Signature numérique
                            </Typography>
                        </Box>

                        {data.signature ? (
                            <Box sx={{ position: 'relative', width: '100%' }}>
                                <Box
                                    component="img"
                                    src={data.signature}
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: 200,
                                        objectFit: 'contain',
                                        backgroundColor: 'white',
                                        p: 1,
                                        borderRadius: 2,
                                        boxShadow: 1
                                    }}
                                />
                                <IconButton
                                    color="error"
                                    onClick={handleDeleteSignature}
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: '#fee2e2' },
                                        boxShadow: 2
                                    }}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Uploadez une image de votre signature (fond blanc ou transparent).
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={triggerSignatureUpload}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Uploader ma signature
                                </Button>
                            </>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={signatureInputRef}
                            onChange={handleSignatureUpload}
                        />

                        <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                            Formats acceptés : PNG, JPG.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {data.signature && (
                <Alert severity="success" sx={{ mt: 4 }}>
                    Votre signature a été enregistrée et sera appliquée sur le document final.
                </Alert>
            )}

            <Alert severity="info" sx={{ mt: 4 }}>
                <Typography variant="body2">
                    <strong>Information :</strong> Votre signature numérique a été intégrée.
                    Si vous préférez signer à la main, vous pourrez toujours le faire sur le document imprimé.
                </Typography>
            </Alert>
        </Box>
    );
}

export default Step9Engagements;

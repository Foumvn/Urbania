import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Grid,
    Paper,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const POSITIONS = [
    { value: 'N', label: 'Nord' },
    { value: 'S', label: 'Sud' },
    { value: 'E', label: 'Est' },
    { value: 'W', label: 'Ouest' },
    { value: 'NE', label: 'Nord-Est' },
    { value: 'NW', label: 'Nord-Ouest' },
    { value: 'SE', label: 'Sud-Est' },
    { value: 'SW', label: 'Sud-Ouest' },
];

const PARCEL_SIZES = [
    { value: 'small', label: 'Petite' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'large', label: 'Grande' },
];

function NeighborParcelsEditor({ parcels = [], onChange, streets = [], onStreetsChange }) {
    const [newParcel, setNewParcel] = useState({ number: '', position: 'N', size: 'medium' });
    const [newStreet, setNewStreet] = useState({ name: '', position: 'S' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingStreetIndex, setEditingStreetIndex] = useState(null);

    const handleAddParcel = () => {
        if (newParcel.number.trim()) {
            onChange([...parcels, { ...newParcel }]);
            setNewParcel({ number: '', position: 'N', size: 'medium' });
        }
    };

    const handleRemoveParcel = (index) => {
        const updated = parcels.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handleUpdateParcel = (index, field, value) => {
        const updated = [...parcels];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const handleAddStreet = () => {
        if (newStreet.name.trim()) {
            onStreetsChange([...streets, { ...newStreet }]);
            setNewStreet({ name: '', position: 'S' });
        }
    };

    const handleRemoveStreet = (index) => {
        const updated = streets.filter((_, i) => i !== index);
        onStreetsChange(updated);
    };

    const getPositionLabel = (value) => {
        return POSITIONS.find(p => p.value === value)?.label || value;
    };

    const getPositionColor = (position) => {
        const colors = {
            N: 'info', S: 'success', E: 'warning', W: 'error',
            NE: 'info', NW: 'info', SE: 'success', SW: 'error',
        };
        return colors[position] || 'default';
    };

    return (
        <Box>
            {/* Neighboring Parcels Section */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Parcelles voisines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ajoutez les parcelles voisines pour un plan cadastral complet
            </Typography>

            {/* Existing parcels */}
            {parcels.length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Stack spacing={1}>
                        {parcels.map((parcel, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'background.default',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip
                                        label={parcel.number}
                                        color="primary"
                                        size="small"
                                        sx={{ fontWeight: 600, minWidth: 60 }}
                                    />
                                    <Chip
                                        label={getPositionLabel(parcel.position)}
                                        color={getPositionColor(parcel.position)}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        Taille: {PARCEL_SIZES.find(s => s.value === parcel.size)?.label}
                                    </Typography>
                                </Stack>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveParcel(index)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* Add new parcel form */}
            <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="N° de parcelle"
                            value={newParcel.number}
                            onChange={(e) => setNewParcel({ ...newParcel, number: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="101"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Position</InputLabel>
                            <Select
                                value={newParcel.position}
                                label="Position"
                                onChange={(e) => setNewParcel({ ...newParcel, position: e.target.value })}
                            >
                                {POSITIONS.map((pos) => (
                                    <MenuItem key={pos.value} value={pos.value}>
                                        {pos.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Taille</InputLabel>
                            <Select
                                value={newParcel.size}
                                label="Taille"
                                onChange={(e) => setNewParcel({ ...newParcel, size: e.target.value })}
                            >
                                {PARCEL_SIZES.map((size) => (
                                    <MenuItem key={size.value} value={size.value}>
                                        {size.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddParcel}
                            disabled={!newParcel.number.trim()}
                            fullWidth
                            size="small"
                        >
                            Ajouter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Streets Section */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Voies adjacentes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Indiquez les rues ou chemins bordant le terrain
            </Typography>

            {/* Existing streets */}
            {streets.length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Stack spacing={1}>
                        {streets.map((street, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'background.default',
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="body2" fontWeight={500}>
                                        {street.name}
                                    </Typography>
                                    <Chip
                                        label={getPositionLabel(street.position)}
                                        color={getPositionColor(street.position)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveStreet(index)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* Add new street form */}
            <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Nom de la voie"
                            value={newStreet.name}
                            onChange={(e) => setNewStreet({ ...newStreet, name: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="Rue de la Paix"
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Position</InputLabel>
                            <Select
                                value={newStreet.position}
                                label="Position"
                                onChange={(e) => setNewStreet({ ...newStreet, position: e.target.value })}
                            >
                                {POSITIONS.filter(p => ['N', 'S', 'E', 'W'].includes(p.value)).map((pos) => (
                                    <MenuItem key={pos.value} value={pos.value}>
                                        {pos.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddStreet}
                            disabled={!newStreet.name.trim()}
                            fullWidth
                            size="small"
                        >
                            Ajouter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default NeighborParcelsEditor;

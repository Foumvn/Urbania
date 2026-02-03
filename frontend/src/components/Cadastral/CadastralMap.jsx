/**
 * CadastralMap - Composant de carte cadastrale avec Leaflet
 * 
 * Utilise les données GeoJSON de l'API cadastre.gouv.fr pour afficher
 * les parcelles et bâtiments sur une carte interactive.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Box, CircularProgress, Alert, IconButton, Tooltip, Paper, Stack, Typography, Chip
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import LayersIcon from '@mui/icons-material/Layers';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2canvas from 'html2canvas';

// Fix Leaflet default marker icons
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Styles pour les parcelles cadastrales (jaune d'or cadastre)
const PARCELLE_STYLE = {
    fillColor: '#FFD700',
    color: '#000000',
    weight: 1,
    fillOpacity: 0.75, // Nuance légère
};

const PARCELLE_SELECTED_STYLE = {
    fillColor: '#FF6B00',
    color: '#CC0000',
    weight: 3,
    fillOpacity: 0.8,
};

const BATIMENT_STYLE = {
    fillColor: '#FFD700', // Jaune d'or (Gold) conforme à la demande
    color: '#000000',
    weight: 0.8,
    fillOpacity: 1.0,
};

// Composant pour contrôler le zoom et le centrage
function MapControls({ onFitBounds }) {
    const map = useMap();

    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();
    const handleCenter = () => onFitBounds && onFitBounds();

    return (
        <Paper
            sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
            }}
        >
            <Tooltip title="Zoom avant" placement="left">
                <IconButton size="small" onClick={handleZoomIn}>
                    <ZoomInIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Zoom arrière" placement="left">
                <IconButton size="small" onClick={handleZoomOut}>
                    <ZoomOutIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Centrer sur les parcelles" placement="left">
                <IconButton size="small" onClick={handleCenter}>
                    <CenterFocusStrongIcon />
                </IconButton>
            </Tooltip>
        </Paper>
    );
}

// Composant pour ajuster les bounds de la carte
function FitBoundsComponent({ bounds, fitBoundsRef }) {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    // Exposer la fonction fitBounds
    useEffect(() => {
        if (fitBoundsRef) {
            fitBoundsRef.current = () => {
                if (bounds && bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            };
        }
    }, [bounds, map, fitBoundsRef]);

    return null;
}

export default function CadastralMap({
    codeInsee,
    section,
    numero,
    parcelles,
    batiments,
    selectedParcelleId,
    onParcelleClick,
    loading = false,
    error = null,
    height = 500,
    showBatiments = true,
    showLegend = true,
    onExportPNG,
    onExportPDF,
}) {
    const mapRef = useRef(null);
    const fitBoundsRef = useRef(null);
    const [bounds, setBounds] = useState(null);
    const [showBatimentsLayer, setShowBatimentsLayer] = useState(showBatiments);

    // Calculer les bounds à partir des parcelles
    useEffect(() => {
        if (parcelles && parcelles.features && parcelles.features.length > 0) {
            const geojsonLayer = L.geoJSON(parcelles);
            setBounds(geojsonLayer.getBounds());
        }
    }, [parcelles]);

    // Style des parcelles avec sélection
    const getParcelleStyle = useCallback((feature) => {
        const parcelleId = feature?.properties?.id ||
            `${feature?.properties?.section}-${feature?.properties?.numero}`;
        if (parcelleId === selectedParcelleId) {
            return PARCELLE_SELECTED_STYLE;
        }
        return PARCELLE_STYLE;
    }, [selectedParcelleId]);

    // Handler pour les clics sur parcelles
    const onEachParcelle = useCallback((feature, layer) => {
        const props = feature.properties || {};
        const id = props.id || `${props.section}-${props.numero}`;

        layer.on({
            click: () => {
                if (onParcelleClick) {
                    onParcelleClick(feature);
                }
            },
            mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                    weight: 2,
                    fillOpacity: 0.9,
                });
            },
            mouseout: (e) => {
                const target = e.target;
                target.setStyle(getParcelleStyle(feature));
            },
        });

        // Popup avec infos de la parcelle
        layer.bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px;">
                <strong>Parcelle ${props.section || ''} ${props.numero || ''}</strong><br/>
                ${props.contenance ? `Surface: ${props.contenance} m²<br/>` : ''}
                ${props.prefixe ? `Préfixe: ${props.prefixe}<br/>` : ''}
                <small style="color: #666;">ID: ${id}</small>
            </div>
        `);
    }, [onParcelleClick, getParcelleStyle]);

    // Export PNG
    const handleExportPNG = async () => {
        if (!mapRef.current) return;

        try {
            const mapContainer = mapRef.current._container || mapRef.current;
            const canvas = await html2canvas(mapContainer, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
            });

            const link = document.createElement('a');
            link.download = `plan-cadastral-${codeInsee || 'export'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            if (onExportPNG) onExportPNG(canvas);
        } catch (err) {
            console.error('Error exporting PNG:', err);
        }
    };

    // Centre par défaut (France)
    const defaultCenter = [46.603354, 1.888334];
    const defaultZoom = 6;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Chargement des données cadastrales...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    const hasParcelles = parcelles && parcelles.features && parcelles.features.length > 0;

    return (
        <Box sx={{ position: 'relative', height, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer
                ref={mapRef}
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                {/* Fond de carte OpenStreetMap (légèrement estompé pour faire ressortir le cadastre) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    opacity={0.3}
                />

                {/* Parcelles cadastrales */}
                {hasParcelles && (
                    <>
                        <GeoJSON
                            key={`parcelles-${selectedParcelleId}`}
                            data={parcelles}
                            style={getParcelleStyle}
                            onEachFeature={onEachParcelle}
                        />
                        {/* Labels des numéros de parcelles */}
                        {parcelles.features.map((feature, idx) => {
                            const props = feature.properties || {};
                            const numero = props.numero;
                            if (!numero) return null;

                            // Calculer le centre de la parcelle pour le label
                            // On peut utiliser L.geoJSON().getBounds().getCenter() 
                            // mais ici on va faire simple pour la démo ou utiliser turf si dispo
                            // En l'absence de turf, on laisse Leaflet gérer si possible via GeoJSON pointToLayer ou similaire
                            // Plus robuste : Utiliser Marker avec divIcon

                            const centroid = L.geoJSON(feature).getBounds().getCenter();

                            const labelIcon = L.divIcon({
                                className: 'cadastre-label',
                                html: `<div style="
                                    font-family: 'Times New Roman', Times, serif; 
                                    font-size: 11px; 
                                    font-weight: bold; 
                                    color: #000;
                                    text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                                    pointer-events: none;
                                ">${numero}</div>`,
                                iconSize: [30, 20],
                                iconAnchor: [15, 10]
                            });

                            return (
                                <Marker
                                    key={`label-${idx}`}
                                    position={centroid}
                                    icon={labelIcon}
                                    interactive={false}
                                />
                            );
                        })}
                    </>
                )}

                {/* Bâtiments */}
                {showBatimentsLayer && batiments && batiments.features && (
                    <GeoJSON
                        data={batiments}
                        style={BATIMENT_STYLE}
                    />
                )}

                {/* Ajustement automatique des bounds */}
                <FitBoundsComponent bounds={bounds} fitBoundsRef={fitBoundsRef} />

                {/* Contrôles de la carte */}
                <MapControls onFitBounds={() => fitBoundsRef.current && fitBoundsRef.current()} />
            </MapContainer>

            {/* Barre d'outils d'export */}
            <Paper
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    zIndex: 1000,
                    p: 1,
                    display: 'flex',
                    gap: 1,
                }}
            >
                <Tooltip title="Exporter en PNG">
                    <IconButton size="small" onClick={handleExportPNG} color="primary">
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Afficher/Masquer les bâtiments">
                    <IconButton
                        size="small"
                        onClick={() => setShowBatimentsLayer(!showBatimentsLayer)}
                        color={showBatimentsLayer ? 'primary' : 'default'}
                    >
                        <LayersIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Légende */}
            {showLegend && (
                <Paper
                    sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        zIndex: 1000,
                        p: 1.5,
                        fontSize: '0.75rem',
                    }}
                >
                    <Typography variant="caption" fontWeight={600} gutterBottom display="block">
                        Légende
                    </Typography>
                    <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#FFD700', border: '1px solid #000' }} />
                            <Typography variant="caption">Parcelles</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#FF6B00', border: '2px solid #CC0000' }} />
                            <Typography variant="caption">Sélectionnée</Typography>
                        </Box>
                        {showBatimentsLayer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 16, height: 16, bgcolor: '#FFD700', border: '1px solid #000' }} />
                                <Typography variant="caption">Bâtiments</Typography>
                            </Box>
                        )}
                    </Stack>
                </Paper>
            )}

            {/* Indicateur si aucune parcelle */}
            {!hasParcelles && !loading && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        p: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Aucune parcelle à afficher.
                        <br />
                        Recherchez une commune par son code INSEE ou une adresse.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}

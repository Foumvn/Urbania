import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useForm } from '../../context/FormContext';

const CONFIG = {
    API: {
        GEO: 'https://geo.api.gouv.fr',
        ADRESSE: 'https://api-adresse.data.gouv.fr',
        APICARTO: 'https://apicarto.ign.fr/api/cadastre',
        CADASTRE_TILES: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json',
        BASE_STYLE: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json'
    },
    ZOOM: {
        COMMUNE: 14,
        PARCEL: 18,
        DEFAULT: 17
    },
    COLORS: {
        HIGHLIGHT: '#00FF00',
        PARCEL_LINE: '#ff5500',
        PARCEL_FILL: 'rgba(255, 255, 255, 0.3)'
    }
};

const CadastreGenerator = () => {
    const { data, setField, setIsGeneratingDP1 } = useForm();
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const lastTriggerRef = useRef('');

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapRef.current = new maplibregl.Map({
            container: mapContainerRef.current,
            style: CONFIG.API.BASE_STYLE,
            center: [2.3522, 48.8566], // Paris default
            zoom: CONFIG.ZOOM.DEFAULT,
            preserveDrawingBuffer: true,
            interactive: false,
            attributionControl: false
        });

        const map = mapRef.current;

        map.on('load', () => {
            map.addSource('cadastre', {
                type: 'vector',
                url: CONFIG.API.CADASTRE_TILES
            });

            map.addLayer({
                'id': 'parcelles-fill',
                'type': 'fill',
                'source': 'cadastre',
                'source-layer': 'parcelles',
                'paint': {
                    'fill-color': CONFIG.COLORS.PARCEL_FILL,
                    'fill-outline-color': CONFIG.COLORS.PARCEL_LINE
                }
            });

            map.addLayer({
                'id': 'parcelles-line',
                'type': 'line',
                'source': 'cadastre',
                'source-layer': 'parcelles',
                'paint': {
                    'line-color': CONFIG.COLORS.PARCEL_LINE,
                    'line-width': 2
                }
            });
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        const city = data.terrainVille;
        const section = data.section;
        const parcel = data.numeroParcelle;

        if (!city || !section || !parcel) return;

        const triggerKey = `${city}-${section}-${parcel}`;
        if (triggerKey === lastTriggerRef.current) return;
        lastTriggerRef.current = triggerKey;

        const generatePlan = async () => {
            if (!mapRef.current) return;

            setIsGeneratingDP1(true);
            const map = mapRef.current;

            try {
                // 1. Get INSEE code
                const geoResp = await fetch(`${CONFIG.API.GEO}/communes?nom=${encodeURIComponent(city)}&fields=code,nom&format=json&limit=1`);
                const communes = await geoResp.json();
                if (!communes.length) throw new Error('Commune non trouvée');
                const insee = communes[0].code;

                // 2. Search Parcel
                const parcelUrl = `${CONFIG.API.APICARTO}/parcelle?code_insee=${insee}&section=${section.toUpperCase()}&numero=${parcel.padStart(4, '0')}`;
                const parcelResp = await fetch(parcelUrl);
                const parcelData = await parcelResp.json();

                if (!parcelData.features || !parcelData.features.length) throw new Error('Parcelle non trouvée');
                const feature = parcelData.features[0];

                // 3. Highlight and Capture
                if (map.getLayer('highlight-layer-line')) map.removeLayer('highlight-layer-line');
                if (map.getLayer('highlight-layer-fill')) map.removeLayer('highlight-layer-fill');
                if (map.getSource('highlight-source')) map.removeSource('highlight-source');

                map.addSource('highlight-source', { type: 'geojson', data: feature });
                map.addLayer({
                    id: 'highlight-layer-fill',
                    type: 'fill',
                    source: 'highlight-source',
                    paint: { 'fill-color': CONFIG.COLORS.HIGHLIGHT, 'fill-opacity': 0.3 }
                });
                map.addLayer({
                    id: 'highlight-layer-line',
                    type: 'line',
                    source: 'highlight-source',
                    paint: { 'line-color': CONFIG.COLORS.HIGHLIGHT, 'line-width': 4 }
                });

                // Zoom to feature
                const bounds = calculateBounds(feature.geometry);
                map.fitBounds(bounds, {
                    padding: 100, // More padding to see surrounding
                    duration: 0,
                    animate: false
                });

                // Wait for map to settle and layers to be visible
                await new Promise(resolve => {
                    const check = () => {
                        if (map.loaded() && map.isIdle()) resolve();
                        else setTimeout(check, 100);
                    };
                    check();
                });

                // Capture
                const canvas = map.getCanvas();
                const dataURL = canvas.toDataURL('image/png');

                // Update form data
                const pieces = { ...(data.piecesJointes || {}) };
                pieces['dp1'] = dataURL;
                setField('piecesJointes', pieces);

            } catch (error) {
                console.error('Cadastre background Error:', error);
            } finally {
                // We add a small artificial delay for better loading UX as requested (Gemini style)
                setTimeout(() => {
                    setIsGeneratingDP1(false);
                }, 2000);
            }
        };

        const timer = setTimeout(generatePlan, 1000); // Debounce to wait for typing to finish
        return () => clearTimeout(timer);
    }, [data.terrainVille, data.section, data.numeroParcelle]);

    const calculateBounds = (geometry) => {
        let coords = [];
        if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
        else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0][0];

        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        coords.forEach(([lng, lat]) => {
            minLng = Math.min(minLng, lng);
            minLat = Math.min(minLat, lat);
            maxLng = Math.max(maxLng, lng);
            maxLat = Math.max(maxLat, lat);
        });
        return [[minLng, minLat], [maxLng, maxLat]];
    };

    return (
        <div
            ref={mapContainerRef}
            style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                width: '1200px',
                height: '800px',
                visibility: 'hidden'
            }}
        />
    );
};

export default CadastreGenerator;

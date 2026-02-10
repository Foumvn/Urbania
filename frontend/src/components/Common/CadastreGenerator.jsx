import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useForm } from '../../context/FormContext';
import { useNotification } from '../../context/NotificationContext';

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
    const { data, setField, setIsGeneratingDP1, generateTechnicalDocument } = useForm();
    const { showNotification } = useNotification();
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const lastTriggerRef = useRef('');

    // --- INITIALISATION DE LA CARTE ---
    useEffect(() => {
        if (!mapContainerRef.current) return;

        let map;
        try {
            map = new maplibregl.Map({
                container: mapContainerRef.current,
                style: CONFIG.API.BASE_STYLE,
                center: [2.3522, 48.8566], // Paris default
                zoom: CONFIG.ZOOM.DEFAULT,
                preserveDrawingBuffer: true,
                interactive: false,
                attributionControl: false
            });

            mapRef.current = map;

            // Silencing warnings
            map.on('styleimagemissing', (e) => {
                if (!map.hasImage(e.id)) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1; canvas.height = 1;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'rgba(0,0,0,0)';
                    ctx.fillRect(0, 0, 1, 1);
                    map.addImage(e.id, ctx.getImageData(0, 0, 1, 1));
                }
            });

            map.on('error', (e) => {
                console.warn('MapLibre error handle:', e.error?.message || e);
            });

            map.on('load', () => {
                if (!map.getSource('cadastre')) {
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

                    map.addLayer({
                        'id': 'parcelles-labels',
                        'type': 'symbol',
                        'source': 'cadastre',
                        'source-layer': 'parcelles',
                        'layout': {
                            'text-field': ['get', 'numero'],
                            'text-size': 14,
                            'text-allow-overlap': true,
                            'text-ignore-placement': true,
                            'text-font': ['Open Sans Semibold']
                        },
                        'paint': {
                            'text-color': '#000000',
                            'text-halo-color': '#ffffff',
                            'text-halo-width': 2
                        }
                    });
                }
            });
        } catch (err) {
            console.error('CRITICAL: Map initialization failed:', err);
            showNotification("Erreur d'affichage de la carte (Pilote graphique ou navigateur incompatible).", 'error');
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const lastTriggerCountRef = useRef(data.mapTriggerCount || 0);

    // --- LOGIQUE DE GÉNÉRATION DES PLANS ---
    useEffect(() => {
        // Only run if the trigger count has changed (user clicked "Chercher")
        if (data.mapTriggerCount === lastTriggerCountRef.current) return;
        lastTriggerCountRef.current = data.mapTriggerCount;

        const city = (data.terrainVille || '').trim();
        const cp = (data.terrainCodePostal || '').trim();
        const section = (data.section || '').trim().toUpperCase();
        const parcel = (data.numeroParcelle || '').trim().toUpperCase().replace(/O/g, '0');

        if (!city || !section || !parcel) {
            return;
        }

        const generatePlan = async () => {
            if (!mapRef.current) return;

            const map = mapRef.current;

            // Wait for style to be loaded to avoid "Style is not done loading" error
            if (!map.isStyleLoaded()) {
                console.log("Waiting for map style to load...");
                await new Promise(resolve => {
                    const onStyleLoad = () => {
                        map.off('style.load', onStyleLoad);
                        resolve();
                    };
                    map.on('style.load', onStyleLoad);
                    // Also resolve on 'load' just in case
                    map.once('load', resolve);
                    // Timeout safety
                    setTimeout(resolve, 3000);
                });
            }

            setIsGeneratingDP1(true);

            try {
                // 1. Resolve INSEE code
                let insee = '';
                let resolvedCityName = city;

                // A. Check for Paris, Lyon, Marseille Arrondissements
                if (cp && cp.length === 5) {
                    if (cp.startsWith('750')) insee = `751${cp.slice(-2)}`;
                    else if (cp.startsWith('130')) {
                        const arr = parseInt(cp.slice(-2));
                        if (arr <= 16) insee = `132${cp.slice(-2)}`;
                    } else if (cp.startsWith('690')) {
                        const arr = parseInt(cp.slice(-1));
                        if (arr <= 9) insee = `6938${arr}`;
                    }
                }

                // B. If no INSEE yet, try searching by Postal Code (much more precise)
                if (!insee && cp && cp.length === 5) {
                    const cpResp = await fetch(`${CONFIG.API.GEO}/communes?codePostal=${cp}&fields=code,nom&format=json`);
                    const cpCommunes = await cpResp.json();
                    if (cpCommunes && cpCommunes.length > 0) {
                        // If multiple communes share a CP, try to find the one matching the name
                        let match = cpCommunes.find(c => c.nom.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(c.nom.toLowerCase()));
                        if (!match) match = cpCommunes[0];
                        insee = match.code;
                        resolvedCityName = match.nom;
                    }
                }

                // C. Fallback to name search
                if (!insee) {
                    const geoResp = await fetch(`${CONFIG.API.GEO}/communes?nom=${encodeURIComponent(city)}&fields=code,nom&format=json&limit=10`);
                    let communes = await geoResp.json();

                    if (!communes || communes.length === 0) {
                        const altCity = city.replace(/St /i, 'Saint ').replace(/St-/, 'Saint-');
                        if (altCity !== city) {
                            const altResp = await fetch(`${CONFIG.API.GEO}/communes?nom=${encodeURIComponent(altCity)}&fields=code,nom&format=json&limit=10`);
                            communes = await altResp.json();
                        }
                    }

                    if (!communes || communes.length === 0) throw new Error(`Commune "${city}" non identifiée. Vérifiez l'orthographe ou le code postal.`);

                    let match = communes[0];
                    if (communes.length > 1 && cp) {
                        const dept = cp.slice(0, 2);
                        const cpMatch = communes.find(c => c.code.startsWith(dept));
                        if (cpMatch) match = cpMatch;
                    }
                    insee = match.code;
                    resolvedCityName = match.nom;
                }

                // 2. Search Parcel with multiple retry strategies
                const sectionsToTry = [
                    section,
                    section.length === 1 ? `0${section}` : section,
                    section.length === 1 ? `00${section}` : (section.length === 2 ? `0${section}` : section)
                ].filter((v, i, a) => a.indexOf(v) === i); // Unique values

                const paddedParcel = parcel.padStart(4, '0');
                const rawParcel = parcel.replace(/^0+/, ''); // Remove leading zeros
                const parcelsToTry = [paddedParcel, rawParcel].filter((v, i, a) => a.indexOf(v) === i);

                let parcelData = null;
                let usedSection = section;
                let usedParcel = paddedParcel;

                // Nested loop to try all combinations
                for (const s of sectionsToTry) {
                    for (const p of parcelsToTry) {
                        const parcelUrl = `${CONFIG.API.APICARTO}/parcelle?code_insee=${insee}&section=${s}&numero=${p}`;
                        const parcelResp = await fetch(parcelUrl);
                        if (parcelResp.ok) {
                            const result = await parcelResp.json();
                            if (result.features && result.features.length > 0) {
                                parcelData = result;
                                usedSection = s;
                                usedParcel = p;
                                break;
                            }
                        }
                    }
                    if (parcelData) break;
                }

                if (!parcelData) {
                    throw new Error(`Parcelle ${section} ${parcel} introuvable à ${resolvedCityName} (INSEE: ${insee}).`);
                }

                let feature = parcelData.features[0];

                // --- SUCCESS FEEDBACK ---
                showNotification(`Parcelle localisée avec succès à ${resolvedCityName}`, 'success');

                // --- AUTO-FILL FOR PDF ---
                if (!data.terrainCodePostal && insee) {
                    setField('terrainCodePostal', insee.startsWith('97') ? insee.slice(0, 3) + '00' : insee.slice(0, 2) + '000');
                }
                if (!data.terrainAdresse) {
                    setField('terrainAdresse', `Parcelle ${usedSection} ${paddedParcel}`);
                }

                // 3. Highlight on Map
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

                // Ensure labels are always on top
                if (map.getLayer('parcelles-labels')) {
                    map.moveLayer('parcelles-labels');
                }

                const bounds = calculateParcelBounds(feature.geometry);
                if (!bounds) throw new Error('Géométrie invalide');

                // --- 4. CENTRAGE ET CAPTURE RÉELLE POUR DP1 ---
                // Augmentation du padding (300) pour voir plus de contexte autour de la parcelle
                map.fitBounds(bounds, { padding: 300, duration: 0 });

                // On attend que la carte soit stable et chargée
                await waitForMapIdle(map);

                // Capture du canvas MapLibre
                const dp1Image = map.getCanvas().toDataURL('image/png');

                // --- 5. GÉNÉRATION IA POUR DP2 UNIQUEMENT ---
                const docData = {
                    ...data,
                    terrainVille: resolvedCityName,
                    section: usedSection,
                    numeroParcelle: paddedParcel,
                    address: data.terrainAdresse || `Parcelle ${usedSection} ${paddedParcel}`,
                    city: resolvedCityName,
                    cp: data.terrainCodePostal || (insee.startsWith('97') ? insee.slice(0, 3) + '00' : insee.slice(0, 2) + '000'),
                };

                // DP2 via IA (Plan de masse)
                const dp2Url = await generateTechnicalDocument('dp2', docData);

                const updatedPieces = { ...(data.piecesJointes || {}) };

                // DP1 est la capture réelle
                updatedPieces['dp1'] = dp1Image;

                // DP2 est généré par l'IA
                if (dp2Url) {
                    const resp = await fetch(dp2Url);
                    const blob = await resp.blob();
                    const reader = new FileReader();
                    updatedPieces['dp2'] = await new Promise(resolve => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }

                setField('piecesJointes', updatedPieces);
                setField('terrainAdresse', data.terrainAdresse || `Parcelle ${usedSection} ${paddedParcel}`);
                setField('surfaceTerrain', feature.properties.contenance || data.surfaceTerrain);

            } catch (error) {
                console.error('Cadastre Error:', error.message);
                showNotification(error.message, 'error');
            } finally {
                setTimeout(() => setIsGeneratingDP1(false), 1500);
            }
        };

        generatePlan();
    }, [data.mapTriggerCount]); // Only depend on Trigger Count, but read others from 'data' closure (which updates on rerender)
    // Wait, if I remove other deps, 'data' will be stale if I don't follow react rules.
    // Actually, 'data' is an object that is stable reference? No, it comes from context.
    // If I only put [data.mapTriggerCount], the effect function is recreated only when that changes?
    // references to 'data' inside might be old.
    // Correct way: Keep all dependencies but use a ref guard.

    // I will write the replacement content preserving the deps list in the next tool call, 
    // but here I need to be careful with the replacement block.
    // I will REPLACE the whole useEffect block.

    const waitForMapIdle = (map) => new Promise(resolve => {
        const onIdle = () => {
            map.off('idle', onIdle);
            resolve();
        };

        // If map is already idle, the event might not fire immediately
        // But in fitBounds with duration: 0, it usually fires.
        map.once('idle', resolve);

        // Safety timeout to never block the UI
        setTimeout(resolve, 3000);
    });

    const calculateParcelBounds = (geometry) => {
        try {
            if (!geometry) return null;
            let coords = [];

            if (geometry.type === 'Polygon') {
                coords = geometry.coordinates[0];
            } else if (geometry.type === 'MultiPolygon') {
                if (geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
                    coords = geometry.coordinates[0][0];
                }
            } else if (geometry.type === 'Point') {
                coords = [geometry.coordinates];
            }

            if (!coords || coords.length === 0) return null;

            let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
            let found = false;

            coords.forEach(c => {
                const ln = parseFloat(c[0]), lt = parseFloat(c[1]);
                if (!isNaN(ln) && !isNaN(lt)) {
                    minLng = Math.min(minLng, ln);
                    minLat = Math.min(minLat, lt);
                    maxLng = Math.max(maxLng, ln);
                    maxLat = Math.max(maxLat, lt);
                    found = true;
                }
            });

            if (!found || minLng === Infinity) return null;
            return [[minLng, minLat], [maxLng, maxLat]];
        } catch (e) {
            console.error('Error in calculateParcelBounds:', e);
            return null;
        }
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

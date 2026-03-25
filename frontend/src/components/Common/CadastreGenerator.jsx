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
        HIGHLIGHT_OUTLINE: '#008000',
        PARCEL_LINE: '#ff5500',
        PARCEL_FILL: 'rgba(255, 255, 255, 0.3)'
    }
};

const CadastreGenerator = () => {
    const { data, setField, setIsGeneratingDP1, generateTechnicalDocument, mapTriggerCount } = useForm();
    const { showNotification } = useNotification();
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const dataRef = useRef(data);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

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

    const lastTriggerCountRef = useRef(mapTriggerCount || 0);

    // --- LOGIQUE DE GÉNÉRATION DES PLANS ---
    useEffect(() => {
        // Only run if the trigger count has changed (user clicked "Chercher")
        if (mapTriggerCount === lastTriggerCountRef.current) return;
        lastTriggerCountRef.current = mapTriggerCount;

        const currentData = dataRef.current;
        const city = (currentData.terrainVille || '').trim();
        const cp = (currentData.terrainCodePostal || '').trim();
        const section = (currentData.section || '').trim().toUpperCase();
        const parcel = (currentData.numeroParcelle || '').trim().toUpperCase().replace(/O/g, '0');

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
                        try {
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
                        } catch (e) {
                            console.warn(`Failed to fetch parcel with section ${s}, numero ${p}:`, e);
                        }
                    }
                    if (parcelData) break;
                }

                // 3. Fallback: If section/numero search failed, try reverse geocoding
                if (!parcelData) {
                    console.warn(`Parcelle ${section} ${parcel} introuvable par section/numéro. Tentative par coordonnées...`);
                    
                    // Geocode the address to get coordinates
                    const addressForGeo = `${data.terrainNumero || ''} ${data.terrainAdresse || ''}, ${cp || ''} ${city}`;
                    const geoResp = await fetch(`${CONFIG.API.ADRESSE}/search/?q=${encodeURIComponent(addressForGeo)}&limit=1`);
                    const geoData = await geoResp.json();
                    
                    if (geoData.features && geoData.features.length > 0) {
                        const coords = geoData.features[0].geometry.coordinates;
                        const lon = coords[0];
                        const lat = coords[1];
                        
                        // Try to find parcel by coordinates
                        const coordUrl = `${CONFIG.API.APICARTO}/parcelle?geom=${encodeURIComponent(JSON.stringify({type: "Point", coordinates: [lon, lat]}))}`;
                        try {
                            const coordResp = await fetch(coordUrl);
                            if (coordResp.ok) {
                                const coordResult = await coordResp.json();
                                if (coordResult.features && coordResult.features.length > 0) {
                                    parcelData = coordResult;
                                    const props = coordResult.features[0].properties;
                                    usedSection = props.section || section;
                                    usedParcel = props.numero || parcel;
                                    paddedParcel = String(usedParcel).padStart(4, '0');
                                }
                            }
                        } catch (e) {
                            console.warn('Coord reverse geocode failed:', e);
                        }
                    }
                }

                // 4. If still no parcel data, use local tiles as last resort
                if (!parcelData) {
                    // Try to find in the GeoJSON tiles based on section and parcel number
                    console.warn(`Fallback: searching in local GeoJSON tiles for section ${section}, parcel ${parcel}`);
                    
                    // Get the parcel from the map source if available
                    const map = mapRef.current;
                    if (map && map.getSource('cadastre')) {
                        // We'll handle this in the map query below
                    }
                    
                    throw new Error(`Parcelle ${section} ${parcel} introuvable à ${resolvedCityName} (INSEE: ${insee}). Veuillez vérifier les références cadastrales.`);
                }

                let feature = parcelData.features[0];

                // --- SUCCESS FEEDBACK ---
                const sectionChanged = usedSection !== section || usedParcel !== parcel;
                if (sectionChanged) {
                    showNotification(`Parcelle localisée : Section ${usedSection}, Parcelle ${paddedParcel}`, 'success');
                } else {
                    showNotification(`Parcelle localisée avec succès à ${resolvedCityName}`, 'success');
                }

                // --- AUTO-FILL FOR PDF ---
                if (!data.terrainCodePostal && insee) {
                    setField('terrainCodePostal', insee.startsWith('97') ? insee.slice(0, 3) + '00' : insee.slice(0, 2) + '000');
                }
                if (!data.terrainAdresse) {
                    setField('terrainAdresse', `Parcelle ${usedSection} ${paddedParcel}`);
                }
                
                // Update section and numeroParcelle with the correct values from the found parcel
                if (sectionChanged) {
                    setField('section', usedSection);
                    setField('numeroParcelle', paddedParcel);
                }

                const bounds = calculateParcelBounds(feature.geometry);
                if (!bounds) throw new Error('Géométrie invalide');

                // --- 3. CENTRAGE SUR LA PARCELLE ---
                map.fitBounds(bounds, { padding: 350, duration: 0 });

                // Attendre que la carte soit stable (tuiles chargées)
                await waitForMapIdle(map);
                map.triggerRepaint();
                await waitForRenderedFrame(map);

                // --- 4. CAPTURE + HACHURE VERTE VIA CANVAS 2D ---
                // Le conteneur est caché (visibility:hidden) → les layers WebGL ne
                // peignent pas de façon fiable. On dessine la hachure directement
                // sur un canvas 2D composite après la capture de fond.
                const baseCanvas = map.getCanvas();
                const dpr = window.devicePixelRatio || 1;

                const compositeCanvas = document.createElement('canvas');
                compositeCanvas.width = baseCanvas.width;
                compositeCanvas.height = baseCanvas.height;
                const ctx = compositeCanvas.getContext('2d');

                // Fond : carte MapLibre
                ctx.drawImage(baseCanvas, 0, 0);

                // Polygone de la parcelle projeté en coordonnées canvas
                const geometry = feature.geometry;
                let rings = null;
                if (geometry.type === 'Polygon') {
                    rings = geometry.coordinates;
                } else if (geometry.type === 'MultiPolygon' && geometry.coordinates.length > 0) {
                    rings = geometry.coordinates[0];
                }

                if (rings && rings.length > 0) {
                    const outerRing = rings[0];

                    const projectRing = (ring) => ring.map(coord => {
                        const pt = map.project([coord[0], coord[1]]);
                        return { x: pt.x * dpr, y: pt.y * dpr };
                    });

                    const drawPath = (pts) => {
                        ctx.beginPath();
                        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
                        ctx.closePath();
                    };

                    const pts = projectRing(outerRing);

                    // Remplissage vert semi-transparent
                    drawPath(pts);
                    ctx.fillStyle = 'rgba(0, 220, 0, 0.40)';
                    ctx.fill();

                    // Contour vert foncé épais en tirets
                    drawPath(pts);
                    ctx.strokeStyle = '#006600';
                    ctx.lineWidth = 4 * dpr;
                    ctx.setLineDash([12 * dpr, 6 * dpr]);
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Second contour fin plein pour la lisibilité
                    drawPath(pts);
                    ctx.strokeStyle = 'rgba(0, 80, 0, 0.7)';
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.setLineDash([]);
                    ctx.stroke();
                }

                const dp1Image = compositeCanvas.toDataURL('image/png');

                // --- 5. GÉNÉRATION IA POUR DP2 UNIQUEMENT ---
                const docData = {
                    ...currentData,
                    terrainVille: resolvedCityName,
                    section: usedSection,
                    numeroParcelle: paddedParcel,
                    address: currentData.terrainAdresse || `Parcelle ${usedSection} ${paddedParcel}`,
                    city: resolvedCityName,
                    cp: currentData.terrainCodePostal || (insee.startsWith('97') ? insee.slice(0, 3) + '00' : insee.slice(0, 2) + '000'),
                };

                // DP2 via IA (Plan de masse)
                const dp2Url = await generateTechnicalDocument('dp2', docData);

                const updatedPieces = { ...(currentData.piecesJointes || {}) };

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
                setField('terrainAdresse', currentData.terrainAdresse || `Parcelle ${usedSection} ${paddedParcel}`);
                setField('surfaceTerrain', feature.properties.contenance || currentData.surfaceTerrain);

            } catch (error) {
                console.error('Cadastre Error:', error.message);
                showNotification(error.message, 'error');
            } finally {
                setTimeout(() => setIsGeneratingDP1(false), 1500);
            }
        };

        generatePlan();
    }, [mapTriggerCount, setField, setIsGeneratingDP1, generateTechnicalDocument, showNotification]);

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

    const waitForRenderedFrame = (map) => new Promise(resolve => {
        let resolved = false;
        const finish = () => {
            if (resolved) return;
            resolved = true;
            map.off('render', onRender);
            resolve();
        };
        const onRender = () => {
            requestAnimationFrame(() => requestAnimationFrame(finish));
        };
        map.on('render', onRender);
        map.triggerRepaint();
        setTimeout(finish, 1200);
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

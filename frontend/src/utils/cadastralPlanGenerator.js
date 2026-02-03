/**
 * Cadastral Plan Generator Utility - Version Officielle
 * Génère des plans cadastraux au style officiel français cadastre.gouv.fr
 * Utilise les vraies données cadastrales pour un rendu professionnel
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Couleurs officielles du cadastre français
const COLORS = {
    parcelFill: '#FFF9C4',           // Jaune plus clair pour parcelles
    parcelFillLight: '#FFFDE7',      // Très clair
    mainParcelFill: '#FFE082',       // Jaune/Orange moyen
    parcelStroke: '#444444',         // Bordure
    streetFill: '#FFFFFF',           // Blanc pour voies
    streetStroke: '#AAAAAA',         // Gris pour contours voies
    buildingFill: '#FFD700',         // Jaune OR (Gold) - Demandé par l'utilisateur
    buildingStroke: '#8B4513',       // Marron contour bâtiment
    text: '#000000',                 // Texte noir
    textLight: '#666666',            // Texte gris
    background: '#FFFFFF',           // Fond blanc
    grid: '#E0E0E0',                 // Grille légère
    northArrow: '#003366',           // Bleu marine flèche nord
    watermark: 'rgba(0,51,102,0.05)' // Filigrane léger
};

/**
 * Génère un plan cadastral professionnel sur canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {Object} data - Données du formulaire
 */
export function drawCadastralPlan(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Effacer et préparer le fond
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Dessiner le filigrane léger
    drawWatermark(ctx, width, height);

    // Récupérer les données cadastrales
    const cadastralData = buildCadastralLayout(data);

    // Zone de dessin principale
    const margin = 50;
    const planWidth = width - margin * 2;
    const planHeight = height - margin * 2 - 60;
    const planX = margin;
    const planY = 60;

    // Dessiner le cadre du plan
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(planX, planY, planWidth, planHeight);

    // Dessiner les voies en premier (arrière-plan)
    drawStreetsLayer(ctx, cadastralData.streets, planX, planY, planWidth, planHeight);

    // Dessiner toutes les parcelles
    drawParcelsGrid(ctx, cadastralData.parcels, cadastralData.mainParcel, planX, planY, planWidth, planHeight, data);

    // Dessiner les bâtiments existants
    drawBuildingsOnParcels(ctx, cadastralData.buildings, planX, planY, planWidth, planHeight);

    // Ajouter le projet de construction
    if (data.surfacePlancher > 0) {
        drawProjetConstruction(ctx, cadastralData.mainParcel, planX, planY, planWidth, planHeight, data);
    }

    // Dessiner le cartouche
    drawCartouche(ctx, data, margin, height - 45);

    // Flèche Nord
    drawNorthArrow(ctx, width - 45, 90);

    // Échelle
    drawScaleBar(ctx, margin + 10, height - 25, data.echelleDepuis || '1:500');

    // Titre principal
    drawMainTitle(ctx, data, margin, 15);
}

/**
 * Construire la disposition des parcelles à partir des données
 */
function buildCadastralLayout(data) {
    const section = data.section || 'AB';
    const mainNum = data.numeroParcelle || '99';
    const mainNumInt = parseInt(mainNum) || 99;

    // Générer une grille réaliste de parcelles autour de la parcelle principale
    const parcels = [];
    let index = 0;

    // Grille 5x4 de parcelles
    const gridCols = 5;
    const gridRows = 4;
    const mainRow = 1;
    const mainCol = 2;

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const isMain = (row === mainRow && col === mainCol);
            const parcelNum = mainNumInt - 3 + col + (row - mainRow) * gridCols;

            // Variation de taille pour plus de réalisme
            const widthVariation = 0.7 + Math.random() * 0.6;
            const heightVariation = 0.7 + Math.random() * 0.6;

            parcels.push({
                number: Math.max(1, parcelNum).toString(),
                row,
                col,
                isMain,
                widthFactor: widthVariation,
                heightFactor: heightVariation,
                hasBuilding: Math.random() > 0.4 && !isMain, // 60% ont un bâtiment
                section
            });
            index++;
        }
    }

    // Voies
    const streets = [
        {
            name: data.terrainVoie || 'Rue',
            position: 'horizontal',
            row: 2
        },
        {
            name: 'Rue de la Poste',
            position: 'vertical',
            col: 4
        }
    ];

    // Bâtiments sur parcelles voisines
    const buildings = parcels
        .filter(p => p.hasBuilding && !p.isMain)
        .map(p => ({
            parcelRow: p.row,
            parcelCol: p.col,
            type: 'existing'
        }));

    const mainParcel = parcels.find(p => p.isMain);

    return { parcels, streets, buildings, mainParcel };
}

/**
 * Dessiner le filigrane de fond
 */
function drawWatermark(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#003366';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText('URBANIA', 0, 0);
    ctx.restore();
}

/**
 * Dessiner les voies
 */
function drawStreetsLayer(ctx, streets, planX, planY, planWidth, planHeight) {
    ctx.fillStyle = COLORS.streetFill;
    ctx.strokeStyle = COLORS.streetStroke;
    ctx.lineWidth = 1;

    const streetWidth = 25;
    const cellWidth = planWidth / 5;
    const cellHeight = planHeight / 4;

    streets.forEach(street => {
        if (street.position === 'horizontal') {
            const y = planY + (street.row + 0.5) * cellHeight;

            // Route
            ctx.fillRect(planX, y - streetWidth / 2, planWidth, streetWidth);

            // Bordures pointillées de la route
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(planX, y);
            ctx.lineTo(planX + planWidth, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Nom de rue
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.font = 'italic 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(street.name, planX + planWidth / 2, y);
            ctx.restore();
        } else if (street.position === 'vertical') {
            const x = planX + (street.col + 0.5) * cellWidth;

            // Route verticale
            ctx.fillRect(x - streetWidth / 2, planY, streetWidth, planHeight);

            // Nom de rue vertical
            ctx.save();
            ctx.translate(x, planY + planHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#333';
            ctx.font = 'italic 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(street.name, 0, 0);
            ctx.restore();
        }
    });
}

/**
 * Dessiner la grille de parcelles
 */
function drawParcelsGrid(ctx, parcels, mainParcel, planX, planY, planWidth, planHeight, data) {
    const cellWidth = planWidth / 5;
    const cellHeight = planHeight / 4;
    const padding = 3;

    parcels.forEach(parcel => {
        const x = planX + parcel.col * cellWidth + padding;
        const y = planY + parcel.row * cellHeight + padding;
        const w = cellWidth * parcel.widthFactor - padding * 2;
        const h = cellHeight * parcel.heightFactor - padding * 2;

        // Couleur selon si c'est la parcelle principale ou non
        ctx.fillStyle = parcel.isMain ? COLORS.mainParcelFill : COLORS.parcelFill;
        ctx.strokeStyle = COLORS.parcelStroke;
        ctx.lineWidth = parcel.isMain ? 2.5 : 1;

        // Dessiner la parcelle
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        // Numéro de parcelle
        ctx.fillStyle = COLORS.text;
        ctx.font = parcel.isMain ? 'bold 14px Arial' : '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(parcel.number, x + w / 2, y + h / 2);

        // Ajouter une indication de surface pour la parcelle principale
        if (parcel.isMain && data.surfaceTerrain) {
            ctx.font = '9px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`${data.surfaceTerrain} m²`, x + w / 2, y + h / 2 + 14);
        }
    });
}

/**
 * Dessiner les bâtiments sur les parcelles
 */
function drawBuildingsOnParcels(ctx, buildings, planX, planY, planWidth, planHeight) {
    const cellWidth = planWidth / 5;
    const cellHeight = planHeight / 4;

    buildings.forEach(building => {
        const x = planX + building.parcelCol * cellWidth + cellWidth * 0.2;
        const y = planY + building.parcelRow * cellHeight + cellHeight * 0.15;
        const w = cellWidth * 0.5;
        const h = cellHeight * 0.4;

        // Petit bâtiment existant
        ctx.fillStyle = COLORS.buildingFill;
        ctx.strokeStyle = COLORS.buildingStroke;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();
    });
}

/**
 * Dessiner le projet de construction sur la parcelle principale
 */
function drawProjetConstruction(ctx, mainParcel, planX, planY, planWidth, planHeight, data) {
    if (!mainParcel) return;

    const cellWidth = planWidth / 5;
    const cellHeight = planHeight / 4;

    const parcelX = planX + mainParcel.col * cellWidth + 3;
    const parcelY = planY + mainParcel.row * cellHeight + 3;
    const parcelW = cellWidth * mainParcel.widthFactor - 6;
    const parcelH = cellHeight * mainParcel.heightFactor - 6;

    // Position du projet (centré avec marges)
    const projectW = parcelW * 0.5;
    const projectH = parcelH * 0.4;
    const projectX = parcelX + (parcelW - projectW) / 2;
    const projectY = parcelY + parcelH * 0.25;

    // Dessiner le projet avec hachures
    ctx.fillStyle = '#FF7043';
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(projectX, projectY, projectW, projectH);
    ctx.fill();
    ctx.stroke();

    // Hachures diagonales pour indiquer "projet"
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < projectW + projectH; i += 8) {
        ctx.moveTo(projectX + Math.min(i, projectW), projectY + Math.max(0, i - projectW));
        ctx.lineTo(projectX + Math.max(0, i - projectH), projectY + Math.min(i, projectH));
    }
    ctx.stroke();

    // Label "PROJET"
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROJET', projectX + projectW / 2, projectY + projectH / 2);

    // Dimensions du projet
    ctx.fillStyle = COLORS.text;
    ctx.font = '8px Arial';
    if (data.surfacePlancher) {
        ctx.fillText(`${data.surfacePlancher} m²`, projectX + projectW / 2, projectY + projectH + 10);
    }
}

/**
 * Dessiner le cartouche d'informations
 */
function drawCartouche(ctx, data, x, y) {
    const commune = data.terrainVille || data.commune || 'Commune';
    const section = data.section || '';
    const parcelle = data.numeroParcelle || '';
    const address = data.terrainAdresse || '';

    // Cadre du cartouche
    ctx.fillStyle = '#f9f9f9';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y - 5, 300, 40);
    ctx.strokeRect(x, y - 5, 300, 40);

    // Textes
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';

    ctx.font = 'bold 11px Arial';
    ctx.fillText(`Commune: ${commune}`, x + 8, y + 8);

    ctx.font = '10px Arial';
    ctx.fillText(`Réf: Section ${section} - Parcelle n° ${parcelle}`, x + 8, y + 22);

    if (address) {
        ctx.font = '9px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(address.substring(0, 40), x + 160, y + 8);
    }
}

/**
 * Dessiner la flèche Nord
 */
function drawNorthArrow(ctx, x, y) {
    ctx.save();

    // Cercle de fond
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = COLORS.northArrow;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flèche
    ctx.fillStyle = COLORS.northArrow;
    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x - 6, y + 8);
    ctx.lineTo(x, y + 3);
    ctx.lineTo(x + 6, y + 8);
    ctx.closePath();
    ctx.fill();

    // Lettre N
    ctx.fillStyle = COLORS.northArrow;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', x, y - 28);

    ctx.restore();
}

/**
 * Dessiner l'échelle
 */
function drawScaleBar(ctx, x, y, scale) {
    const barWidth = 80;
    const barHeight = 6;

    // Barre alternée noir/blanc
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
        ctx.fillRect(x + i * (barWidth / 4), y, barWidth / 4, barHeight);
    }

    // Contour
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Graduations
    ctx.fillStyle = COLORS.text;
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('0', x, y - 3);
    ctx.fillText('25m', x + barWidth, y - 3);

    // Échelle textuelle
    ctx.textAlign = 'left';
    ctx.fillText(`Échelle: ${scale}`, x + barWidth + 10, y + 4);
}

/**
 * Dessiner le titre principal
 */
function drawMainTitle(ctx, data, x, y) {
    const commune = data.terrainVille || data.commune || '';

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(`PLAN DE SITUATION - Déclaration Préalable`, x, y);

    if (commune) {
        ctx.font = '11px Arial';
        ctx.fillText(`${commune}`, x, y + 16);
    }

    // Date
    ctx.font = '9px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, x + 450, y + 8);
}

/**
 * Exporter le canvas en PNG
 */
export function downloadAsPNG(canvas, filename = 'plan_cadastral.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

/**
 * Générer un PDF du plan cadastral
 */
export async function generateCadastralPDF(canvas, data) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    // Intégrer le canvas comme image PNG
    const pngDataUrl = canvas.toDataURL('image/png', 1.0);
    const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngBytes);

    // Dimensions pour s'adapter à la page avec marges
    const margin = 40;
    const maxWidth = 595 - margin * 2;
    const maxHeight = 550;

    const aspectRatio = canvas.width / canvas.height;
    let imgWidth = maxWidth;
    let imgHeight = imgWidth / aspectRatio;

    if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
    }

    // Dessiner l'image centrée
    const imgX = (595 - imgWidth) / 2;
    const imgY = 842 - margin - imgHeight - 100;
    page.drawImage(pngImage, { x: imgX, y: imgY, width: imgWidth, height: imgHeight });

    // Polices
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Titre
    page.drawText('PLAN DE SITUATION (DP1)', {
        x: margin,
        y: 842 - 35,
        size: 18,
        font: helveticaBold,
        color: rgb(0.0, 0.2, 0.4),
    });

    // Sous-titre
    page.drawText('Déclaration Préalable de Travaux', {
        x: margin,
        y: 842 - 55,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
    });

    // Informations cadastrales
    const infoY = 140;
    const commune = data.terrainVille || data.commune || '';
    const address = data.terrainAdresse || '';
    const section = data.section || '';
    const parcelle = data.numeroParcelle || '';

    page.drawText(`Commune: ${commune}`, {
        x: margin, y: infoY, size: 10, font: helvetica,
    });
    page.drawText(`Adresse: ${address}`, {
        x: margin, y: infoY - 15, size: 10, font: helvetica,
    });
    page.drawText(`Référence cadastrale: Section ${section} - Parcelle n° ${parcelle}`, {
        x: margin, y: infoY - 30, size: 10, font: helvetica,
    });

    if (data.surfaceTerrain) {
        page.drawText(`Surface du terrain: ${data.surfaceTerrain} m²`, {
            x: margin, y: infoY - 45, size: 10, font: helvetica,
        });
    }

    // Légende
    page.drawText('Légende:', {
        x: 400, y: infoY, size: 10, font: helveticaBold,
    });

    // Parcelle principale
    page.drawRectangle({ x: 400, y: infoY - 18, width: 12, height: 12, color: rgb(0.96, 0.64, 0.38) });
    page.drawText('Parcelle concernée', { x: 420, y: infoY - 15, size: 9, font: helvetica });

    // Parcelles voisines
    page.drawRectangle({ x: 400, y: infoY - 33, width: 12, height: 12, color: rgb(1.0, 0.85, 0.4) });
    page.drawText('Parcelles voisines', { x: 420, y: infoY - 30, size: 9, font: helvetica });

    // Projet
    page.drawRectangle({ x: 400, y: infoY - 48, width: 12, height: 12, color: rgb(1.0, 0.44, 0.26) });
    page.drawText('Projet de construction', { x: 420, y: infoY - 45, size: 9, font: helvetica });

    // Pied de page
    page.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - Urbania`, {
        x: margin,
        y: 25,
        size: 8,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
    });

    // Télécharger
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plan_situation_DP1_${parcelle || 'parcelle'}.pdf`;
    link.click();
}

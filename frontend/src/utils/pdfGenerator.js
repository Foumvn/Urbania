import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

export async function generateCerfaPDF(data) {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const darkColor = rgb(0, 0.13, 0.58); // Urbania Blue
    const textColor = rgb(0.1, 0.1, 0.1);
    const grayColor = rgb(0.4, 0.4, 0.4);

    let y = height - 50;

    const drawText = (text, x, yPos, options = {}) => {
        page.drawText(text || '', {
            x,
            y: yPos,
            size: options.size || 10,
            font: options.bold ? helveticaBold : helvetica,
            color: options.color || textColor,
        });
    };

    const drawSection = (title, yPos) => {
        page.drawRectangle({
            x: 40,
            y: yPos - 4,
            width: width - 80,
            height: 18,
            color: darkColor,
        });
        drawText(title, 50, yPos, { size: 10, bold: true, color: rgb(1, 1, 1) });
        return yPos - 25;
    };

    const drawField = (label, value, x, yPos) => {
        drawText(label + ' :', x, yPos, { size: 9, color: grayColor });
        drawText(String(value || 'Non renseigné'), x + 120, yPos, { size: 9, bold: true });
        return yPos - 15;
    };

    // Header
    drawText('DÉCLARATION PRÉALABLE', width / 2, y, { size: 18, bold: true, color: darkColor, textAnchor: 'middle' }); // Note: pdf-lib doesn't have textAnchor, manual centering needed
    y -= 25;
    drawText('Cerfa n° 13703*10 - Généré par Urbania IA', 50, y, { size: 8, color: grayColor });
    y -= 30;

    // 1. Identité
    y = drawSection('1. IDENTITÉ DU DÉCLARANT', y);
    const isParticulier = data.typeDeclarant === 'particulier';
    drawText(isParticulier ? '[X] Particulier' : '[ ] Particulier', 50, y, { size: 9 });
    drawText(!isParticulier ? '[X] Personne morale' : '[ ] Personne morale', 180, y, { size: 9 });
    y -= 20;

    if (isParticulier) {
        y = drawField('Nom / Prénom', `${data.nom || ''} ${data.prenom || ''}`, 50, y);
        y = drawField('Né(e) le / Lieu', `${data.dateNaissance || ''} à ${data.lieuNaissance || ''}`, 50, y);
    } else {
        y = drawField('Dénomination', data.denomination, 50, y);
        y = drawField('SIRET', data.siret, 50, y);
        y = drawField('Représentant', `${data.representantNom || ''} ${data.representantPrenom || ''}`, 50, y);
    }
    y -= 10;

    // 2. Coordonnées
    y = drawSection('2. COORDONNÉES ET CONTACT', y);
    y = drawField('Adresse', `${data.numero || ''} ${data.adresse || ''}`, 50, y);
    y = drawField('Commune', `${data.codePostal || ''} ${data.ville || ''}`, 50, y);
    y = drawField('Téléphone / Mail', `${data.telephone || ''} / ${data.email || ''}`, 50, y);
    y -= 10;

    // 3. Terrain
    y = drawSection('3. LE TERRAIN', y);
    y = drawField('Localisation', `${data.terrainCodePostal || ''} ${data.terrainVille || ''}`, 50, y);
    y = drawField('Parcelle', `${data.prefixe || ''} ${data.section || ''} n°${data.numeroParcelle || ''}`, 50, y);
    y = drawField('Surface du terrain', `${data.surfaceTerrain || 0} m²`, 50, y);
    y -= 10;

    // 4. Projet
    y = drawSection('4. LE PROJET', y);
    y = drawField('Type', data.typeTravaux, 50, y);
    const natureStr = (data.natureTravaux || []).map(t => travauxLabels[t] || t).join(', ');
    y = drawField('Nature', natureStr, 50, y);
    y -= 5;

    drawText('Description :', 50, y, { size: 9, color: grayColor });
    y -= 12;
    const desc = data.descriptionProjet || '';
    const lines = desc.match(/.{1,90}(\s|$)/g) || [desc];
    lines.forEach(l => {
        drawText(l.trim(), 60, y, { size: 8 });
        y -= 10;
    });
    y -= 10;

    // 5. Surfaces
    y = drawSection('5. SURFACES CRÉÉES (Plancher / Emprise)', y);
    y = drawField('Surface Plancher existante', data.surfacePlancherExistante || '0', 50, y);
    y = drawField('Surface Plancher créée', data.surfacePlancherCreee || '0', 50, y);
    y = drawField('Emprise au sol créée', data.empriseSolCreee || '0', 50, y);

    // 6. Signature
    y -= 30;
    drawText(`Fait à ${data.lieuDeclaration || data.ville || ''}, le ${new Date().toLocaleDateString('fr-FR')}`, 50, y, { size: 10, bold: true });
    y -= 20;
    drawText('Signature :', 50, y, { size: 9, color: grayColor });

    // --- APPENDING ATTACHED DOCUMENTS ---
    const pieces = data.piecesJointes || {};
    const docsToAdd = Object.entries(pieces).filter(([_, content]) => content);

    for (const [id, content] of docsToAdd) {
        try {
            const pageDoc = pdfDoc.addPage([595.28, 841.89]);
            pageDoc.drawRectangle({ x: 0, y: 841.89 - 40, width: 595.28, height: 40, color: darkColor });
            pageDoc.drawText(`PIÈCE JOINTE : ${id.toUpperCase()} - ${id === 'dp1' ? 'PLAN DE SITUATION' : id === 'dp2' ? 'PLAN DE MASSE' : 'DOCUMENT'}`, {
                x: 20,
                y: 815,
                size: 12,
                font: helveticaBold,
                color: rgb(1, 1, 1)
            });

            // Handling base64 images
            if (content.startsWith('data:image/')) {
                const imageBytes = content.split(',')[1];
                let image;
                if (content.includes('png')) {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    image = await pdfDoc.embedJpg(imageBytes);
                }

                const imgDims = image.scaleToFit(500, 700);
                pageDoc.drawImage(image, {
                    x: width / 2 - imgDims.width / 2,
                    y: height / 2 - imgDims.height / 2 - 20,
                    width: imgDims.width,
                    height: imgDims.height,
                });
            } else if (content.startsWith('data:application/pdf')) {
                // For PDF, we'd need another library or complex embedding. Skip for now or show text.
                pageDoc.drawText("Document PDF attaché (Voir fichier séparé si nécessaire)", { x: 50, y: 400, size: 12 });
            }
        } catch (err) {
            console.error(`Error embedding doc ${id}:`, err);
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOSSIER_URBANIA_${data.nom || 'DECLARANT'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return pdfBytes;
}

export default generateCerfaPDF;

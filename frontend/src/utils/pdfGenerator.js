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
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Create first page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    const primaryColor = rgb(0, 0.2, 0.4); // #003366 (Official CERFA blue)
    const darkColor = rgb(0, 0.2, 0.4);
    const textColor = rgb(0.1, 0.1, 0.1);
    const grayColor = rgb(0.4, 0.4, 0.4);

    let y = height - 50;

    // Helper functions
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
        drawText(value || '_____________', x + 100, yPos, { size: 9, bold: true });
        return yPos - 15;
    };

    // Header
    drawText('N° 16702*01', width - 80, y + 20, { size: 7, bold: true });

    drawText('DÉCLARATION PRÉALABLE', width / 2 - 80, y, { size: 16, bold: true, color: darkColor });
    y -= 18;

    drawText('Constructions et travaux non soumis à permis de construire', width / 2 - 130, y, { size: 10, bold: true, color: textColor });
    y -= 15;

    drawText('Ce document est émis par le ministère en charge de l\'urbanisme', width / 2 - 120, y, { size: 7, color: grayColor });
    y -= 30;

    // Section 1: Identité du déclarant
    y = drawSection('1. IDENTITÉ DU DÉCLARANT', y);

    const isParticulier = data.typeDeclarant === 'particulier';
    drawText(isParticulier ? '☑ Particulier' : '☐ Particulier', 50, y, { size: 9 });
    drawText(!isParticulier ? '☑ Personne morale' : '☐ Personne morale', 150, y, { size: 9 });
    y -= 20;

    if (isParticulier) {
        y = drawField('Civilité', data.civilite, 50, y);
        y = drawField('Nom', data.nom, 50, y);
        y = drawField('Prénom', data.prenom, 50, y);
        y = drawField('Né(e) le', data.dateNaissance, 50, y);
        y = drawField('À', data.lieuNaissance, 50, y);
    } else {
        y = drawField('Dénomination', data.denomination, 50, y);
        y = drawField('SIRET', data.siret, 50, y);
        y = drawField('Type', data.typeSociete, 50, y);
        y = drawField('Représentant', `${data.representantPrenom || ''} ${data.representantNom || ''}`, 50, y);
        y = drawField('Qualité', data.representantQualite, 50, y);
    }
    y -= 10;

    // Section 2: Coordonnées
    y = drawSection('2. COORDONNÉES DU DÉCLARANT', y);
    y = drawField('Adresse', data.adresse, 50, y);
    if (data.complementAdresse) {
        y = drawField('Complément', data.complementAdresse, 50, y);
    }
    y = drawField('Code postal', data.codePostal, 50, y);
    y = drawField('Ville', data.ville, 50, y);
    y = drawField('Téléphone', data.telephone, 50, y);
    y = drawField('Email', data.email, 50, y);
    y -= 10;

    // Section 3: Terrain
    y = drawSection('3. TERRAIN CONCERNÉ PAR LE PROJET', y);
    y = drawField('Adresse', data.terrainAdresse, 50, y);
    y = drawField('Code postal', data.terrainCodePostal, 50, y);
    y = drawField('Ville', data.terrainVille, 50, y);
    y = drawField('Réf. cadastrale', `${data.prefixe || ''}${data.section || ''} ${data.numeroParcelle || ''}`, 50, y);
    y = drawField('Surface terrain', data.surfaceTerrain ? `${data.surfaceTerrain} m²` : '', 50, y);
    y -= 10;

    // Check if we need a new page
    if (y < 300) {
        const page2 = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
    }

    // Section 4: Nature des travaux
    y = drawSection('4. NATURE DES TRAVAUX', y);
    y = drawField('Type de travaux', data.typeTravaux, 50, y);

    const natureLabels = (data.natureTravaux || []).map(t => travauxLabels[t] || t).join(', ');
    drawText('Nature des travaux :', 50, y, { size: 9, color: grayColor });
    y -= 15;
    drawText(natureLabels || 'Non spécifié', 50, y, { size: 9, bold: true });
    y -= 20;

    // Section 5: Description
    y = drawSection('5. DESCRIPTION DU PROJET', y);

    // Wrap description text
    const desc = data.descriptionProjet || 'Aucune description fournie';
    const maxWidth = width - 100;
    const words = desc.split(' ');
    let line = '';

    for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = helvetica.widthOfTextAtSize(testLine, 9);
        if (textWidth > maxWidth && line !== '') {
            drawText(line.trim(), 50, y, { size: 9 });
            y -= 12;
            line = word + ' ';
        } else {
            line = testLine;
        }
    }
    if (line.trim()) {
        drawText(line.trim(), 50, y, { size: 9 });
        y -= 15;
    }

    y = drawField('Couleur façades', data.couleurFacade, 50, y);
    y = drawField('Couleur toiture', data.couleurToiture, 50, y);
    y = drawField('Matériau façades', data.materiauFacade, 50, y);
    y = drawField('Matériau toiture', data.materiauToiture, 50, y);
    y = drawField('Hauteur', data.hauteurConstruction ? `${data.hauteurConstruction} m` : '', 50, y);
    y -= 10;

    // Section 6: Surfaces
    y = drawSection('6. SURFACES', y);
    drawText('Surface de plancher (m²)', 50, y, { size: 9, bold: true, color: grayColor });
    y -= 15;
    y = drawField('Existante', data.surfacePlancherExistante || '0', 50, y);
    y = drawField('Créée', data.surfacePlancherCreee || '0', 50, y);
    y = drawField('Totale', data.surfacePlancherTotale || '0', 50, y);
    y -= 5;

    drawText('Emprise au sol (m²)', 50, y, { size: 9, bold: true, color: grayColor });
    y -= 15;
    y = drawField('Existante', data.empriseSolExistante || '0', 50, y);
    y = drawField('Créée', data.empriseSolCreee || '0', 50, y);
    y = drawField('Totale', data.empriseSolTotale || '0', 50, y);
    y -= 10;

    // Section 7: Signature
    y = drawSection('7. ENGAGEMENT ET SIGNATURE', y);

    drawText('☑ Je certifie l\'exactitude des renseignements fournis', 50, y, { size: 9 });
    y -= 15;
    drawText('☑ Je m\'engage à respecter les règles d\'urbanisme applicables', 50, y, { size: 9 });
    y -= 25;

    y = drawField('Fait à', data.lieuDeclaration, 50, y);
    y = drawField('Le', data.dateDeclaration, 50, y);
    y -= 20;

    drawText('Signature du déclarant :', 50, y, { size: 9, color: grayColor });
    y -= 10;

    // Signature box
    page.drawRectangle({
        x: 50,
        y: y - 50,
        width: 200,
        height: 50,
        borderColor: grayColor,
        borderWidth: 1,
    });

    // Footer
    page.drawText('Document généré par Urbania CERFA Builder', 50, 30, {
        size: 8,
        font: helvetica,
        color: grayColor,
    });

    page.drawText(`Page 1/1`, width - 80, 30, {
        size: 8,
        font: helvetica,
        color: grayColor,
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Create download link
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `CERFA_13703_${data.nom || 'declaration'}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return pdfBytes;
}

export default generateCerfaPDF;

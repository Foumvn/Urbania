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

const COLORS = {
    darkBlue: rgb(0, 0.2, 0.4),
    lightGray: rgb(0.94, 0.94, 0.94),
    mediumGray: rgb(0.8, 0.8, 0.8),
    text: rgb(0.1, 0.1, 0.1),
    white: rgb(1, 1, 1),
    border: rgb(0.3, 0.3, 0.3),
};

export async function generateCerfaPDF(data) {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const PAGE_WIDTH = 595.28; // A4
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 40;

    // --- HELPER FUNCTIONS ---
    const drawText = (page, text, x, y, size = 9, font = helvetica, color = COLORS.text) => {
        const cleanText = String(text || '')
            .replace(/→/g, '->')
            .replace(/–/g, '-')
            .replace(/…/g, '...')
            .replace(/’/g, "'")
            .replace(/[^\x00-\xFF]/g, (c) => c); // Keep valid chars

        try {
            page.drawText(cleanText, { x, y, size, font, color });
        } catch (e) {
            const asciiText = cleanText.replace(/[^\x00-\x7F]/g, '');
            page.drawText(asciiText, { x, y, size, font, color });
        }
    };

    const drawSectionTitle = (page, title, y) => {
        page.drawRectangle({
            x: MARGIN - 5,
            y: y - 5,
            width: PAGE_WIDTH - 2 * MARGIN + 10,
            height: 18,
            color: COLORS.darkBlue,
        });
        drawText(page, title.toUpperCase(), MARGIN, y, 10, helveticaBold, COLORS.white);
        return y - 25;
    };

    const drawField = (page, label, value, x, y, width = 200) => {
        drawText(page, label + ' :', x, y, 8, helvetica, rgb(0.4, 0.4, 0.4));
        const val = String(value || '');
        drawText(page, val, x + 5, y - 12, 10, helveticaBold, COLORS.text);
        page.drawLine({
            start: { x: x + 5, y: y - 14 },
            end: { x: x + width, y: y - 14 },
            thickness: 0.5,
            color: COLORS.mediumGray,
        });
        return y - 25;
    };

    const drawCheckbox = (page, label, checked, x, y) => {
        page.drawRectangle({
            x,
            y: y - 2,
            width: 10,
            height: 10,
            borderColor: COLORS.text,
            borderWidth: 1,
        });
        if (checked) {
            drawText(page, 'X', x + 1.5, y - 1, 9, helveticaBold);
        }
        drawText(page, label, x + 15, y, 9);
    };

    // --- PAGINATION HELPER ---
    let pageCount = 0;
    const addNewPage = () => {
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        pageCount++;
        // Pagination (calculée à la fin ou placeholder ici si on connait le total, mais on simplifie en 1/N à la fin ou juste N)
        // Pour l'instant on stocke les pages pour dessiner les numéros à la fin si besoin,
        // ou on dessine direct "Page X" en haut à droite
        return page;
    };

    // --- LOAD LOGO ---
    let logoImage = null;
    try {
        const logoBytes = await fetch('/images.png').then(res => res.arrayBuffer());
        logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) { }

    const drawLogoAndHeader = (page, isFirstPage = false) => {
        if (logoImage) {
            const logoDims = logoImage.scaleToFit(50, 50);
            page.drawImage(logoImage, {
                x: MARGIN,
                y: PAGE_HEIGHT - MARGIN + 5,
                width: logoDims.width,
                height: logoDims.height,
            });
        }

        // Draw Pagination Placeholder (will be filled later or we just track pages)
        // Here we just put it top right
        // drawText(page, `Page ${pdfDoc.getPageCount()}`, PAGE_WIDTH - MARGIN - 40, PAGE_HEIGHT - 30, 8, helveticaItalic, COLORS.mediumGray);
    };

    // --- PAGE 1: RÉCÉPISSÉ ---
    const page1 = addNewPage();
    drawLogoAndHeader(page1, true);

    let currentY = PAGE_HEIGHT - MARGIN;
    const title1 = "Récépissé de dépôt d'une déclaration préalable*";
    const title1Width = helveticaBold.widthOfTextAtSize(title1, 14);
    drawText(page1, title1, (PAGE_WIDTH - title1Width) / 2, currentY, 14, helveticaBold);

    currentY -= 40;

    // Legal text (Left Column)
    const leftColX = MARGIN;
    const rightColX = PAGE_WIDTH / 2 + 10;

    const legalLines = [
        "Vous avez déposé une déclaration préalable pour des travaux ou des constructions non soumis à permis.",
        "Le délai d'instruction de votre dossier est d'UN MOIS et, si vous ne recevez pas de réponse de",
        "l'administration dans ce délai, vous bénéficierez d'une décision de non-opposition à ces travaux.",
        "",
        "-> Toutefois, dans le mois qui suit le dépôt de votre dossier, l'administration peut vous contacter :",
        "– soit pour vous avertir qu'un autre délai est applicable.",
        "– soit pour vous indiquer qu'il manque une ou plusieurs pièces à votre dossier."
    ];

    legalLines.forEach((line, i) => {
        drawText(page1, line, leftColX, currentY - (i * 12), 8);
    });

    // Legal text (Right Column)
    const legalLines2 = [
        "La décision de non-opposition n'est définitive qu'en l'absence de recours ou de retrait :",
        "– dans le délai de deux mois à compter de son affichage sur le terrain, sa légalité peut être",
        "contestée par un tiers devant le tribunal administratif.",
        "",
        "– dans le délai de trois mois après la date de la déclaration préalable, l'autorité compétente",
        "peut la retirer. Elle est tenue de vous informer préalablement."
    ];

    legalLines2.forEach((line, i) => {
        drawText(page1, line, rightColX, currentY - (i * 12), 8);
    });

    currentY -= 120;

    // Mairie Box on Page 1
    page1.drawRectangle({
        x: MARGIN,
        y: currentY - 140,
        width: PAGE_WIDTH - 2 * MARGIN,
        height: 140,
        color: COLORS.lightGray,
        borderColor: COLORS.text,
        borderWidth: 1,
    });
    drawText(page1, "CADRE RÉSERVÉ À LA MAIRIE", MARGIN + 10, currentY - 20, 10, helveticaBold);
    drawText(page1, `Dossier déposé par : ${data.nom || ''} ${data.prenom || ''}`, MARGIN + 10, currentY - 45, 9);
    drawText(page1, `Numéro de dossier : _______________________`, MARGIN + 10, currentY - 65, 9);
    drawText(page1, `Date de dépôt : ${new Date().toLocaleDateString('fr-FR')}`, MARGIN + 10, currentY - 85, 9);

    // Stamp box
    page1.drawRectangle({
        x: PAGE_WIDTH - MARGIN - 120,
        y: currentY - 120,
        width: 100,
        height: 60,
        borderColor: COLORS.mediumGray,
        borderWidth: 0.5,
    });
    drawText(page1, "Cachet de la mairie", PAGE_WIDTH - MARGIN - 110, currentY - 80, 7, helveticaItalic);

    // --- PAGE 2: MAIN DATA ---
    const page2 = addNewPage();
    drawLogoAndHeader(page2);

    currentY = PAGE_HEIGHT - MARGIN;

    drawText(page2, 'N° 16702*01', PAGE_WIDTH - MARGIN - 60, currentY, 8, helveticaBold);
    currentY -= 20;

    const mainTitle = "Déclaration préalable";
    const mainTitleWidth = helveticaBold.widthOfTextAtSize(mainTitle, 18);
    drawText(page2, mainTitle, (PAGE_WIDTH - mainTitleWidth) / 2, currentY, 18, helveticaBold);

    currentY -= 25;
    const mainSubtitle = 'Constructions et travaux non soumis à permis de construire';
    const mainSubWidth = helvetica.widthOfTextAtSize(mainSubtitle, 11);
    drawText(page2, mainSubtitle, (PAGE_WIDTH - mainSubWidth) / 2, currentY, 11, helveticaBold);

    currentY -= 40;

    // Section 1: Identité
    currentY = drawSectionTitle(page2, '1 - Identité du déclarant', currentY);
    const isParticulier = data.typeDeclarant === 'particulier';
    drawCheckbox(page2, 'Vous êtes un particulier', isParticulier, MARGIN, currentY);
    drawCheckbox(page2, 'Vous êtes une personne morale', !isParticulier, MARGIN + 200, currentY);
    currentY -= 25;

    // [NOUVEAU] Civilité
    if (isParticulier) {
        drawCheckbox(page2, 'Mme', data.civilite === 'Mme', MARGIN, currentY);
        drawCheckbox(page2, 'M.', data.civilite === 'M.', MARGIN + 60, currentY);
        currentY -= 25;

        currentY = drawField(page2, 'Nom', data.nom, MARGIN, currentY, 250);
        currentY = drawField(page2, 'Prénom', data.prenom, MARGIN, currentY, 250);
        currentY = drawField(page2, 'Date de naissance', data.dateNaissance, MARGIN, currentY, 150);
        drawField(page2, 'Lieu de naissance', data.lieuNaissance, MARGIN + 200, currentY + 25, 200);
    } else {
        currentY = drawField(page2, 'Dénomination', data.denomination, MARGIN, currentY, 400);
        currentY = drawField(page2, 'N° SIRET', data.siret, MARGIN, currentY, 200);
        drawField(page2, 'Représentant', `${data.representantNom || ''} ${data.representantPrenom || ''}`, MARGIN, currentY - 25, 400);
        currentY -= 50;
    }

    currentY -= 10;

    // Section 2: Coordonnées
    currentY = drawSectionTitle(page2, '2 - Coordonnées du déclarant', currentY);
    currentY = drawField(page2, 'Adresse (N°, Voie)', `${data.numero || ''} ${data.adresse || ''}`, MARGIN, currentY, 400); // [MODIFIE] Nom champ
    currentY = drawField(page2, 'Code Postal / Ville', `${data.codePostal || ''} ${data.ville || ''}`, MARGIN, currentY, 400);
    const formatPhone = (p) => {
        if (!p) return '';
        let clean = p.replace(/[\s.-]/g, '');
        if (clean.length === 9) clean = '0' + clean;
        if (clean.length === 10) return clean.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        return p;
    };
    currentY = drawField(page2, 'Téléphone / Email', `${formatPhone(data.telephone) || ''} / ${data.email || ''}`, MARGIN, currentY, 400);

    currentY -= 15;

    // Section 3: Le Terrain
    currentY = drawSectionTitle(page2, '3 - Le terrain', currentY);
    currentY = drawField(page2, 'Localisation du terrain', `${data.terrainNumero || ''} ${data.terrainAdresse || ''} ${data.terrainCodePostal || ''} ${data.terrainVille || ''}`, MARGIN, currentY, 450);

    drawText(page2, 'Références cadastrales :', MARGIN, currentY, 8, helveticaBold);
    currentY -= 15;
    page2.drawRectangle({ x: MARGIN, y: currentY - 30, width: 450, height: 30, color: COLORS.lightGray, borderColor: COLORS.mediumGray, borderWidth: 1 });
    drawText(page2, 'Section', MARGIN + 10, currentY - 10, 7);
    drawText(page2, 'Numéro', MARGIN + 100, currentY - 10, 7);
    drawText(page2, 'Surface cadastrale', MARGIN + 200, currentY - 10, 7);

    drawText(page2, data.section || '-', MARGIN + 10, currentY - 22, 10, helveticaBold);
    drawText(page2, data.numeroParcelle || '-', MARGIN + 100, currentY - 22, 10, helveticaBold);
    drawText(page2, `${data.surfaceTerrain || 0} m²`, MARGIN + 200, currentY - 22, 10, helveticaBold);

    currentY -= 50;

    // Section 4: Le Projet
    // Check if we need a new page
    if (currentY < 200) {
        // Not enough space, move to next page
        // But for typical content, page 2 has space. Let's create page3 anyway for clarity as requested "liberer respiration"
    }

    // --- PAGE 3 ---
    let mainPage = addNewPage();
    drawLogoAndHeader(mainPage);
    currentY = PAGE_HEIGHT - MARGIN - 40;

    currentY = drawSectionTitle(mainPage, '4 - Le projet', currentY);
    const natureStr = (data.natureTravaux || []).map(n => travauxLabels[n] || n).join(', ');
    currentY = drawField(mainPage, 'Nature des travaux', natureStr, MARGIN, currentY, 450);

    drawText(mainPage, 'Description :', MARGIN, currentY, 8, helvetica);
    currentY -= 12;
    const desc = data.descriptionProjet || '';
    const descLines = desc.match(/.{1,95}(\s|$)/g) || [desc];
    descLines.slice(0, 5).forEach(line => {
        drawText(mainPage, line.trim(), MARGIN + 5, currentY, 9, helveticaBold);
        currentY -= 12;
    });

    currentY -= 15;

    // [NOUVEAU] Détails Complémentaires (IA)
    const specificQuestions = data.aiProjectConfig?.specificQuestions;
    if (specificQuestions && specificQuestions.length > 0) {
        drawText(mainPage, 'Détails complémentaires (Précisions techniques) :', MARGIN, currentY, 8, helveticaBold);
        currentY -= 15;
        specificQuestions.forEach(q => {
            const val = data[q.field];
            if (val !== undefined && val !== null && val !== '') {
                let displayVal = val;
                if (val === true || val === 'oui') displayVal = 'Oui';
                else if (val === false || val === 'non') displayVal = 'Non';

                // Pagination check
                if (currentY < 60) {
                    mainPage = addNewPage();
                    drawLogoAndHeader(mainPage);
                    currentY = PAGE_HEIGHT - MARGIN - 40;
                }

                drawText(mainPage, `• ${q.label} : ${displayVal}`, MARGIN + 10, currentY, 9);
                currentY -= 12;
            }
        });
        currentY -= 10;
    }

    // Matériaux et Couleurs
    if (currentY < 100) {
        mainPage = addNewPage();
        drawLogoAndHeader(mainPage);
        currentY = PAGE_HEIGHT - MARGIN - 40;
    }

    drawText(mainPage, 'Matériaux et Couleurs :', MARGIN, currentY, 8, helveticaBold);
    currentY -= 15;
    drawText(mainPage, `Façade : ${data.materiauFacade || '-'} (${data.couleurFacade || '-'})`, MARGIN + 10, currentY, 8);
    drawText(mainPage, `Toiture : ${data.materiauToiture || '-'} (${data.couleurToiture || '-'})`, MARGIN + 250, currentY, 8);
    currentY -= 15;
    drawText(mainPage, `Hauteur construction : ${data.hauteurConstruction || '-'} m`, MARGIN + 10, currentY, 8);
    currentY -= 25;

    // Section 5: Surfaces - [NOUVEAU] Tableau complet
    if (currentY < 200) {
        mainPage = addNewPage();
        drawLogoAndHeader(mainPage);
        currentY = PAGE_HEIGHT - MARGIN - 40;
    }

    currentY = drawSectionTitle(mainPage, '5 - Surfaces et Stationnement', currentY);

    const tableCols = [MARGIN + 10, MARGIN + 150, MARGIN + 250, MARGIN + 350, MARGIN + 430];
    const drawRow = (y, l, v1, v2, v3, v4) => {
        drawText(mainPage, l, MARGIN + 10, y, 8, helveticaBold);
        drawText(mainPage, String(v1 || '-'), tableCols[1], y, 8);
        drawText(mainPage, String(v2 || '-'), tableCols[2], y, 8);
        drawText(mainPage, String(v3 || '-'), tableCols[3], y, 8);
        drawText(mainPage, String(v4 || '-'), tableCols[4], y, 8);
    };

    // Header Row
    drawText(mainPage, "DESTINATIONS", tableCols[0], currentY, 7, helveticaBold);
    drawText(mainPage, "EXISTANT", tableCols[1], currentY, 7, helveticaBold);
    drawText(mainPage, "CRÉÉ", tableCols[2], currentY, 7, helveticaBold);
    drawText(mainPage, "SUPPRIMÉ", tableCols[3], currentY, 7, helveticaBold);
    drawText(mainPage, "TOTAL", tableCols[4], currentY, 7, helveticaBold);
    currentY -= 15;

    // 1. Habitation
    drawRow(currentY, "1. Habitation", data.surfaceLogementExistante, data.surfaceLogementCreee, data.surfaceLogementSupprimee, data.surfaceLogementTotal);
    currentY -= 15;
    // 2. Annexes
    drawRow(currentY, "2. Annexes", data.surfaceAnnexeExistante, data.surfaceAnnexeCreee, data.surfaceAnnexeSupprimee, data.surfaceAnnexeTotal);
    currentY -= 25;

    // 3. Emprise au sol
    drawText(mainPage, '3. Emprise au sol totale (m²)', MARGIN + 10, currentY, 8, helveticaBold);
    currentY -= 15;
    drawText(mainPage, `Existante : ${data.empriseSolExistante || '-'}`, MARGIN + 20, currentY, 8);
    drawText(mainPage, `Créée : ${data.empriseSolCreee || '-'}`, MARGIN + 150, currentY, 8);
    drawText(mainPage, `Totale après projet : ${data.empriseSolTotale || '-'}`, MARGIN + 280, currentY, 8, helveticaBold);
    currentY -= 25;

    // 4. Stationnement
    drawText(mainPage, '4. Stationnement', MARGIN + 10, currentY, 8, helveticaBold);
    currentY -= 15;
    drawText(mainPage, `Places avant projet : ${data.placesAvant || '-'}`, MARGIN + 20, currentY, 8);
    drawText(mainPage, `Places après projet : ${data.placesApres || '-'}`, MARGIN + 200, currentY, 8);

    currentY -= 30;

    // Section 6 - Législation
    if (currentY < 150) {
        mainPage = addNewPage();
        drawLogoAndHeader(mainPage);
        currentY = PAGE_HEIGHT - MARGIN - 40;
    }

    currentY = drawSectionTitle(mainPage, '6 - Cadre Législatif', currentY);
    const legislationItems = [
        { label: 'Terrain en lotissement ?', val: data.lotissement === 'oui' ? 'OUI' : 'NON' },
        { label: 'Site classé ou Patrimonial ?', val: (data.sitePatrimonial || data.siteClasse) ? 'OUI' : 'NON' },
        { label: 'Monument Historique ?', val: data.monumentHistorique ? 'OUI' : 'NON' }
    ];

    legislationItems.forEach(item => {
        drawCheckbox(mainPage, item.label, item.val === 'OUI', MARGIN, currentY);
        currentY -= 15;
    });

    currentY -= 20;

    // Signature Block - Aligné à droite
    const signatureDate = `Fait à ${data.lieuDeclaration || data.ville || ''}, le ${new Date().toLocaleDateString('fr-FR')}`;
    drawText(mainPage, signatureDate, PAGE_WIDTH - MARGIN - 200, currentY, 10, helveticaBold);

    currentY -= 20;

    // Cadre signature à droite
    const boxWidth = 200;
    const boxHeight = 80;
    const boxX = PAGE_WIDTH - MARGIN - boxWidth;
    let boxY = currentY - boxHeight;

    // Check pagination for signature box
    if (boxY < MARGIN) {
        mainPage = addNewPage();
        drawLogoAndHeader(mainPage);
        currentY = PAGE_HEIGHT - MARGIN - 40;
        boxY = currentY - boxHeight;
    }

    drawText(mainPage, 'SIGNATURE DU DÉCLARANT :', boxX, boxY + boxHeight + 5, 8, helveticaBold);


    // Warning: we need to draw on mainPage, not page2 for this dynamic part if it moved
    // Correction: Use mainPage context for the rectangle
    mainPage.drawRectangle({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        borderColor: COLORS.text,
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98)
    });

    if (data.signature) {
        try {
            const sigBytes = data.signature.split(',')[1];
            let sigImg;
            if (data.signature.includes('image/png')) {
                sigImg = await pdfDoc.embedPng(sigBytes);
            } else {
                sigImg = await pdfDoc.embedJpg(sigBytes);
            }
            const sigDims = sigImg.scaleToFit(boxWidth - 20, boxHeight - 20);
            const sigX = boxX + (boxWidth - sigDims.width) / 2;
            const sigY = boxY + (boxHeight - sigDims.height) / 2;
            mainPage.drawImage(sigImg, { x: sigX, y: sigY, width: sigDims.width, height: sigDims.height });
        } catch (e) { }
    } else {
        drawText(mainPage, "(Signez ici)", boxX + boxWidth / 2 - 20, boxY + boxHeight / 2, 8, helveticaItalic, COLORS.mediumGray);
    }

    // --- APPENDING ATTACHED DOCUMENTS ---
    const pieces = data.piecesJointes || {};
    const docsToAdd = Object.entries(pieces).filter(([_, content]) => content);

    for (const [id, content] of docsToAdd) {
        try {
            const pDoc = addNewPage();
            pDoc.drawRectangle({ x: 0, y: PAGE_HEIGHT - 40, width: PAGE_WIDTH, height: 40, color: COLORS.darkBlue });
            pDoc.drawText(`PIÈCE JOINTE : ${id.toUpperCase()} - ${DOC_LABELS[id] || 'ANNEXE'}`, {
                x: MARGIN, y: PAGE_HEIGHT - 25, size: 12, font: helveticaBold, color: COLORS.white
            });
            pDoc.drawText(`Urbania - Dossier de ${data.nom || ''}`, { x: MARGIN, y: 20, size: 8, font: helveticaItalic, color: rgb(0.5, 0.5, 0.5) });

            if (content.startsWith('data:image/')) {
                const imgBytes = content.split(',')[1];
                let img;
                if (content.includes('png')) img = await pdfDoc.embedPng(imgBytes);
                else img = await pdfDoc.embedJpg(imgBytes);

                const dims = img.scaleToFit(500, 700);
                pDoc.drawImage(img, { x: (PAGE_WIDTH - dims.width) / 2, y: (PAGE_HEIGHT - dims.height) / 2, width: dims.width, height: dims.height });
            }
        } catch (e) {
            console.warn(`Error adding attachment ${id}:`, e);
        }
    }

    // --- PAGINATION NUMBERING ---
    // Now that all pages are created, we go back and add the numbers to the right corner
    const totalP = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
        const pageNum = idx + 1;
        drawText(p, `Page ${pageNum} / ${totalP}`, PAGE_WIDTH - MARGIN - 50, 20, 8, helveticaItalic, rgb(0.5, 0.5, 0.5));
    });

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOSSIER_URBANIA_${(data.nom || 'DEMANDEUR').toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return bytes; // Return for testing if needed
}

const DOC_LABELS = {
    dp1: 'PLAN DE SITUATION',
    dp2: 'PLAN DE MASSE',
    dp3: 'PLAN DE COUPE',
    dp4: 'FAÇADES / TOITURE',
    dp5: 'REPRÉSENTATION EXTÉRIEURE',
    dp6: 'INSERTION PAYSAGÈRE',
    dp7: 'PHOTO PROCHE',
    dp8: 'PHOTO LOINTAINE'
};

export default generateCerfaPDF;

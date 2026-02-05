import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface CerfaFormData {
  projectType: string;
  projectDescription: string;
  address: string;
  postalCode: string;
  city: string;
  cadastralReference: string;
  existingSurface: string;
  newSurface: string;
  totalHeight: string;
  groundFootprint: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  codeInsee?: string;
}

// Field positions on CERFA 13703*08 (approximate, based on form structure)
// These would need to be adjusted based on the actual PDF template
const FIELD_MAPPINGS = {
  // Section 1 - Identité du déclarant
  ownerLastName: { page: 0, x: 120, y: 705, maxWidth: 200 },
  ownerFirstName: { page: 0, x: 350, y: 705, maxWidth: 150 },
  
  // Section 2 - Coordonnées
  address: { page: 0, x: 120, y: 635, maxWidth: 350 },
  postalCode: { page: 0, x: 120, y: 610, maxWidth: 60 },
  city: { page: 0, x: 200, y: 610, maxWidth: 200 },
  ownerPhone: { page: 0, x: 120, y: 585, maxWidth: 150 },
  ownerEmail: { page: 0, x: 300, y: 585, maxWidth: 200 },
  
  // Section 3 - Terrain
  terrainAddress: { page: 0, x: 120, y: 490, maxWidth: 350 },
  terrainPostalCode: { page: 0, x: 120, y: 465, maxWidth: 60 },
  terrainCity: { page: 0, x: 200, y: 465, maxWidth: 200 },
  cadastralReference: { page: 0, x: 120, y: 440, maxWidth: 200 },
  
  // Section 4 - Nature du projet
  projectDescription: { page: 0, x: 120, y: 350, maxWidth: 400, maxLines: 3 },
  
  // Section 5 - Surfaces (page 2)
  existingSurface: { page: 1, x: 350, y: 650, maxWidth: 80 },
  newSurface: { page: 1, x: 350, y: 625, maxWidth: 80 },
  totalSurface: { page: 1, x: 350, y: 600, maxWidth: 80 },
  totalHeight: { page: 1, x: 350, y: 550, maxWidth: 80 },
  groundFootprint: { page: 1, x: 350, y: 525, maxWidth: 80 },
};

export async function generateCerfaPDF(formData: CerfaFormData): Promise<Blob> {
  try {
    // Load the CERFA template
    const templateUrl = "/templates/cerfa-13703.pdf";
    const templateBytes = await fetch(templateUrl).then((res) => {
      if (!res.ok) throw new Error("Impossible de charger le template CERFA");
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(templateBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    const fontSize = 10;
    const textColor = rgb(0, 0, 0);

    // Helper function to draw text with proper positioning
    const drawText = (
      text: string,
      mapping: { page: number; x: number; y: number; maxWidth: number; maxLines?: number }
    ) => {
      if (!text || mapping.page >= pages.length) return;
      
      const page = pages[mapping.page];
      const { height } = page.getSize();
      
      // Truncate text if too long
      let displayText = text;
      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      
      if (textWidth > mapping.maxWidth) {
        // Truncate with ellipsis
        while (
          helveticaFont.widthOfTextAtSize(displayText + "...", fontSize) > mapping.maxWidth &&
          displayText.length > 0
        ) {
          displayText = displayText.slice(0, -1);
        }
        displayText += "...";
      }

      page.drawText(displayText, {
        x: mapping.x,
        y: height - mapping.y, // PDF coordinates start from bottom
        size: fontSize,
        font: helveticaFont,
        color: textColor,
      });
    };

    // Fill in the form fields
    
    // Section 1 - Identité
    drawText(formData.ownerLastName.toUpperCase(), FIELD_MAPPINGS.ownerLastName);
    drawText(formData.ownerFirstName, FIELD_MAPPINGS.ownerFirstName);
    
    // Section 2 - Coordonnées du déclarant (same as terrain for owner)
    drawText(formData.address, FIELD_MAPPINGS.address);
    drawText(formData.postalCode, FIELD_MAPPINGS.postalCode);
    drawText(formData.city, FIELD_MAPPINGS.city);
    drawText(formData.ownerPhone, FIELD_MAPPINGS.ownerPhone);
    drawText(formData.ownerEmail, FIELD_MAPPINGS.ownerEmail);
    
    // Section 3 - Terrain
    drawText(formData.address, FIELD_MAPPINGS.terrainAddress);
    drawText(formData.postalCode, FIELD_MAPPINGS.terrainPostalCode);
    drawText(formData.city, FIELD_MAPPINGS.terrainCity);
    drawText(formData.cadastralReference, FIELD_MAPPINGS.cadastralReference);
    
    // Section 4 - Nature du projet
    const projectText = `${formData.projectType} - ${formData.projectDescription}`;
    drawText(projectText, FIELD_MAPPINGS.projectDescription);
    
    // Section 5 - Surfaces (if page 2 exists)
    if (pages.length > 1) {
      drawText(`${formData.existingSurface} m²`, FIELD_MAPPINGS.existingSurface);
      drawText(`${formData.newSurface} m²`, FIELD_MAPPINGS.newSurface);
      
      // Calculate total surface
      const existing = parseFloat(formData.existingSurface) || 0;
      const newSurf = parseFloat(formData.newSurface) || 0;
      drawText(`${existing + newSurf} m²`, FIELD_MAPPINGS.totalSurface);
      
      drawText(`${formData.totalHeight} m`, FIELD_MAPPINGS.totalHeight);
      drawText(`${formData.groundFootprint} m²`, FIELD_MAPPINGS.groundFootprint);
    }

    // Add generation metadata
    const firstPage = pages[0];
    const { width } = firstPage.getSize();
    
    firstPage.drawText(`Généré par Urbania le ${new Date().toLocaleDateString("fr-FR")}`, {
      x: width - 200,
      y: 20,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Erreur lors de la génération du PDF CERFA");
  }
}

export function downloadPDF(blob: Blob, filename?: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `cerfa-dp-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

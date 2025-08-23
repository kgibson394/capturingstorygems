import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import download from 'downloadjs';

interface Story {
  _id: string;
  story_title: string;
  read_time: string;
  genre: string;
  enhanced_story: string;
}

export const createStoryPDF = async (story: Story): Promise<PDFDocument> => {
  const pdfDoc = await PDFDocument.create();
  let page: PDFPage = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const margin = 50;
  const titleSize = 24;
  const textSize = 12;
  const lineHeight = 1.6;

  const fontNormal: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const drawBorder = (p: PDFPage) => {
    const b = 15;
    const specs: Array<[number, number, number, number, ReturnType<typeof rgb>, number]> = [
      [b, b, width - b * 2, height - b * 2, rgb(0.1, 0.1, 0.3), 3],
      [b + 8, b + 8, width - (b + 8) * 2, height - (b + 8) * 2, rgb(0.3, 0.2, 0.5), 1.5],
      [b + 15, b + 15, width - (b + 15) * 2, height - (b + 15) * 2, rgb(0.6, 0.5, 0.7), 0.5],
    ];
    specs.forEach(([x, y, w, h, color, borderWidth]) => {
      p.drawRectangle({ x, y, width: w, height: h, borderColor: color, borderWidth });
    });
  };
  drawBorder(page);

  let y = height - margin;

  y -= 20;
  page.drawText(story.story_title, {
    x: margin,
    y,
    size: titleSize,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.6),
    maxWidth: width - margin * 2,
  });
  y -= titleSize + 10;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.7),
  });
  y -= 20;

  page.drawText('Genre:', {
    x: margin,
    y,
    size: textSize,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(story.genre, {
    x: margin + 45,
    y,
    size: textSize,
    font: fontItalic,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= textSize + 5;

  page.drawText('Read Time:', {
    x: margin,
    y,
    size: textSize,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(story.read_time, {
    x: margin + 65,
    y,
    size: textSize,
    font: fontItalic,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= textSize + 10;

  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.7),
  });
  y -= 40;

  const wrapText = (text: string, maxW: number, size: number, font: PDFFont) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= maxW) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  for (const paragraph of story.enhanced_story.split(/\n\s*\n/).filter((p) => p.trim())) {
    const lines = wrapText(paragraph.trim(), width - margin * 2, textSize, fontNormal);
    for (const ln of lines) {
      if (y < margin) {
        page = pdfDoc.addPage();
        drawBorder(page);
        y = height - margin;
      }
      page.drawText(ln, {
        x: margin,
        y,
        size: textSize,
        font: fontNormal,
        color: rgb(0, 0, 0),
        maxWidth: width - margin * 2,
      });
      y -= textSize * lineHeight;
    }
    y -= textSize * 0.5;
  }

  pdfDoc.getPages().forEach((p, idx) => {
    const num = `${idx + 1}`;
    p.drawText(num, {
      x: (width - fontNormal.widthOfTextAtSize(num, 10)) / 2,
      y: margin / 2,
      size: 10,
      font: fontNormal,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return pdfDoc;
};

export const handleDownload = async (story: Story) => {
  const pdfDoc = await createStoryPDF(story);
  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, `${story.story_title}.pdf`, 'application/pdf');
};

export const handlePrintPDF = async (story: Story) => {
  const pdfDoc = await createStoryPDF(story);
  const pdfBytes = await pdfDoc.save();
  const pdfBytesCopy = new Uint8Array(pdfBytes);
  const blob = new Blob([pdfBytesCopy], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  const printWindow = window.open(blobUrl);

  printWindow?.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  });

  setTimeout(() => {
    printWindow?.focus();
    printWindow?.print();
  }, 1000);
};

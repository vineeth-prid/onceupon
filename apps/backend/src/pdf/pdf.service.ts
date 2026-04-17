import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { readFile, access } from 'fs/promises';
import PDFDocument from 'pdfkit';

// A4 dimensions in points (72 points per inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private availableFonts = new Set<string>();

  async generateStorybook(order: {
    childName: string;
    storyJson: { title: string } | null;
    pages: {
      pageNumber: number;
      text: string;
      imageUrl: string | null;
      layout: string;
    }[];
  }): Promise<Buffer> {
    const title = (order.storyJson as any)?.title || 'Your Storybook';
    const childName = order.childName;
    const pages = order.pages
      .filter((p) => p.layout !== 'chapter-title')
      .sort((a, b) => a.pageNumber - b.pageNumber);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          autoFirstPage: false,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Register custom fonts if available
        await this.registerFonts(doc);

        // ─── Cover Page ───
        doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
        doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#1a0533');

        // Cover background image (dimmed)
        const firstPageWithImage = pages.find((p) => p.imageUrl);
        if (firstPageWithImage?.imageUrl) {
          try {
            const imgBuffer = await this.loadImage(firstPageWithImage.imageUrl);
            doc.save();
            doc.opacity(0.35);
            // Manual center-fill with clip to prevent overflow lines
            const { width: iw, height: ih } = this.getImageDimensions(imgBuffer);
            const cScale = Math.max(A4_WIDTH / iw, A4_HEIGHT / ih);
            const cW = iw * cScale;
            const cH = ih * cScale;
            doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).clip();
            doc.image(imgBuffer, (A4_WIDTH - cW) / 2, (A4_HEIGHT - cH) / 2, { width: cW, height: cH });
            doc.restore();
          } catch { /* solid bg fallback */ }
        }

        // Dark overlay for readability
        doc.save();
        doc.opacity(0.55);
        doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#1a0533');
        doc.restore();

        // Cover content centered
        const coverY = A4_HEIGHT / 2 - 80;

        // "A personalized story for"
        doc.font(this.getFont('accent')).fontSize(16).fillColor('#FFD700')
          .text('A personalized story for', 0, coverY, { align: 'center', width: A4_WIDTH });

        // Child name - large
        doc.font(this.getFont('title')).fontSize(42).fillColor('#FFFFFF')
          .text(childName, 0, coverY + 35, { align: 'center', width: A4_WIDTH });

        // Gold divider
        const divY = coverY + 95;
        doc.save();
        doc.opacity(0.7);
        doc.moveTo(A4_WIDTH / 2 - 50, divY).lineTo(A4_WIDTH / 2 + 50, divY)
          .strokeColor('#FFD700').lineWidth(1.5).stroke();
        doc.restore();

        // Book title
        doc.save();
        doc.opacity(0.9);
        doc.font(this.getFont('body-italic')).fontSize(24).fillColor('#FFFFFF')
          .text(title, 50, divY + 15, { align: 'center', width: A4_WIDTH - 100 });
        doc.restore();

        // Brand footer
        doc.save();
        doc.opacity(0.5);
        doc.font(this.getFont('accent')).fontSize(11).fillColor('#FFD700')
          .text('Once Upon a Time', 0, A4_HEIGHT - 50, { align: 'center', width: A4_WIDTH });
        doc.restore();

        // ─── Story Pages (full-bleed with text overlay like web) ───
        for (const page of pages) {
          doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });

          // Fill page background first (prevents white border artifacts)
          doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#1a0533');

          // Full-bleed image covering entire A4 page
          // Use 'fit' + manual centering instead of 'cover' to avoid overflow-clipping lines
          if (page.imageUrl) {
            try {
              const imgBuffer = await this.loadImage(page.imageUrl);
              // Scale image to fill page without overflow artifacts
              const { width: imgW, height: imgH } = this.getImageDimensions(imgBuffer);
              const scale = Math.max(A4_WIDTH / imgW, A4_HEIGHT / imgH);
              const drawW = imgW * scale;
              const drawH = imgH * scale;
              const drawX = (A4_WIDTH - drawW) / 2;
              const drawY = (A4_HEIGHT - drawH) / 2;
              doc.save();
              // Clip strictly to page bounds to prevent any overflow lines
              doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).clip();
              doc.image(imgBuffer, drawX, drawY, { width: drawW, height: drawH });
              doc.restore();
            } catch (err) {
              this.logger.warn(`Failed to load image for page ${page.pageNumber}: ${(err as Error).message}`);
              doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#2d1b69');
            }
          } else {
            doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#2d1b69');
          }

          // Dark gradient overlay at bottom for text readability
          // Use layered large blocks instead of banded strips to avoid horizontal line artifacts
          const gradientStart = A4_HEIGHT * 0.55;
          const gradientHeight = A4_HEIGHT - gradientStart;

          // Layer 1: subtle base wash from mid-page
          doc.save();
          doc.opacity(0.25);
          doc.rect(0, gradientStart, A4_WIDTH, gradientHeight).fill('#0a0514');
          doc.restore();

          // Layer 2: stronger from 65% down
          doc.save();
          doc.opacity(0.35);
          doc.rect(0, A4_HEIGHT * 0.65, A4_WIDTH, A4_HEIGHT - A4_HEIGHT * 0.65).fill('#0a0514');
          doc.restore();

          // Layer 3: dense from 75% down
          doc.save();
          doc.opacity(0.45);
          doc.rect(0, A4_HEIGHT * 0.75, A4_WIDTH, A4_HEIGHT - A4_HEIGHT * 0.75).fill('#0a0514');
          doc.restore();

          // Layer 4: near-opaque at bottom strip
          doc.save();
          doc.opacity(0.60);
          doc.rect(0, A4_HEIGHT * 0.83, A4_WIDTH, A4_HEIGHT - A4_HEIGHT * 0.83).fill('#0a0514');
          doc.restore();

          // Layer 5: fully opaque base block at very bottom (ensures legible text bg)
          doc.save();
          doc.opacity(0.70);
          doc.rect(0, A4_HEIGHT - 210, A4_WIDTH, 210).fill('#0a0514');
          doc.restore();

          // Story text overlaid at bottom
          const textY = A4_HEIGHT - 180;
          const textMargin = 50;
          const textWidth = A4_WIDTH - textMargin * 2;

          doc.font(this.getFont('body')).fontSize(14).fillColor('#f0ece4')
            .text(page.text, textMargin, textY, {
              align: 'center',
              width: textWidth,
              lineGap: 7,
            });

          // Page number (subtle, bottom-right)
          doc.save();
          doc.opacity(0.3);
          doc.font(this.getFont('body')).fontSize(8).fillColor('#FFFFFF')
            .text(`${page.pageNumber} / ${pages.length}`, 0, A4_HEIGHT - 25, {
              align: 'center',
              width: A4_WIDTH,
            });
          doc.restore();
        }

        // ─── Back Cover ───
        doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
        doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill('#1a0533');

        // Back cover image (very dimmed + blurred effect)
        if (firstPageWithImage?.imageUrl) {
          try {
            const imgBuffer = await this.loadImage(firstPageWithImage.imageUrl);
            doc.save();
            doc.opacity(0.15);
            // Manual center-fill with clip to prevent overflow lines
            const { width: iw, height: ih } = this.getImageDimensions(imgBuffer);
            const cScale = Math.max(A4_WIDTH / iw, A4_HEIGHT / ih);
            const cW = iw * cScale;
            const cH = ih * cScale;
            doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).clip();
            doc.image(imgBuffer, (A4_WIDTH - cW) / 2, (A4_HEIGHT - cH) / 2, { width: cW, height: cH });
            doc.restore();
          } catch { /* solid bg fallback */ }
        }

        // "The End"
        doc.font(this.getFont('accent')).fontSize(32).fillColor('#FFD700')
          .text('The End', 0, A4_HEIGHT / 2 - 40, { align: 'center', width: A4_WIDTH });

        // Gold divider
        doc.save();
        doc.opacity(0.4);
        doc.moveTo(A4_WIDTH / 2 - 30, A4_HEIGHT / 2 + 5)
          .lineTo(A4_WIDTH / 2 + 30, A4_HEIGHT / 2 + 5)
          .strokeColor('#FFD700').lineWidth(1).stroke();
        doc.restore();

        doc.save();
        doc.opacity(0.4);
        doc.font(this.getFont('accent')).fontSize(11).fillColor('#FFD700')
          .text('Made with Once Upon a Time', 0, A4_HEIGHT / 2 + 20, { align: 'center', width: A4_WIDTH });
        doc.restore();

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register custom fonts on each new PDFDocument instance.
   */
  private async registerFonts(doc: PDFKit.PDFDocument): Promise<void> {
    const fontsDir = join(process.cwd(), 'assets', 'fonts');
    this.availableFonts.clear();

    const fontFiles: Record<string, string> = {
      'CrimsonText-Regular': 'CrimsonText-Regular.ttf',
      'CrimsonText-Italic': 'CrimsonText-Italic.ttf',
      'CrimsonText-Bold': 'CrimsonText-Bold.ttf',
      'PlayfairDisplay-Bold': 'PlayfairDisplay-Bold.ttf',
      'DancingScript-Regular': 'DancingScript-Regular.ttf',
    };

    for (const [name, file] of Object.entries(fontFiles)) {
      const fontPath = join(fontsDir, file);
      try {
        await access(fontPath);
        doc.registerFont(name, fontPath);
        this.availableFonts.add(name);
      } catch {
        this.logger.warn(`Font not available: ${name} (${fontPath})`);
      }
    }
  }

  private getFont(type: 'title' | 'body' | 'body-italic' | 'body-bold' | 'accent'): string {
    const fontMap: Record<string, [string, string]> = {
      'title': ['PlayfairDisplay-Bold', 'Helvetica-Bold'],
      'body': ['CrimsonText-Regular', 'Helvetica'],
      'body-italic': ['CrimsonText-Italic', 'Helvetica-Oblique'],
      'body-bold': ['CrimsonText-Bold', 'Helvetica-Bold'],
      'accent': ['DancingScript-Regular', 'Helvetica-Oblique'],
    };
    const [custom, fallback] = fontMap[type];
    return this.availableFonts.has(custom) ? custom : fallback;
  }

  private async loadImage(imageUrl: string): Promise<Buffer> {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      return Buffer.from(await response.arrayBuffer());
    }
    const filePath = imageUrl.startsWith('/uploads/')
      ? join(process.cwd(), imageUrl)
      : imageUrl;
    return readFile(filePath);
  }

  /**
   * Read image width/height from PNG or JPEG buffer headers.
   * Falls back to square assumption (A4 points) if format is unrecognized.
   */
  private getImageDimensions(buf: Buffer): { width: number; height: number } {
    try {
      // PNG: signature 8 bytes, then IHDR chunk (4 len + 4 type + 4 width + 4 height)
      if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        return { width, height };
      }
      // JPEG: find SOF0/SOF2 marker (0xFF 0xC0 or 0xFF 0xC2)
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] === 0xff) {
          const marker = buf[i + 1];
          if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
            const height = buf.readUInt16BE(i + 5);
            const width = buf.readUInt16BE(i + 7);
            return { width, height };
          }
          const segLen = buf.readUInt16BE(i + 2);
          i += 2 + segLen;
        } else {
          i++;
        }
      }
    } catch { /* fall through */ }
    // Fallback: assume square 1024×1024 (PDFKit will scale to fit anyway)
    return { width: 1024, height: 1024 };
  }
}

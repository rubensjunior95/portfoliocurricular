import { Injectable, inject, signal } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Locale, PortfolioContent } from './portfolio.models';
import { PortfolioService } from './portfolio.service';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Gera o PDF do currículo a partir do documento off-screen `.cv-print`,
 * sem o diálogo de impressão do navegador (evita data/URL no rodapé).
 */
@Injectable({ providedIn: 'root' })
export class CvDownloadService {
  private readonly portfolio = inject(PortfolioService);

  /** Conteúdo renderizado no documento de captura (null = idioma da página). */
  readonly printContent = signal<PortfolioContent | null>(null);
  readonly busy = signal(false);

  async download(locale: Locale): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const content = await this.portfolio.awaitLocale(locale);
      this.printContent.set(content);
      await nextFrames();
      await delay(120);
      await this.generatePdf(locale);
    } catch {
      this.printWithoutPageChrome();
    } finally {
      this.printContent.set(null);
      this.busy.set(false);
    }
  }

  private async generatePdf(locale: Locale): Promise<void> {
    const source = document.querySelector<HTMLElement>('.cv-print');
    if (!source) {
      throw new Error('CV print document not found');
    }

    source.classList.add('cv-print-capture');
    try {
      await nextFrames();
      const canvas = await html2canvas(source, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: source.scrollWidth,
        windowHeight: source.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const imgWidth = A4_WIDTH_MM;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const fitsOnePage = imgHeight <= A4_HEIGHT_MM * 1.04;
      if (fitsOnePage) {
        const scale = Math.min(1, A4_HEIGHT_MM / imgHeight);
        const fittedWidth = imgWidth * scale;
        const fittedHeight = imgHeight * scale;
        const offsetX = (A4_WIDTH_MM - fittedWidth) / 2;
        pdf.addImage(imgData, 'PNG', offsetX, 0, fittedWidth, fittedHeight, undefined, 'FAST');
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= A4_HEIGHT_MM;

        while (heightLeft > 1) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= A4_HEIGHT_MM;
        }
      }

      pdf.save(`Rubens-Florentino-CV-${locale}.pdf`);
    } finally {
      source.classList.remove('cv-print-capture');
    }
  }

  private printWithoutPageChrome(): void {
    const previousTitle = document.title;
    document.title = ' ';
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
    window.setTimeout(restore, 2000);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

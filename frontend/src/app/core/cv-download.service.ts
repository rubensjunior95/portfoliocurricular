import { Injectable, inject, signal } from '@angular/core';
import { Locale, PortfolioContent } from './portfolio.models';
import { PortfolioService } from './portfolio.service';

/**
 * Abre a impressão do currículo em texto (Salvar como PDF no diálogo),
 * no idioma escolhido. O layout é uma coluna, preto e branco, para ATS.
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
      this.printContent.set(this.portfolio.contentFor(locale));
      await nextFrames();
      await delay(80);
      this.printTextResume();
    } catch {
      this.printContent.set(null);
      this.busy.set(false);
    }
  }

  private printTextResume(): void {
    const previousTitle = document.title;
    document.title = 'Rubens Florentino Freitas Junior';
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
      this.printContent.set(null);
      this.busy.set(false);
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
    window.setTimeout(restore, 1500);
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

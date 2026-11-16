import { Injectable } from '@angular/core';
import { Locale } from './portfolio.models';

/** Arquivo estático de cada idioma, gerado por `npm run cv:pdf` em `public/`. */
const RESUME_FILE: Record<Locale, string> = {
  'en-US': 'resume-en.pdf',
  'pt-BR': 'resume-pt.pdf',
  'es-ES': 'resume-es.pdf',
};

const DOWNLOAD_SUFFIX: Record<Locale, string> = {
  'en-US': 'EN',
  'pt-BR': 'PT',
  'es-ES': 'ES',
};

/**
 * Links do currículo ATS em PDF (uma coluna, preto e branco, texto selecionável).
 * A URL é fixa e compartilhável (`/resume-en.pdf`); o nome sugerido no download
 * identifica o candidato na pasta do recrutador.
 */
@Injectable({ providedIn: 'root' })
export class CvDownloadService {
  href(locale: Locale): string {
    return `/${RESUME_FILE[locale]}`;
  }

  fileName(locale: Locale): string {
    return `Rubens-Florentino-Freitas-Junior-Resume-${DOWNLOAD_SUFFIX[locale]}.pdf`;
  }
}

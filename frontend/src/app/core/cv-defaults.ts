import { CvCopy, Locale, PortfolioContent } from './portfolio.models';

type CvUiDefaults = {
  downloadCv: string;
  downloadCvAria: string;
  chooseCvLanguage: string;
  downloadPdf: string;
  downloadPdfAria: string;
  linkedinDisplay: string;
  siteDisplay: string;
  cv: CvCopy;
};

const LINKEDIN_DISPLAY = 'linkedin.com/in/rubens-junior-996696193';
const SITE_DISPLAY = 'rubensportifolio.vercel.app';

const CV_DEFAULTS: Record<Locale, CvUiDefaults> = {
  'pt-BR': {
    downloadCv: 'Baixar CV',
    downloadCvAria: 'Baixar Curriculum Vitae — escolher idioma',
    chooseCvLanguage: 'Idioma do currículo',
    downloadPdf: 'Baixar CV (PDF)',
    downloadPdfAria: 'Baixar Curriculum Vitae — escolher idioma para imprimir',
    linkedinDisplay: LINKEDIN_DISPLAY,
    siteDisplay: SITE_DISPLAY,
    cv: {
      headline: 'Líder de TI · Engenheiro Eletricista · Desenvolvedor Fullstack',
      profileLabel: 'Perfil',
      resultsLabel: 'Resultados em destaque',
      summary:
        'Líder de TI com formação em Ciência da Computação e Engenharia Elétrica, MBA em Data Science (USP-Esalq) e 10+ anos em tecnologia. Experiência em Indústria 4.0 (WEG), implantação de IA, desenvolvimento fullstack e digitalização de processos com impacto financeiro mensurável.',
      emailLabel: 'E-mail',
      phoneLabel: 'Tel',
      locationLabel: 'Local',
      linkedinLabel: 'LinkedIn',
      webLabel: 'Web',
    },
  },
  'en-US': {
    downloadCv: 'Download CV',
    downloadCvAria: 'Download CV — choose language',
    chooseCvLanguage: 'CV language',
    downloadPdf: 'Download CV (PDF)',
    downloadPdfAria: 'Download CV — choose language to print',
    linkedinDisplay: LINKEDIN_DISPLAY,
    siteDisplay: SITE_DISPLAY,
    cv: {
      headline: 'IT Leader · Electrical Engineer · Fullstack Developer',
      profileLabel: 'Profile',
      resultsLabel: 'Key results',
      summary:
        'IT Leader with degrees in Computer Science and Electrical Engineering, an MBA in Data Science (USP-Esalq), and 10+ years in technology. Experience in Industry 4.0 (WEG), AI implementation, fullstack development, and process digitalization with measurable financial impact.',
      emailLabel: 'Email',
      phoneLabel: 'Tel',
      locationLabel: 'Location',
      linkedinLabel: 'LinkedIn',
      webLabel: 'Web',
    },
  },
  'es-ES': {
    downloadCv: 'Descargar CV',
    downloadCvAria: 'Descargar Curriculum Vitae — elegir idioma',
    chooseCvLanguage: 'Idioma del currículum',
    downloadPdf: 'Descargar CV (PDF)',
    downloadPdfAria: 'Descargar Curriculum Vitae — elegir idioma para imprimir',
    linkedinDisplay: LINKEDIN_DISPLAY,
    siteDisplay: SITE_DISPLAY,
    cv: {
      headline: 'Líder de TI · Ingeniero Eléctrico · Desarrollador Fullstack',
      profileLabel: 'Perfil',
      resultsLabel: 'Resultados destacados',
      summary:
        'Líder de TI con formación en Ciencias de la Computación e Ingeniería Eléctrica, MBA en Data Science (USP-Esalq) y más de 10 años en tecnología. Experiencia en Industria 4.0 (WEG), implantación de IA, desarrollo fullstack y digitalización de procesos con impacto financiero mensurable.',
      emailLabel: 'Correo',
      phoneLabel: 'Tel',
      locationLabel: 'Local',
      linkedinLabel: 'LinkedIn',
      webLabel: 'Web',
    },
  },
};

/**
 * Completa campos de CV quando a API ainda não devolveu o JSON novo
 * (instância da Render pode estar com o deploy anterior).
 */
export function hydrateContent(raw: PortfolioContent): PortfolioContent {
  const locale = isLocale(raw.locale) ? raw.locale : 'pt-BR';
  const defaults = CV_DEFAULTS[locale];
  return {
    ...raw,
    locale,
    profile: {
      ...raw.profile,
      linkedinDisplay: raw.profile.linkedinDisplay ?? defaults.linkedinDisplay,
      siteDisplay: raw.profile.siteDisplay ?? defaults.siteDisplay,
    },
    nav: {
      ...raw.nav,
      downloadCv: raw.nav.downloadCv ?? defaults.downloadCv,
      downloadCvAria: raw.nav.downloadCvAria ?? defaults.downloadCvAria,
      chooseCvLanguage: raw.nav.chooseCvLanguage ?? defaults.chooseCvLanguage,
    },
    contact: {
      ...raw.contact,
      downloadPdf: raw.contact.downloadPdf ?? defaults.downloadPdf,
      downloadPdfAria: raw.contact.downloadPdfAria ?? defaults.downloadPdfAria,
    },
    cv: {
      ...defaults.cv,
      ...raw.cv,
    },
  };
}

function isLocale(value: string): value is Locale {
  return value === 'pt-BR' || value === 'en-US' || value === 'es-ES';
}

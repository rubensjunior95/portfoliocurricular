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
const SITE_DISPLAY = 'portfoliocurricular.vercel.app';

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
      headline: 'Fundador da Kodeskill · Engenheiro Eletricista · Desenvolvedor Fullstack',
      profileLabel: 'Perfil',
      resultsLabel: 'Resultados em destaque',
      summary:
        'Fundador da Kodeskill, software house própria em Americana desde 03/2025. Levo facilidades a empresas, empresários e usuários. A trajetória em Indústria 4.0 (WEG), liderança de TI na Legacy Eco Group e nas demais empresas formou o repertório que uso para gerar mais resultado e uma experiência melhor para os clientes da Kodeskill.',
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
      headline: 'Founder of Kodeskill · Electrical Engineer · Fullstack Developer',
      profileLabel: 'Profile',
      resultsLabel: 'Key results',
      summary:
        'Founder of Kodeskill, my own software house in Americana since 03/2025. I bring useful solutions to companies, entrepreneurs and users. Industry 4.0 at WEG, IT leadership at Legacy Eco Group and the other roles built the repertoire I use to deliver better results and a better experience to Kodeskill clients.',
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
      headline: 'Fundador de Kodeskill · Ingeniero Eléctrico · Desarrollador Fullstack',
      profileLabel: 'Perfil',
      resultsLabel: 'Resultados destacados',
      summary:
        'Fundador de Kodeskill, software house propia en Americana desde 03/2025. Llevo facilidades a empresas, empresarios y usuarios. La trayectoria en Industria 4.0 (WEG), el liderazgo de TI en Legacy Eco Group y las demás empresas formaron el repertorio que uso para generar más resultado y una mejor experiencia a los clientes de Kodeskill.',
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

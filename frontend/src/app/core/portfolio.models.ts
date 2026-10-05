export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

export interface Profile {
  firstNames: string;
  surname: string;
  fullName: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string;
  linkedin: string;
  linkedinHandle: string;
  linkedinDisplay: string;
  siteDisplay: string;
}

export interface Nav {
  about: string;
  services: string;
  experience: string;
  impact: string;
  education: string;
  contact: string;
  home: string;
  talk: string;
  language: string;
  downloadCv: string;
  downloadCvAria: string;
  chooseCvLanguage: string;
  openMenu: string;
}

export interface Hero {
  location: string;
  role: string;
  subtitle: string;
  ai: string;
  connector: string;
  industry: string;
  proof: string;
  ctaTalk: string;
  ctaServices: string;
  stats: { k: string; v: string }[];
  photoAlt: string;
}

export interface About {
  eyebrow: string;
  title: string;
  bodyBefore: string;
  cs: string;
  and: string;
  ee: string;
  bodyAfter: string;
}

export interface ServicesSection {
  eyebrow: string;
  title: string;
  lead: string;
  seeFullPage: string;
  items: { title: string; description: string }[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  paragraphs: string[];
  featuredHighlight?: string;
  highlights?: string[];
}

export interface Experience {
  eyebrow: string;
  title: string;
  items: ExperienceItem[];
}

export interface Impact {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: {
    company: string;
    title: string;
    metric: string;
    metricNote: string;
    description: string;
  }[];
}

export interface Education {
  eyebrow: string;
  title: string;
  skillsEyebrow: string;
  skillsTitle: string;
  languagesLabel: string;
  languages: { name: string; level: string }[];
  coursesLabel: string;
  courses: {
    title: string;
    school: string;
    period: string;
    parts?: { title: string; period: string }[];
  }[];
  items: { title: string; school: string; period: string }[];
  skillGroups: { title: string; skills: string[] }[];
}

export interface Contact {
  eyebrow: string;
  title: string;
  body: string;
  email: string;
  location: string;
  locationValue: string;
  whatsappCta: string;
  downloadPdf: string;
  downloadPdfAria: string;
  qrHint: string;
  qrAlt: string;
}

export interface CvCopy {
  headline: string;
  profileLabel: string;
  resultsLabel: string;
  summary: string;
  emailLabel: string;
  phoneLabel: string;
  locationLabel: string;
  linkedinLabel: string;
  webLabel: string;
}

export interface ServicesPage {
  back: string;
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  intro: string;
  ctaTitle: string;
  ctaBody: string;
  otherContacts: string;
  items: { title: string; description: string; bullets: string[] }[];
}

export interface PortfolioContent {
  locale: Locale;
  profile: Profile;
  meta: {
    homeTitle: string;
    homeDescription: string;
    servicesTitle: string;
    servicesDescription: string;
  };
  nav: Nav;
  hero: Hero;
  about: About;
  servicesSection: ServicesSection;
  experience: Experience;
  impact: Impact;
  education: Education;
  contact: Contact;
  cv: CvCopy;
  whatsapp: { floatingAria: string; plainMsg: string };
  footer: { rights: string };
  servicesPage: ServicesPage;
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import enUS from '../../content/en-US.json';
import esES from '../../content/es-ES.json';
import ptBR from '../../content/pt-BR.json';
import { Locale, PortfolioContent } from './portfolio.models';

export type Page = 'home' | 'services';

export const SITE_URL = 'https://portfoliocurricular.vercel.app';

const LOCALES: Locale[] = ['en-US', 'pt-BR', 'es-ES'];

const CONTENT: Record<Locale, PortfolioContent> = {
  'en-US': enUS as unknown as PortfolioContent,
  'pt-BR': ptBR as unknown as PortfolioContent,
  'es-ES': esES as unknown as PortfolioContent,
};

const PREFIX: Record<Locale, string> = {
  'en-US': '',
  'pt-BR': '/pt',
  'es-ES': '/es',
};

/** Só o idioma, sem região: o conteúdo vale para toda a América Latina, a Europa e os EUA. */
const HREFLANG: Record<Locale, string> = {
  'en-US': 'en',
  'pt-BR': 'pt',
  'es-ES': 'es',
};

const OG_LOCALE: Record<Locale, string> = {
  'en-US': 'en_US',
  'pt-BR': 'pt_BR',
  'es-ES': 'es_ES',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'es-ES': 'ES',
};

export const LOCALE_NATIVE: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'es-ES': 'Español',
};

/**
 * Idioma ativo + conteúdo embutido no build. A URL define o idioma
 * (`/`, `/pt`, `/es`), o que permite pré-renderizar cada versão.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly locales = LOCALES;
  readonly locale = signal<Locale>('en-US');
  readonly page = signal<Page>('home');
  readonly content = computed(() => CONTENT[this.locale()]);
  readonly homePath = computed(() => PREFIX[this.locale()] || '/');
  readonly servicesPath = computed(() => `${PREFIX[this.locale()]}/services`);

  readonly whatsappHref = computed(() => {
    const c = this.content();
    return `https://wa.me/${c.profile.whatsappNumber}?text=${encodeURIComponent(c.whatsapp.plainMsg)}`;
  });

  readonly qrSrc = computed(() => {
    const href = this.whatsappHref();
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(href)}`;
  });

  pathFor(locale: Locale, page: Page = this.page()): string {
    const prefix = PREFIX[locale];
    if (page === 'services') return `${prefix}/services`;
    return prefix || '/';
  }

  applyRouteLocale(locale: Locale, page: Page): void {
    this.locale.set(locale);
    this.page.set(page);
    this.document.documentElement.lang = locale;
    this.applyMeta(locale, page);
  }

  contentFor(locale: Locale): PortfolioContent {
    return CONTENT[locale];
  }

  private applyMeta(locale: Locale, page: Page): void {
    const c = CONTENT[locale];
    const title = page === 'services' ? c.meta.servicesTitle : c.meta.homeTitle;
    const description = page === 'services' ? c.meta.servicesDescription : c.meta.homeDescription;
    const url = SITE_URL + this.pathFor(locale, page);
    const image = `${SITE_URL}/og-image.png`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: page === 'services' ? 'website' : 'profile' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: c.meta.ogImageAlt });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[locale] });
    this.meta.getTags("property='og:locale:alternate'").forEach((tag) => this.meta.removeTagElement(tag));
    this.meta.addTags(
      LOCALES.filter((alt) => alt !== locale).map((alt) => ({ property: 'og:locale:alternate', content: OG_LOCALE[alt] })),
    );
    this.meta.updateTag({ property: 'og:site_name', content: c.profile.fullName });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: c.meta.ogImageAlt });

    this.setLink('canonical', url);
    for (const alt of LOCALES) {
      this.setLink('alternate', SITE_URL + this.pathFor(alt, page), HREFLANG[alt]);
    }
    this.setLink('alternate', SITE_URL + this.pathFor('en-US', page), 'x-default');
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) link.setAttribute('hreflang', hreflang);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}

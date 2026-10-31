import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { hydrateContent } from './cv-defaults';
import { Locale, PortfolioContent } from './portfolio.models';

const STORAGE_KEY = 'portfolio.locale';
const LOCALES: Locale[] = ['pt-BR', 'en-US', 'es-ES'];

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
 * Estado central do portfólio: idioma selecionado + conteúdo carregado da API
 * Spring Boot (Render). Cache por idioma para trocas instantâneas.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<Locale, PortfolioContent>();

  readonly locales = LOCALES;
  readonly locale = signal<Locale>(this.initialLocale());
  readonly content = signal<PortfolioContent | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<boolean>(false);

  readonly whatsappHref = computed(() => {
    const c = this.content();
    if (!c) return '#';
    return `https://wa.me/${c.profile.whatsappNumber}?text=${encodeURIComponent(c.whatsapp.plainMsg)}`;
  });

  readonly qrSrc = computed(() => {
    const href = this.whatsappHref();
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(href)}`;
  });

  constructor() {
    effect(
      () => {
        const locale = this.locale();
        try {
          localStorage.setItem(STORAGE_KEY, locale);
        } catch {
          /* storage indisponível — segue sem persistir */
        }
        document.documentElement.lang = locale;
        this.fetch(locale);
      },
      { allowSignalWrites: true },
    );
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  retry(): void {
    this.fetch(this.locale());
  }

  awaitLocale(locale: Locale): Promise<PortfolioContent> {
    const cached = this.cache.get(locale);
    if (cached) return Promise.resolve(cached);
    return firstValueFrom(
      this.http.get<PortfolioContent>(`${environment.apiBaseUrl}/api/portfolio/${locale}`).pipe(
        map((data) => {
          const hydrated = hydrateContent(data);
          this.cache.set(locale, hydrated);
          return hydrated;
        }),
      ),
    );
  }

  private fetch(locale: Locale): void {
    const cached = this.cache.get(locale);
    if (cached) {
      this.content.set(cached);
      this.loading.set(false);
      this.error.set(false);
      this.applyMeta(cached);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.http.get<PortfolioContent>(`${environment.apiBaseUrl}/api/portfolio/${locale}`).subscribe({
      next: (data) => {
        const hydrated = hydrateContent(data);
        this.cache.set(locale, hydrated);
        this.content.set(hydrated);
        this.loading.set(false);
        this.applyMeta(hydrated);
        this.prefetchOthers(locale);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private prefetchOthers(current: Locale): void {
    for (const locale of LOCALES) {
      if (locale === current || this.cache.has(locale)) continue;
      this.http.get<PortfolioContent>(`${environment.apiBaseUrl}/api/portfolio/${locale}`).subscribe({
        next: (data) => this.cache.set(locale, hydrateContent(data)),
        error: () => {
          /* prefetch opcional — o download busca de novo se precisar */
        },
      });
    }
  }

  private initialLocale(): Locale {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LOCALES.includes(saved)) return saved;
    } catch {
      /* ignore */
    }
    return 'en-US';
  }

  private applyMeta(content: PortfolioContent): void {
    document.title = content.meta.homeTitle;
    const url = 'https://portfoliocurricular.vercel.app/';
    this.upsertMeta('description', content.meta.homeDescription);
    this.upsertMeta('og:title', content.meta.homeTitle, true);
    this.upsertMeta('og:description', content.meta.homeDescription, true);
    this.upsertMeta('og:type', 'website', true);
    this.upsertMeta('og:url', url, true);
    this.upsertMeta('twitter:card', 'summary');
    this.upsertMeta('twitter:title', content.meta.homeTitle);
    this.upsertMeta('twitter:description', content.meta.homeDescription);
  }

  private upsertMeta(name: string, content: string, property = false): void {
    const attr = property ? 'property' : 'name';
    let el = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
}

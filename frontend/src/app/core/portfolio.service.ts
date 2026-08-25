import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Locale, PortfolioContent } from './portfolio.models';

const STORAGE_KEY = 'portfolio.locale';
const LOCALES: Locale[] = ['pt-BR', 'en-US', 'es-ES'];

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'es-ES': 'ES',
};

/**
 * Estado central do portfólio: idioma selecionado + conteúdo carregado da API
 * Spring Boot (Koyeb). Cache por idioma para trocas instantâneas.
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

  private fetch(locale: Locale): void {
    const cached = this.cache.get(locale);
    if (cached) {
      this.content.set(cached);
      this.loading.set(false);
      this.error.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.http.get<PortfolioContent>(`${environment.apiBaseUrl}/api/portfolio/${locale}`).subscribe({
      next: (data) => {
        this.cache.set(locale, data);
        this.content.set(data);
        this.loading.set(false);
        document.title = data.meta.homeTitle;
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private initialLocale(): Locale {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LOCALES.includes(saved)) return saved;
    } catch {
      /* ignore */
    }
    const nav = (navigator.language || 'pt-BR').toLowerCase();
    if (nav.startsWith('en')) return 'en-US';
    if (nav.startsWith('es')) return 'es-ES';
    return 'pt-BR';
  }
}

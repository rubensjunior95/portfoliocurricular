import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService, LOCALE_LABELS } from '../core/portfolio.service';
import { Locale } from '../core/portfolio.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (portfolio.content(); as c) {
      <header class="site-header">
        <div class="page-container header-inner">
          <a routerLink="/" class="brand">Rubens<span class="text-primary">.</span></a>

          <nav class="header-nav" [class.open]="menuOpen()" [attr.aria-label]="c.nav.openMenu">
            @if (mode === 'home') {
              <a href="#sobre" (click)="close()">{{ c.nav.about }}</a>
              <a routerLink="/services" (click)="close()">{{ c.nav.services }}</a>
              <a href="#experiencia" (click)="close()">{{ c.nav.experience }}</a>
              <a href="#impacto" (click)="close()">{{ c.nav.impact }}</a>
              <a href="#formacao" (click)="close()">{{ c.nav.education }}</a>
              <a href="#contato" (click)="close()">{{ c.nav.contact }}</a>
            } @else {
              <a routerLink="/" (click)="close()">{{ c.servicesPage.back }}</a>
            }
          </nav>

          <div class="header-actions">
            <div class="locale-switcher" role="group" [attr.aria-label]="c.nav.language">
              @for (l of portfolio.locales; track l) {
                <button
                  type="button"
                  [class.active]="portfolio.locale() === l"
                  (click)="portfolio.setLocale(l)"
                >
                  {{ labels[l] }}
                </button>
              }
            </div>
            <a
              [href]="portfolio.whatsappHref()"
              target="_blank"
              rel="noreferrer"
              class="btn btn-primary btn-sm hide-mobile"
            >
              {{ c.nav.talk }}
            </a>
            <button
              type="button"
              class="menu-toggle"
              [attr.aria-label]="c.nav.openMenu"
              [attr.aria-expanded]="menuOpen()"
              (click)="menuOpen.set(!menuOpen())"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>
    }
  `,
})
export class HeaderComponent {
  @Input() mode: 'home' | 'services' = 'home';
  readonly portfolio = inject(PortfolioService);
  readonly labels = LOCALE_LABELS;
  readonly menuOpen = signal(false);

  close(): void {
    this.menuOpen.set(false);
  }
}

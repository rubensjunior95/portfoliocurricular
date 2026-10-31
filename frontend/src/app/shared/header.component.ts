import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService, LOCALE_LABELS } from '../core/portfolio.service';
import { DownloadCvMenuComponent } from './download-cv-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, DownloadCvMenuComponent],
  template: `
    @if (portfolio.content(); as c) {
      <header class="site-header">
        <div class="page-container header-inner">
          <a routerLink="/" class="brand">Rubens<span class="text-primary">.</span></a>

          <nav class="header-nav" [class.open]="menuOpen()" [attr.aria-label]="c.nav.openMenu">
            @if (mode === 'home') {
              <a href="#sobre" (click)="close()">{{ c.nav.about }}</a>
              @if (c.company) {
                <a href="#kodeskill" (click)="close()">{{ c.nav.company }}</a>
              }
              <a routerLink="/services" (click)="close()">{{ c.nav.services }}</a>
              <a href="#experiencia" (click)="close()">{{ c.nav.experience }}</a>
              <a href="#impacto" (click)="close()">{{ c.nav.impact }}</a>
              <a href="#formacao" (click)="close()">{{ c.nav.education }}</a>
              <a href="#contato" (click)="close()">{{ c.nav.contact }}</a>
              <div class="header-nav-cv" (click)="close()">
                <app-download-cv-menu variant="stack" />
              </div>
            } @else {
              <a routerLink="/" (click)="close()">{{ c.servicesPage.back }}</a>
              <div class="header-nav-cv" (click)="close()">
                <app-download-cv-menu variant="stack" />
              </div>
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
            <div class="hide-mobile">
              <app-download-cv-menu variant="compact" />
            </div>
            <a
              [href]="portfolio.whatsappHref()"
              target="_blank"
              rel="noreferrer"
              class="btn btn-primary btn-sm hide-mobile"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 3.1A8.4 8.4 0 0 0 5 16.2L3.8 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.1zm4.7 11.8c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.5-2.5-1.1-4.1-3.6-4.2-3.7-.1-.2-1-1.3-1-2.5s.6-1.8.9-2 .6-.3.9-.3h.4c.2 0 .4 0 .5.4.2.5.7 1.7.8 1.8.1.2 0 .3-.1.5l-.4.4c-.1.1-.2.3 0 .5.3.6 1 1.3 1.6 1.6.2.1.3.1.5 0l.4-.5c.1-.2.3-.1.5 0l1.2.6c.2.1.4.2.4.3.1.2.1.6-.1 1.2z"/></svg>
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

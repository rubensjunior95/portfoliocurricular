import { Component, ElementRef, HostListener, Input, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LOCALE_LABELS, LOCALE_NATIVE, PortfolioService } from '../core/portfolio.service';
import { DownloadCvMenuComponent } from './download-cv-menu.component';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, DownloadCvMenuComponent],
  template: `
    @let c = portfolio.content();
    <header class="site-header no-print">
      <div class="page-container header-inner">
        <a [routerLink]="portfolio.homePath()" class="brand">
          <img src="/brand/kodeskill-k.png" alt="" width="28" height="22" class="brand-mark" />
          <span>{{ c.profile.shortName }}</span>
        </a>

        <nav #nav id="site-nav" class="header-nav" [class.open]="menuOpen()" [attr.aria-label]="c.nav.main">
          @if (mode === 'home') {
            <a [routerLink]="portfolio.homePath()" fragment="sobre" (click)="close()">{{ c.nav.about }}</a>
            <a [routerLink]="portfolio.homePath()" fragment="experiencia" (click)="close()">{{ c.nav.experience }}</a>
            <a [routerLink]="portfolio.homePath()" fragment="impacto" (click)="close()">{{ c.nav.impact }}</a>
            <a [routerLink]="portfolio.homePath()" fragment="formacao" (click)="close()">{{ c.nav.education }}</a>
            <a [routerLink]="portfolio.servicesPath()" (click)="close()">{{ c.nav.services }}</a>
            <a [routerLink]="portfolio.homePath()" fragment="contato" (click)="close()">{{ c.nav.contact }}</a>
          } @else {
            <a [routerLink]="portfolio.homePath()" (click)="close()">{{ c.servicesPage.back }}</a>
          }
          <div class="header-nav-cv">
            <app-download-cv-menu variant="stack" (picked)="close()" />
          </div>
        </nav>

        <div class="header-actions">
          <nav class="locale-switcher" [attr.aria-label]="c.nav.language">
            @for (l of portfolio.locales; track l) {
              <a
                [routerLink]="portfolio.pathFor(l)"
                [class.active]="portfolio.locale() === l"
                [attr.aria-current]="portfolio.locale() === l ? 'page' : null"
                [attr.hreflang]="l"
                [attr.lang]="l"
              ><span aria-hidden="true">{{ labels[l] }}</span><span class="sr-only">{{ native[l] }}</span></a>
            }
          </nav>
          <div class="hide-mobile">
            <app-download-cv-menu variant="compact" />
          </div>
          <a [routerLink]="portfolio.homePath()" fragment="contato" class="btn btn-primary btn-sm hide-mobile">
            {{ c.nav.talk }}
          </a>
          <button
            #toggle
            type="button"
            class="menu-toggle"
            aria-controls="site-nav"
            [attr.aria-label]="c.nav.openMenu"
            [attr.aria-expanded]="menuOpen()"
            (click)="toggleMenu()"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() mode: 'home' | 'services' = 'home';
  @ViewChild('nav') private nav?: ElementRef<HTMLElement>;
  @ViewChild('toggle') private toggle?: ElementRef<HTMLButtonElement>;

  readonly portfolio = inject(PortfolioService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly labels = LOCALE_LABELS;
  readonly native = LOCALE_NATIVE;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    if (this.menuOpen()) {
      setTimeout(() => this.nav?.nativeElement.querySelector<HTMLElement>('a, button')?.focus());
    }
  }

  close(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (!this.menuOpen()) return;
    this.close();
    this.toggle?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}

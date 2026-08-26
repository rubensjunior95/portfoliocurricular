import { Component, HostListener, Input, inject, signal } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { Locale, PortfolioContent } from '../core/portfolio.models';
import { LOCALE_LABELS, LOCALE_NATIVE, PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-download-cv-menu',
  standalone: true,
  template: `
    @if (portfolio.content(); as c) {
      <div class="cv-menu" [class.stack]="variant === 'stack'" (click)="$event.stopPropagation()">
        @if (variant === 'stack') {
          <p class="cv-menu-label">{{ c.nav.chooseCvLanguage }}</p>
          <div class="cv-menu-stack">
            @for (l of locales; track l) {
              <button
                type="button"
                class="cv-menu-item"
                [disabled]="cv.busy()"
                (click)="pick(l)"
              >
                <span class="cv-menu-flag">{{ labels[l] }}</span>
                <span>{{ native[l] }}</span>
              </button>
            }
          </div>
        } @else {
          <button
            type="button"
            class="btn-cv"
            [class.compact]="variant === 'compact'"
            [attr.aria-label]="c.nav.downloadCvAria"
            [attr.aria-expanded]="open()"
            [attr.aria-busy]="cv.busy()"
            [disabled]="cv.busy()"
            (click)="toggle()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            {{ buttonLabel(c) }}
          </button>
          @if (open()) {
            <div class="cv-menu-panel" role="menu">
              <p class="cv-menu-label">{{ c.nav.chooseCvLanguage }}</p>
              @for (l of locales; track l) {
                <button
                  type="button"
                  role="menuitem"
                  class="cv-menu-item"
                  [disabled]="cv.busy()"
                  (click)="pick(l)"
                >
                  <span class="cv-menu-flag">{{ labels[l] }}</span>
                  <span>{{ native[l] }}</span>
                </button>
              }
            </div>
          }
        }
      </div>
    }
  `,
})
export class DownloadCvMenuComponent {
  @Input() variant: 'menu' | 'compact' | 'stack' = 'menu';

  readonly portfolio = inject(PortfolioService);
  readonly cv = inject(CvDownloadService);
  readonly locales = this.portfolio.locales;
  readonly labels = LOCALE_LABELS;
  readonly native = LOCALE_NATIVE;
  readonly open = signal(false);

  toggle(): void {
    this.open.update((value) => !value);
  }

  pick(locale: Locale): void {
    this.open.set(false);
    void this.cv.download(locale);
  }

  buttonLabel(content: PortfolioContent): string {
    switch (this.variant) {
      case 'compact':
        return content.nav.downloadCv;
      case 'menu':
        return content.contact.downloadPdf;
      case 'stack':
        return content.nav.downloadCv;
      default: {
        const _exhaustive: never = this.variant;
        return _exhaustive;
      }
    }
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.open.set(false);
  }
}

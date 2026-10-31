import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { Locale, PortfolioContent } from '../core/portfolio.models';
import { LOCALE_LABELS, LOCALE_NATIVE, PortfolioService } from '../core/portfolio.service';
import { IconComponent } from './icon.component';

let nextId = 0;

@Component({
  selector: 'app-download-cv-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    @let c = portfolio.content();
    <div class="cv-menu" [class.stack]="variant === 'stack'" (click)="$event.stopPropagation()" (focusout)="onFocusOut($event)">
      @if (variant === 'stack') {
        <p class="cv-menu-label">{{ c.nav.chooseCvLanguage }}</p>
        <div class="cv-menu-stack">
          @for (l of locales; track l) {
            <button type="button" class="cv-menu-item" [disabled]="cv.busy()" (click)="pick(l)">
              <app-icon name="download" [size]="14" />
              <span class="cv-menu-flag">{{ labels[l] }}</span>
              <span>{{ native[l] }}</span>
            </button>
          }
        </div>
      } @else {
        <button
          #toggleButton
          type="button"
          class="btn-cv"
          [class.compact]="variant === 'compact'"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="panelId"
          [disabled]="cv.busy()"
          (click)="toggle()"
        >
          <app-icon name="download" />
          {{ buttonLabel(c) }}
        </button>
        @if (open()) {
          <div #panel class="cv-menu-panel" [id]="panelId">
            <p class="cv-menu-label">{{ c.nav.chooseCvLanguage }}</p>
            @for (l of locales; track l) {
              <button type="button" class="cv-menu-item" [disabled]="cv.busy()" (click)="pick(l)">
                <span class="cv-menu-flag">{{ labels[l] }}</span>
                <span>{{ native[l] }}</span>
              </button>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DownloadCvMenuComponent {
  @Input() variant: 'menu' | 'compact' | 'stack' = 'menu';
  @Output() readonly picked = new EventEmitter<Locale>();
  @ViewChild('toggleButton') private toggleButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly portfolio = inject(PortfolioService);
  readonly cv = inject(CvDownloadService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly locales = this.portfolio.locales;
  readonly labels = LOCALE_LABELS;
  readonly native = LOCALE_NATIVE;
  readonly open = signal(false);
  readonly panelId = `cv-menu-${nextId++}`;

  toggle(): void {
    this.open.update((value) => !value);
    if (this.open()) {
      setTimeout(() => this.panel?.nativeElement.querySelector<HTMLButtonElement>('button')?.focus());
    }
  }

  pick(locale: Locale): void {
    this.close(true);
    this.picked.emit(locale);
    void this.cv.download(locale);
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.open() && next && !this.host.nativeElement.contains(next)) {
      this.open.set(false);
    }
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
    if (this.open()) this.close(true);
  }

  private close(restoreFocus: boolean): void {
    this.open.set(false);
    if (restoreFocus) {
      setTimeout(() => this.toggleButton?.nativeElement.focus());
    }
  }
}

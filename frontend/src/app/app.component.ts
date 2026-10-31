import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MotionService } from './core/motion.service';
import { PortfolioService } from './core/portfolio.service';
import { AmbientFieldComponent } from './shared/ambient-field.component';
import { CvPrintComponent } from './shared/cv-print.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AmbientFieldComponent, CvPrintComponent],
  template: `
    <div class="grain-overlay no-print" aria-hidden="true"></div>
    <app-ambient-field class="no-print" />
    <div class="scroll-progress no-print" aria-hidden="true"></div>
    <router-outlet />

    @if (portfolio.content(); as c) {
      <a
        [href]="portfolio.whatsappHref()"
        target="_blank"
        rel="noreferrer"
        [attr.aria-label]="c.whatsapp.floatingAria"
        class="whatsapp-fab no-print"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="currentColor" d="M12 2.4A9.1 9.1 0 0 0 4.4 16.6L3.1 21.2l4.7-1.2A9.1 9.1 0 1 0 12 2.4zm5.1 12.8c-.2.7-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.5-3.9-4.6-4.1-.2-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2.6-.4 1-.4h.5c.2 0 .4 0 .6.4.2.6.8 1.9.8 2s0 .4-.2.6l-.4.4c-.1.2-.2.3 0 .6.4.7 1.1 1.4 1.7 1.8.2.1.4.1.5-.1l.5-.5c.2-.2.4-.1.6 0l1.3.6c.3.1.4.2.5.4.1.1.1.6-.2 1.2z"/>
        </svg>
        <span class="whatsapp-fab-label">WhatsApp</span>
      </a>
    }
    <app-cv-print />
  `,
})
export class AppComponent {
  readonly portfolio = inject(PortfolioService);

  constructor() {
    inject(MotionService);
  }
}

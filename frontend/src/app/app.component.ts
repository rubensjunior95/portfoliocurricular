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
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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

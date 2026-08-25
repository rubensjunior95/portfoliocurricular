import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortfolioService } from './core/portfolio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />

    @if (portfolio.content(); as c) {
      <a
        [href]="portfolio.whatsappHref()"
        target="_blank"
        rel="noreferrer"
        [attr.aria-label]="c.whatsapp.floatingAria"
        class="whatsapp-fab"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        <span class="whatsapp-fab-label">WhatsApp</span>
      </a>
    }
  `,
})
export class AppComponent {
  readonly portfolio = inject(PortfolioService);
}

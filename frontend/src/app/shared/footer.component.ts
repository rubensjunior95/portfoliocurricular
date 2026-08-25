import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (portfolio.content(); as c) {
      <footer class="site-footer">
        <div class="page-container footer-inner">
          <p>© {{ year }} {{ c.footer.rights }}</p>
          <nav class="footer-nav">
            <a href="/#sobre">{{ c.nav.about }}</a>
            <a routerLink="/services">{{ c.nav.services }}</a>
            <a href="/#experiencia">{{ c.nav.experience }}</a>
            <a href="/#contato">{{ c.nav.contact }}</a>
          </nav>
          <div class="footer-links">
            <a [href]="c.profile.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
            <a [href]="portfolio.whatsappHref()" target="_blank" rel="noreferrer">WhatsApp</a>
            <a [href]="'mailto:' + c.profile.email">E-mail</a>
          </div>
        </div>
      </footer>
    }
  `,
})
export class FooterComponent {
  readonly portfolio = inject(PortfolioService);
  readonly year = new Date().getFullYear();
}

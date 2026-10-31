import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @let c = portfolio.content();
    <footer class="site-footer no-print">
      <div class="page-container footer-inner">
        <div class="footer-brand">
          <img src="/brand/kodeskill-k.png" alt="" width="34" height="27" />
          <div>
            <p class="footer-name">{{ c.profile.fullName }}</p>
            @if (c.company) {
              <p class="footer-tagline">{{ c.company.tagline }}</p>
            }
          </div>
        </div>
        <nav class="footer-nav" [attr.aria-label]="c.nav.home">
          <a [routerLink]="portfolio.homePath()" fragment="sobre">{{ c.nav.about }}</a>
          @if (c.company) {
            <a [routerLink]="portfolio.homePath()" fragment="kodeskill">{{ c.nav.company }}</a>
          }
          <a [routerLink]="portfolio.homePath()" fragment="experiencia">{{ c.nav.experience }}</a>
          <a [routerLink]="portfolio.servicesPath()">{{ c.nav.services }}</a>
          <a [routerLink]="portfolio.homePath()" fragment="contato">{{ c.nav.contact }}</a>
        </nav>
        <div class="footer-links">
          <a [href]="c.profile.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
          <a [href]="c.profile.githubAlt" target="_blank" rel="noreferrer">{{ c.profile.githubAltDisplay }}</a>
          <a [href]="c.profile.github" target="_blank" rel="noreferrer">{{ c.profile.githubDisplay }}</a>
          <a [href]="'mailto:' + c.profile.email">{{ c.profile.email }}</a>
        </div>
        <p class="footer-rights">© {{ year }} {{ c.footer.rights }}</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly portfolio = inject(PortfolioService);
  readonly year = new Date().getFullYear();
}

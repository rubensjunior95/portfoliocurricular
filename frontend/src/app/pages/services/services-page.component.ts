import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../core/portfolio.service';
import { HeaderComponent } from '../../shared/header.component';
import { FooterComponent } from '../../shared/footer.component';
import { LoadingStateComponent } from '../../shared/loading-state.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, LoadingStateComponent, RevealDirective],
  templateUrl: './services-page.component.html',
  host: { class: 'site-main' },
})
export class ServicesPageComponent {
  readonly portfolio = inject(PortfolioService);

  pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}

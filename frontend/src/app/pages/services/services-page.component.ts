import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../core/portfolio.service';
import { DownloadCvMenuComponent } from '../../shared/download-cv-menu.component';
import { FooterComponent } from '../../shared/footer.component';
import { HeaderComponent } from '../../shared/header.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, DownloadCvMenuComponent, IconComponent],
  templateUrl: './services-page.component.html',
  host: { class: 'site-page' },
})
export class ServicesPageComponent {
  readonly portfolio = inject(PortfolioService);
}

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../core/portfolio.service';
import { DownloadCvMenuComponent } from '../../shared/download-cv-menu.component';
import { FooterComponent } from '../../shared/footer.component';
import { HeaderComponent } from '../../shared/header.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, DownloadCvMenuComponent, IconComponent],
  templateUrl: './home.component.html',
  host: { class: 'site-page' },
})
export class HomeComponent {
  readonly portfolio = inject(PortfolioService);

  /** Separa "Arquitetura: texto" em rótulo e corpo para destacar o rótulo. */
  label(paragraph: string): { label: string; body: string } | null {
    const match = /^([^:]{3,24}):\s+(.*)$/s.exec(paragraph);
    return match ? { label: match[1], body: match[2] } : null;
  }

  onPhotoPointer(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(px * 8).toFixed(2)}deg`);
  }

  onPhotoLeave(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }
}

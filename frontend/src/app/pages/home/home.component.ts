import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../core/portfolio.service';
import { HeaderComponent } from '../../shared/header.component';
import { FooterComponent } from '../../shared/footer.component';
import { LoadingStateComponent } from '../../shared/loading-state.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, LoadingStateComponent, RevealDirective],
  templateUrl: './home.component.html',
  host: { class: 'site-main' },
})
export class HomeComponent {
  readonly portfolio = inject(PortfolioService);

  pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  onPhotoPointer(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${(-py * 7).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(px * 9).toFixed(2)}deg`);
  }

  onPhotoLeave(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }
}

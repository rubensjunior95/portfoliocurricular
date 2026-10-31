import { Component, DestroyRef, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MotionService } from './core/motion.service';
import { PortfolioService } from './core/portfolio.service';
import { AmbientFieldComponent } from './shared/ambient-field.component';
import { CvPrintComponent } from './shared/cv-print.component';
import { IconComponent } from './shared/icon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AmbientFieldComponent, CvPrintComponent, IconComponent],
  template: `
    <a class="skip-link no-print" href="#conteudo" (click)="skipToContent($event)">{{ portfolio.content().nav.skip }}</a>
    <app-ambient-field class="no-print" />
    <div class="scroll-progress no-print" aria-hidden="true"></div>
    <router-outlet />

    <a
      [href]="portfolio.whatsappHref()"
      target="_blank"
      rel="noreferrer"
      [attr.aria-label]="portfolio.content().whatsapp.floatingAria"
      class="whatsapp-fab no-print"
    >
      <app-icon name="whatsapp" [size]="20" />
      <span class="whatsapp-fab-label">WhatsApp</span>
    </a>

    @defer (on idle) {
      <app-cv-print />
    }
  `,
})
export class AppComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(MotionService);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    const router = inject(Router);
    router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        const fragment = router.parseUrl(router.url).fragment;
        if (fragment) setTimeout(() => this.focusTarget(fragment, true));
      });
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    this.focusTarget('conteudo', false);
  }

  private focusTarget(id: string, preventScroll: boolean): void {
    this.document.getElementById(id)?.focus({ preventScroll });
  }
}

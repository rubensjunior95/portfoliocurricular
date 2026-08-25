import { Component, inject } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';

/**
 * Estado de carregamento/erro exibido enquanto a API na Koyeb responde
 * (a instância free pode levar alguns segundos para "acordar").
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state">
      @if (portfolio.error()) {
        <p class="loading-title">Não foi possível carregar o conteúdo.</p>
        <p class="loading-sub">O servidor pode estar iniciando — tente novamente em instantes.</p>
        <button type="button" class="btn btn-primary" (click)="portfolio.retry()">
          Tentar novamente
        </button>
      } @else {
        <span class="spinner" aria-hidden="true"></span>
        <p class="loading-sub">Carregando…</p>
      }
    </div>
  `,
})
export class LoadingStateComponent {
  readonly portfolio = inject(PortfolioService);
}

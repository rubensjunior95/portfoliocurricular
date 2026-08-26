import { Injectable } from '@angular/core';

/**
 * Liga o motion system: classe `motion-ok` no <html>, progresso de scroll
 * e estado compacto do header. Sem efeito quando o usuário pede menos movimento.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  constructor() {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMotionFlag = (): void => {
      root.classList.toggle('motion-ok', !motionQuery.matches);
    };
    syncMotionFlag();
    motionQuery.addEventListener('change', syncMotionFlag);

    let ticking = false;
    const onScroll = (): void => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = root.scrollHeight - root.clientHeight;
        const progress = max > 0 ? root.scrollTop / max : 0;
        root.style.setProperty('--scroll', progress.toFixed(4));
        root.classList.toggle('is-scrolled', root.scrollTop > 16);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

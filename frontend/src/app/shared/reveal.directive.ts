import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';

type RevealVariant = '' | 'left' | 'settle';

/**
 * Marca o host como visível na viewport (uma vez) para coreografia CSS.
 * Conteúdo permanece visível se o observer falhar ou se reduced-motion estiver ativo.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealVariant = '';

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private fallback?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    const node = this.host.nativeElement;
    node.classList.add('reveal');
    if (this.appReveal) {
      node.classList.add(`reveal-${this.appReveal}`);
    }

    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('in-view');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('in-view');
            this.cleanup();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(node);

    this.fallback = setTimeout(() => {
      node.classList.add('in-view');
      this.cleanup();
    }, 12000);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.fallback !== undefined) {
      clearTimeout(this.fallback);
      this.fallback = undefined;
    }
  }
}

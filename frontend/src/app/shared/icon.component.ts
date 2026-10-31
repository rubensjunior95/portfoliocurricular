import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName = 'whatsapp' | 'mail' | 'linkedin' | 'github' | 'pin' | 'download' | 'arrow' | 'external';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `
    @switch (name) {
      @case ('whatsapp') {
        <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path fill="currentColor" d="M12 2.4A9.1 9.1 0 0 0 4.4 16.6L3.1 21.2l4.7-1.2A9.1 9.1 0 1 0 12 2.4zm5.1 12.8c-.2.7-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.5-3.9-4.6-4.1-.2-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2.6-.4 1-.4h.5c.2 0 .4 0 .6.4.2.6.8 1.9.8 2s0 .4-.2.6l-.4.4c-.1.2-.2.3 0 .6.4.7 1.1 1.4 1.7 1.8.2.1.4.1.5-.1l.5-.5c.2-.2.4-.1.6 0l1.3.6c.3.1.4.2.5.4.1.1.1.6-.2 1.2z"/></svg>
      }
      @case ('mail') {
        <svg class="stroke" viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
      }
      @case ('linkedin') {
        <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path fill="currentColor" d="M6.2 9H4v10.5h2.2V9zM5.1 4.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM20 19.5h-2.2v-5.4c0-1.5-.5-2.5-1.9-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.5-.1.8v5.8H11.8V9h2.1v1.4c.4-.7 1.2-1.7 3-1.7 2.2 0 3.1 1.4 3.1 4.5v6.3z"/></svg>
      }
      @case ('github') {
        <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path fill="currentColor" d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.6c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1 2.8.8.1-.6.3-1 .6-1.3-2.2-.2-4.4-1.1-4.4-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.8 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.2.1 2.5.6.7 1 1.5 1 2.6 0 3.7-2.3 4.6-4.5 4.8.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2z"/></svg>
      }
      @case ('pin') {
        <svg class="stroke" viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
      }
      @case ('download') {
        <svg class="stroke" viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
      }
      @case ('arrow') {
        <svg class="stroke" viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
      }
      @case ('external') {
        <svg class="stroke" viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>
      }
    }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 16;
}

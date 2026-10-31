import { Component, computed, inject } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-cv-print',
  standalone: true,
  template: `
    @if (data(); as c) {
      <article class="cv-print cv-ats" [attr.lang]="c.locale">
        <header class="cv-header">
          <h1>{{ c.profile.fullName }}</h1>
          <p class="cv-headline">{{ c.cv.headline }}</p>
          <p class="cv-availability">{{ c.hero.availability }}</p>
          <ul class="cv-contacts">
            <li>
              <a [href]="'mailto:' + c.profile.email">{{ c.profile.email }}</a>
            </li>
            <li>
              <a [href]="'https://wa.me/' + c.profile.whatsappNumber">https://wa.me/{{ c.profile.whatsappNumber }}</a>
            </li>
            <li>
              <a [href]="c.profile.linkedin">{{ c.profile.linkedin }}</a>
            </li>
            <li>
              <a [href]="c.profile.github">{{ c.profile.github }}</a>
            </li>
            <li>
              <a href="https://portfoliocurricular.vercel.app/">https://portfoliocurricular.vercel.app/</a>
            </li>
          </ul>
        </header>

        <section>
          <h2>{{ c.cv.profileLabel }}</h2>
          <p>{{ c.cv.summary }}</p>
        </section>

        @if (c.company; as company) {
          <section>
            <h2>{{ company.cvLabel }}</h2>
            <h3>{{ company.name }} <span>{{ company.period }}</span></h3>
            <p>{{ company.kind }} · {{ company.role }}</p>
            <p>{{ company.cvSummary }}</p>
          </section>
        }

        <section>
          <h2>{{ c.experience.eyebrow }}</h2>
          @for (exp of c.experience.items; track exp.role + exp.company) {
            <div class="cv-avoid-break">
              <h3>{{ exp.role }} <span>{{ exp.period }}</span></h3>
              <p>{{ exp.company }} · {{ exp.location }}</p>
              @for (paragraph of exp.paragraphs; track paragraph) {
                <p>{{ paragraph }}</p>
              }
            </div>
          }
        </section>

        <section>
          <h2>{{ c.impact.eyebrow }}</h2>
          @for (card of c.impact.cards; track card.title) {
            <div class="cv-avoid-break">
              <h3>{{ card.title }} <span>{{ card.company }}</span></h3>
              <p>{{ card.metric }} — {{ card.metricNote }}</p>
              <p>{{ c.impact.problemLabel }}: {{ card.problem }}</p>
              <p>{{ c.impact.highlightLabel }}: {{ card.highlight }}</p>
              @if (card.stack.length) {
                <p>{{ c.impact.stackLabel }}: {{ card.stack.join(', ') }}</p>
              }
              @for (link of card.links ?? []; track link.href) {
                <p><a [href]="link.href">{{ link.label }}: {{ link.href }}</a></p>
              }
            </div>
          }
        </section>

        <section>
          <h2>{{ c.education.eyebrow }}</h2>
          @for (item of c.education.items; track item.title) {
            <p class="cv-avoid-break"><strong>{{ item.title }}</strong> — {{ item.school }} ({{ item.period }})</p>
          }
        </section>

        <section>
          <h2>{{ c.education.skillsEyebrow }}</h2>
          @for (group of c.education.skillGroups; track group.title) {
            <p class="cv-avoid-break"><strong>{{ group.title }}.</strong> {{ group.skills.join(', ') }}</p>
          }
        </section>

        <section>
          <h2>{{ c.education.languagesLabel }}</h2>
          @for (lang of c.education.languages; track lang.name) {
            <p><strong>{{ lang.name }}.</strong> {{ lang.level }}</p>
          }
        </section>
      </article>
    }
  `,
})
export class CvPrintComponent {
  private readonly portfolio = inject(PortfolioService);
  private readonly cv = inject(CvDownloadService);

  readonly data = computed(() => this.cv.printContent() ?? this.portfolio.content());
}

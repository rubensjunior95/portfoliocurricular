import { Component, computed, inject } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { PortfolioContent } from '../core/portfolio.models';
import { PortfolioService, SITE_URL } from '../core/portfolio.service';

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
              <a [href]="'mailto:' + c.profile.email">{{ c.cv.emailLabel }}: {{ c.profile.email }}</a>
            </li>
            <li>
              <a [href]="'tel:' + c.profile.phone">{{ c.cv.phoneLabel }}: {{ c.profile.phoneIntl }}</a>
            </li>
            <li>
              <a [href]="'https://wa.me/' + c.profile.whatsappNumber">WhatsApp: https://wa.me/{{ c.profile.whatsappNumber }}</a>
            </li>
            <li>{{ c.cv.locationLabel }}: {{ c.contact.locationValue }}</li>
            <li>
              <a [href]="c.profile.linkedin">{{ c.cv.linkedinLabel }}: {{ c.profile.linkedin }}</a>
            </li>
            <li>
              <a [href]="c.profile.github">{{ c.cv.githubLabel }}: {{ c.profile.github }}</a>
            </li>
            <li>
              <a [href]="siteUrl(c)">{{ c.cv.webLabel }}: {{ siteUrl(c) }}</a>
            </li>
          </ul>
        </header>

        <section>
          <h2>{{ c.cv.profileLabel }}</h2>
          <p>{{ c.cv.summary }}</p>
          @if (c.fxNote) {
            <p class="cv-note">{{ c.fxNote }}</p>
          }
        </section>

        <section>
          <h2>{{ c.experience.eyebrow }}</h2>
          @for (exp of c.experience.items; track exp.role + exp.company) {
            <div class="cv-job">
              <div class="cv-role">
                <h3>{{ exp.role }}</h3>
                <span>{{ exp.period }}</span>
              </div>
              <p class="cv-meta">{{ exp.company }} · {{ exp.location }}</p>
              @for (paragraph of exp.paragraphs; track paragraph) {
                <p>{{ paragraph }}</p>
              }
              @if (exp.stack?.length) {
                <p>{{ c.experience.stackLabel }}: {{ exp.stack!.join(', ') }}</p>
              }
              @for (link of exp.links ?? []; track link.href) {
                <p><a [href]="link.href">{{ link.label }}: {{ link.href }}</a></p>
              }
            </div>
          }
        </section>

        <section class="cv-avoid-break">
          <h2>{{ c.education.eyebrow }}</h2>
          @for (item of c.education.items; track item.title) {
            <p class="cv-edu"><strong>{{ item.title }}</strong> — {{ item.school }} · {{ item.period }}</p>
          }
        </section>

        <section class="cv-avoid-break">
          <h2>{{ c.education.coursesLabel }}</h2>
          @for (course of c.education.courses; track course.title) {
            <p class="cv-edu"><strong>{{ course.title }}</strong> — {{ course.school }} · {{ course.period }}</p>
          }
        </section>

        <section class="cv-avoid-break">
          <h2>{{ c.cv.skillsLabel }}</h2>
          @for (group of c.education.skillGroups; track group.title) {
            <p class="cv-edu"><strong>{{ group.title }}:</strong> {{ group.skills.join(', ') }}</p>
          }
        </section>

        <section class="cv-avoid-break">
          <h2>{{ c.education.languagesLabel }}</h2>
          @for (lang of c.education.languages; track lang.name) {
            <p class="cv-edu"><strong>{{ lang.name }}:</strong> {{ lang.level }}</p>
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

  siteUrl(content: PortfolioContent): string {
    const path = this.portfolio.pathFor(content.locale, 'home');
    return path === '/' ? `${SITE_URL}/` : SITE_URL + path;
  }
}

import { Component, computed, inject } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-cv-print',
  standalone: true,
  template: `
    @if (data(); as c) {
      <div class="cv-print" [attr.lang]="c.locale">
        <header class="cv-header">
          <img
            src="assets/rubens.jpeg"
            [alt]="c.hero.photoAlt"
            class="cv-photo"
            width="92"
            height="92"
          />
          <div class="cv-header-copy">
            <h1>{{ c.profile.fullName }}</h1>
            <p class="cv-headline">{{ c.cv.headline }}</p>
            <ul class="cv-contacts">
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                <span>{{ c.profile.email }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h3l1.5 4-2 1.5a12 12 0 0 0 6 6L17 13l4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 4 5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                <span>+55 {{ c.profile.phoneDisplay }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
                <span>{{ c.contact.locationValue }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.2" cy="9" r="1.2" fill="currentColor"/><path d="M7.2 16.5V11.2M11.2 16.5v-3.2a2.2 2.2 0 0 1 4.4 0v3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                <span>{{ c.profile.linkedinDisplay }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 12h16M12 4c2.4 2.6 2.4 13.4 0 16M12 4c-2.4 2.6-2.4 13.4 0 16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                <span>{{ c.profile.siteDisplay }}</span>
              </li>
            </ul>
          </div>
        </header>

        <div class="cv-body">
          <aside class="cv-aside">
            <section>
              <p class="cv-side-title">{{ c.education.skillsEyebrow }}</p>
              <div class="cv-side-list">
                @for (group of c.education.skillGroups; track group.title) {
                  <div class="cv-avoid-break">
                    <h3>{{ group.title }}</h3>
                    <p>{{ group.skills.join(' · ') }}</p>
                  </div>
                }
              </div>
            </section>

            <section>
              <p class="cv-side-title">{{ c.education.languagesLabel }}</p>
              <div class="cv-side-list">
                @for (lang of c.education.languages; track lang.name) {
                  <p><strong>{{ lang.name }}</strong> <span>{{ lang.level }}</span></p>
                }
              </div>
            </section>

            <section>
              <p class="cv-side-title">{{ c.education.coursesLabel }}</p>
              <div class="cv-side-list">
                @for (course of c.education.courses; track course.title) {
                  <div class="cv-avoid-break">
                    <h3>{{ course.title }}</h3>
                    <p class="cv-side-period">{{ course.school }} · {{ course.period }}</p>
                    @if (course.parts?.length) {
                      <ul class="cv-course-parts">
                        @for (part of course.parts; track part.title) {
                          <li>{{ part.title }} <span>{{ part.period }}</span></li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            </section>
          </aside>

          <main>
            <section>
              <p class="cv-section-title">{{ c.cv.profileLabel }}</p>
              <p class="cv-summary">{{ c.cv.summary }}</p>
            </section>

            <section>
              <p class="cv-section-title">{{ c.experience.eyebrow }}</p>
              <div class="cv-jobs">
                @for (exp of c.experience.items; track exp.role + exp.company) {
                  <article class="cv-job cv-avoid-break">
                    <div class="cv-job-head">
                      <h3>{{ exp.role }}</h3>
                      <span class="cv-job-period">{{ exp.period }}</span>
                    </div>
                    <p class="cv-job-meta">{{ exp.company }} · {{ exp.location }}</p>
                    @for (paragraph of exp.paragraphs; track paragraph) {
                      <p class="cv-job-desc">{{ paragraph }}</p>
                    }
                  </article>
                }
              </div>
            </section>

            <section>
              <p class="cv-section-title">{{ c.education.eyebrow }}</p>
              <div class="cv-edu">
                @for (item of c.education.items; track item.title) {
                  <article class="cv-avoid-break">
                    <div class="cv-job-head">
                      <h3>{{ item.title }}</h3>
                      <span class="cv-job-period">{{ item.period }}</span>
                    </div>
                    <p class="cv-job-meta">{{ item.school }}</p>
                  </article>
                }
              </div>
            </section>
          </main>
        </div>

        <footer class="cv-footer">
          <span>{{ c.profile.fullName }}</span>
          <span>{{ c.profile.siteDisplay }}</span>
        </footer>
      </div>
    }
  `,
})
export class CvPrintComponent {
  private readonly portfolio = inject(PortfolioService);
  private readonly cv = inject(CvDownloadService);

  readonly data = computed(() => this.cv.printContent() ?? this.portfolio.content());
}

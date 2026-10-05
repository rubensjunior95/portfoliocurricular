import { Component, computed, inject } from '@angular/core';
import { CvDownloadService } from '../core/cv-download.service';
import { PortfolioService } from '../core/portfolio.service';
import { ExperienceItem } from '../core/portfolio.models';

interface CoursePart {
  title: string;
  period: string;
}

@Component({
  selector: 'app-cv-print',
  standalone: true,
  template: `
    @if (data(); as c) {
      <div class="cv-print" [attr.lang]="c.locale">
        <header class="cv-header">
          <div class="cv-header-copy">
            <h1>{{ c.profile.fullName }}</h1>
            <p class="cv-headline">{{ c.cv.headline }}</p>
            <ul class="cv-contacts">
              <li>
                <strong>{{ c.cv.emailLabel }}:</strong>
                {{ c.profile.email }}
              </li>
              <li>
                <strong>{{ c.cv.phoneLabel }}:</strong>
                +55 {{ c.profile.phoneDisplay }}
              </li>
              <li>
                <strong>{{ c.cv.locationLabel }}:</strong>
                {{ c.contact.locationValue }}
              </li>
              <li>
                <strong>{{ c.cv.linkedinLabel }}:</strong>
                {{ c.profile.linkedinDisplay }}
              </li>
              <li>
                <strong>{{ c.cv.webLabel }}:</strong>
                {{ c.profile.siteDisplay }}
              </li>
            </ul>
          </div>
          <img
            src="assets/rubens.jpeg"
            [alt]="c.hero.photoAlt"
            class="cv-photo"
            width="112"
            height="112"
          />
        </header>

        <div class="cv-body">
          <main>
            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.cv.profileLabel }}</p>
              </div>
              <p class="cv-summary">{{ c.cv.summary }}</p>
            </section>

            @if (results().length) {
              <section class="cv-avoid-break">
                <div class="cv-section-label">
                  <p class="cv-section-title">{{ c.cv.resultsLabel }}</p>
                </div>
                <div class="cv-results">
                  @for (exp of results(); track exp.company) {
                    <div class="cv-result-card">
                      <p>{{ exp.featuredHighlight }}</p>
                      <p class="cv-result-company">{{ exp.company }}</p>
                    </div>
                  }
                </div>
              </section>
            }

            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.experience.title }}</p>
              </div>
              <div class="cv-jobs">
                @for (exp of c.experience.items; track exp.role + exp.company) {
                  <article class="cv-job cv-avoid-break">
                    <div class="cv-job-head">
                      <h3>{{ exp.role }}</h3>
                      <span class="cv-job-period">{{ exp.period }}</span>
                    </div>
                    <p class="cv-job-meta">
                      {{ exp.company }}
                      <span> · {{ exp.location }}</span>
                    </p>
                    @if (exp.paragraphs[0]; as lead) {
                      <p class="cv-job-desc">{{ lead }}</p>
                    }
                    @if (exp.featuredHighlight) {
                      <p class="cv-job-metric">
                        <span class="cv-metric-pill">{{ exp.featuredHighlight }}</span>
                      </p>
                    }
                  </article>
                }
              </div>
            </section>
          </main>

          <aside class="cv-aside">
            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.education.skillsEyebrow }}</p>
              </div>
              <div class="cv-aside-list">
                @for (group of c.education.skillGroups; track group.title) {
                  <div class="cv-avoid-break">
                    <h3>{{ group.title }}</h3>
                    <p>{{ group.skills.join(' · ') }}</p>
                  </div>
                }
              </div>
            </section>

            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.education.eyebrow }}</p>
              </div>
              <div class="cv-aside-list">
                @for (item of c.education.items; track item.title) {
                  <div class="cv-avoid-break">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.school }} · {{ item.period }}</p>
                  </div>
                }
              </div>
            </section>

            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.education.coursesLabel }}</p>
              </div>
              <div class="cv-aside-list">
                @for (course of c.education.courses; track course.title) {
                  <div class="cv-avoid-break">
                    <h3>{{ course.title }}</h3>
                    <p>{{ course.school }} · {{ course.period }}</p>
                    @if (course.parts?.length) {
                      <p class="cv-course-part">{{ coursePartLine(course.parts) }}</p>
                    }
                  </div>
                }
              </div>
            </section>

            <section>
              <div class="cv-section-label">
                <p class="cv-section-title">{{ c.education.languagesLabel }}</p>
              </div>
              <div class="cv-langs">
                @for (lang of c.education.languages; track lang.name) {
                  <p>
                    <strong>{{ lang.name }}</strong>
                    <span>{{ lang.level }}</span>
                  </p>
                }
              </div>
            </section>
          </aside>
        </div>
      </div>
    }
  `,
})
export class CvPrintComponent {
  private readonly portfolio = inject(PortfolioService);
  private readonly cv = inject(CvDownloadService);

  readonly data = computed(() => this.cv.printContent() ?? this.portfolio.content());

  coursePartLine(parts: CoursePart[] | undefined): string {
    return (parts ?? []).map((part) => part.title).join(' · ');
  }

  readonly results = computed<ExperienceItem[]>(() => {
    const items = this.data()?.experience.items ?? [];
    return items.filter((exp) => Boolean(exp.featuredHighlight));
  });
}

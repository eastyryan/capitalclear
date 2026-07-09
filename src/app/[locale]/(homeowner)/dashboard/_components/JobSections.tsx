import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from './JobCard';
import type { Job } from '@/types/database.types';

export type JobSection = {
  /** i18n key under HomeownerDashboard, e.g. "sectionActive". */
  key: string;
  title: string;
  jobs: Job[];
};

// Server component: renders the non-empty grouped sections. Each section is a
// hairline-divided list of job rows (the rows themselves are the interactive
// client islands).
export function JobSections({ sections }: { sections: JobSection[] }) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`section-${section.key}`}>
          <div className="mb-2 flex items-baseline gap-3">
            <h2
              id={`section-${section.key}`}
              className="text-xl font-semibold tracking-tighter text-foreground sm:text-2xl"
            >
              {section.title}
            </h2>
            <span className="font-mono text-sm text-[var(--cc-ink-soft)] tabular-nums">
              {section.jobs.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {section.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Loading placeholder mirroring a single section of rows. Exported so a
// Suspense/loading boundary can reuse the exact row silhouette.
export function JobSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden>
      <section>
        <Skeleton className="mb-2 h-6 w-32" />
        <div className="divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-6 py-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-64" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
// labelled band with a responsive grid of JobCards (the cards themselves are
// the interactive client islands).
export function JobSections({ sections }: { sections: JobSection[] }) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`section-${section.key}`}>
          <div className="mb-4 flex items-baseline gap-3">
            <h2
              id={`section-${section.key}`}
              className="text-lg font-semibold text-foreground"
            >
              {section.title}
            </h2>
            <span className="font-mono text-sm text-muted-foreground tabular-nums">
              {section.jobs.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Loading placeholder mirroring a single section of cards. Exported so a
// Suspense/loading boundary can reuse the exact card silhouette.
export function JobSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden>
      <section>
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-11 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { ReactNode } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { MoneyLocale } from '@/lib/format/money';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JobCard } from '../../(pro)/pro/_components/JobCard';
import { EarningsSummary } from '../../(pro)/pro/_components/EarningsSummary';
import { PRO_AVAILABLE, PRO_ACTIVE, PRO_COMPLETED, PRO_EARNINGS } from '../_mock';

type FeedJob = (typeof PRO_AVAILABLE)[number];

// Stand-ins for the real Accept / View actions (no backend in the demo).
// Accept is rendered as the real solid-blue primary button so the feed reads
// exactly like production; View stays a quiet outline.
function DemoAction({ label, primary = false }: { label: string; primary?: boolean }) {
  return (
    <span
      className={
        primary
          ? 'inline-flex cursor-not-allowed items-center rounded-lg bg-primary px-5 py-2.5 text-base font-medium leading-none text-primary-foreground'
          : 'inline-flex cursor-not-allowed items-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium leading-none text-muted-foreground'
      }
    >
      {label}
    </span>
  );
}

function JobGrid({ jobs, action }: { jobs: FeedJob[]; action: ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} action={action} />
        </li>
      ))}
    </ul>
  );
}

export default async function DemoPro({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('ProDashboard');
  const moneyLocale: MoneyLocale = locale === 'fr' ? 'fr' : 'en';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <p className="eyebrow">{t('liveBadge')}</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 max-w-prose text-base text-muted-foreground">{t('subtitle')}</p>
      </header>

      <Tabs defaultValue="available" className="gap-7">
        <TabsList className="w-full max-w-3xl">
          <TabsTrigger value="available">{t('tabAvailable')}</TabsTrigger>
          <TabsTrigger value="active">{t('tabActive')}</TabsTrigger>
          <TabsTrigger value="completed">{t('tabCompleted')}</TabsTrigger>
          <TabsTrigger value="earnings">{t('tabEarnings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <JobGrid jobs={PRO_AVAILABLE} action={<DemoAction primary label={t('accept')} />} />
        </TabsContent>
        <TabsContent value="active">
          <JobGrid jobs={PRO_ACTIVE} action={<DemoAction label={t('viewJob')} />} />
        </TabsContent>
        <TabsContent value="completed">
          <JobGrid jobs={PRO_COMPLETED} action={<DemoAction label={t('viewJob')} />} />
        </TabsContent>
        <TabsContent value="earnings">
          <EarningsSummary
            heldCents={PRO_EARNINGS.heldCents}
            releasedCents={PRO_EARNINGS.releasedCents}
            jobsCompleted={PRO_EARNINGS.jobsCompleted}
            ratingAvg={PRO_EARNINGS.ratingAvg}
            locale={moneyLocale}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

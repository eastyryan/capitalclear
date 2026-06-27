import type { ReactNode } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { MoneyLocale } from '@/lib/format/money';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JobCard } from '../../(pro)/pro/_components/JobCard';
import { EarningsSummary } from '../../(pro)/pro/_components/EarningsSummary';
import { PRO_AVAILABLE, PRO_ACTIVE, PRO_COMPLETED, PRO_EARNINGS } from '../_mock';

type FeedJob = (typeof PRO_AVAILABLE)[number];

// Disabled pill standing in for the real Accept / View actions (no backend).
function DemoAction({ label }: { label: string }) {
  return (
    <span className="cursor-not-allowed rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
      <header className="mb-6">
        <p className="eyebrow">{t('liveBadge')}</p>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <Tabs defaultValue="available" className="gap-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="available">{t('tabAvailable')}</TabsTrigger>
          <TabsTrigger value="active">{t('tabActive')}</TabsTrigger>
          <TabsTrigger value="completed">{t('tabCompleted')}</TabsTrigger>
          <TabsTrigger value="earnings">{t('tabEarnings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <JobGrid jobs={PRO_AVAILABLE} action={<DemoAction label={t('accept')} />} />
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

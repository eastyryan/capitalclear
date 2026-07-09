import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Job, JobStatus } from '@/types/database.types';
import { JobSections, type JobSection } from '../../(homeowner)/dashboard/_components/JobSections';
import { HOMEOWNER_JOBS } from '../_mock';

const ACTIVE: JobStatus[] = ['posted', 'accepted', 'en_route', 'in_progress'];

export default async function DemoHomeowner({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomeownerDashboard');

  const jobs = HOMEOWNER_JOBS;
  const pick = (fn: (j: Job) => boolean) => jobs.filter(fn);

  const sections: JobSection[] = [
    { key: 'sectionAwaiting', title: t('sectionAwaiting'), jobs: pick((j) => j.status === 'awaiting_approval') },
    { key: 'sectionActive', title: t('sectionActive'), jobs: pick((j) => ACTIVE.includes(j.status)) },
    { key: 'sectionCompleted', title: t('sectionCompleted'), jobs: pick((j) => j.status === 'completed') },
    { key: 'sectionCancelled', title: t('sectionCancelled'), jobs: pick((j) => j.status === 'cancelled') }
  ].filter((s) => s.jobs.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-10">
        <p className="eyebrow">Capital Clear</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl">{t('title')}</h1>
        <p className="mt-1 max-w-[52ch] text-[var(--cc-ink-soft)]">{t('subtitle')}</p>
      </header>
      <JobSections sections={sections} />
    </main>
  );
}

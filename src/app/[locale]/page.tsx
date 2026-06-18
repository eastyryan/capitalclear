import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Ottawa · Kanata · Barrhaven · Orleans · Nepean
      </span>
      <h1 className="font-sans text-4xl font-normal tracking-tight">{t('title')}</h1>
      <p className="max-w-xl text-balance text-muted-foreground">{t('tagline')}</p>
    </main>
  );
}

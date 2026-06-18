'use client';

import { useTranslations } from 'next-intl';
import { ImageOff } from 'lucide-react';

type SignedPhoto = { url: string };

// Side-by-side before/after gallery. URLs are short-lived signed Supabase
// Storage URLs, so we render with a plain <img> (next/image optimization would
// try to proxy/refetch the remote, signed-and-expiring URL). Empty columns
// fall back to a labelled placeholder.

function PhotoColumn({
  label,
  photos,
}: {
  label: string;
  photos: SignedPhoto[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-muted-foreground">{label}</span>
      {photos.length === 0 ? (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
          <ImageOff className="size-6" aria-hidden />
          <span className="text-xs">{label}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {photos.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${label}-${i}`}
              src={photo.url}
              alt={`${label} ${i + 1}`}
              className="aspect-[4/3] w-full rounded-lg border object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BeforeAfterGallery({
  before,
  after,
}: {
  before: SignedPhoto[];
  after: SignedPhoto[];
}) {
  const t = useTranslations('JobDetail');

  return (
    <section
      aria-label={`${t('beforePhoto')} / ${t('afterPhoto')}`}
      className="grid grid-cols-2 gap-3"
    >
      <PhotoColumn label={t('beforePhoto')} photos={before} />
      <PhotoColumn label={t('afterPhoto')} photos={after} />
    </section>
  );
}

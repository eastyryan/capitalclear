'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPhotoUploadUrl, attachJobPhoto } from '@/app/actions/photos';
import { Button } from '@/components/ui/button';
import type { PhotoType } from '@/types/database.types';

const BUCKET = 'job-photos';

// Assigned-pro-only uploader. Full flow per the photos action contract:
//   1. createPhotoUploadUrl(jobId, type)  -> { path, token }
//   2. storage.uploadToSignedUrl(path, token, file)  (browser, RLS-scoped)
//   3. attachJobPhoto(jobId, path, type)  -> records the row
//   4. toast + router.refresh() so the gallery / action gate re-renders.
//
// One instance per photo type ('before' on en_route, 'after' on in_progress).

export function PhotoUploader({
  jobId,
  type,
}: {
  jobId: string;
  type: PhotoType;
}) {
  const t = useTranslations('JobDetail');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const label = type === 'before' ? t('uploadBefore') : t('uploadAfter');

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const urlResult = await createPhotoUploadUrl(jobId, type);
      if (!urlResult.ok) {
        toast.error(t('genericError'));
        return;
      }

      const { path, token } = urlResult.data;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type || 'image/jpeg',
        });

      if (uploadError) {
        toast.error(t('genericError'));
        return;
      }

      const attachResult = await attachJobPhoto(jobId, path, type);
      if (!attachResult.ok) {
        toast.error(t('genericError'));
        return;
      }

      toast.success(t('photoUploaded'));
      router.refresh();
    } catch {
      toast.error(t('genericError'));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full rounded-lg border-dashed border-[var(--cc-line)] text-[var(--cc-ink-soft)] transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('uploading')}
          </>
        ) : (
          <>
            <Camera className="size-4" aria-hidden />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}

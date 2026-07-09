'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { Star, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteReview } from '@/app/actions/admin';

// Reviews moderation table. Each row exposes a destructive "moderate" action
// that opens a confirm dialog and calls deleteReview. Client component for the
// pending state + router.refresh() after a successful delete.

export type AdminReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewerName: string | null;
  proName: string | null;
};

type ReviewsTableProps = {
  reviews: AdminReviewRow[];
  locale: 'en' | 'fr';
};

function fmtDate(iso: string, locale: 'en' | 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function Stars({ rating }: { rating: number }) {
  const t = useTranslations('Admin');
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={t('starsAria', { count: rating })}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'size-3.5 fill-[var(--status-warning)] text-[var(--status-warning)]'
              : 'size-3.5 text-muted-foreground/40'
          }
          aria-hidden
        />
      ))}
    </span>
  );
}

function ModerateButton({ reviewId }: { reviewId: string }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (result.ok) {
        toast.success(t('reviewDeleted'));
        setOpen(false);
        router.refresh();
      } else {
        toast.error(t('genericError'));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" variant="ghost" />}>
        <Trash2 />
        {t('moderate')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
          <DialogDescription>{t('confirmDeleteBody')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            {t('cancel')}
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {isPending ? t('deleting') : t('hideReview')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewsTable({ reviews, locale }: ReviewsTableProps) {
  const t = useTranslations('Admin');

  if (reviews.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('emptyReviews')}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Stars rating={r.rating} />
              <span className="font-mono text-xs text-muted-foreground">
                {fmtDate(r.created_at, locale)}
              </span>
            </div>
            <p className="text-sm">
              {r.comment ?? (
                <span className="text-muted-foreground">{t('noComment')}</span>
              )}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {r.reviewerName ?? t('noName')} → {r.proName ?? t('unassigned')}
              </span>
              <ModerateButton reviewId={r.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colRating')}</TableHead>
              <TableHead>{t('colReview')}</TableHead>
              <TableHead>{t('colReviewer')}</TableHead>
              <TableHead>{t('colPro')}</TableHead>
              <TableHead>{t('created')}</TableHead>
              <TableHead className="text-right">{t('colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Stars rating={r.rating} />
                </TableCell>
                <TableCell className="max-w-xs">
                  <span className="line-clamp-2 text-sm">
                    {r.comment ?? (
                      <span className="text-muted-foreground">
                        {t('noComment')}
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {r.reviewerName ?? t('noName')}
                </TableCell>
                <TableCell className="text-sm">
                  {r.proName ?? t('unassigned')}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {fmtDate(r.created_at, locale)}
                </TableCell>
                <TableCell className="text-right">
                  <ModerateButton reviewId={r.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

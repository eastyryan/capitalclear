'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import { Money } from '@/components/Money';

import { createJob } from '@/app/actions/jobs';
import { getQuote } from '@/lib/pricing/quote';
import {
  isOttawaPostal,
  normalizePostal,
  SERVICE_AREA_NAMES,
} from '@/lib/geo/ottawa';
import type { MoneyLocale } from '@/lib/format/money';
import type { ServiceType } from '@/types/database.types';

// Snow-only product: every booking IS snow removal, done as fast as possible,
// so there is no service-selection step. The date step remains for scheduling
// ahead of an incoming storm.
const TOTAL_STEPS = 5;

/** createJob error code -> Booking.* i18n key. */
const ERROR_KEY: Record<string, string> = {
  outOfArea: 'outOfArea',
  unauthorized: 'errorUnauthorized',
  forbidden: 'errorForbidden',
  invalidInput: 'errorInvalidInput',
  createFailed: 'errorCreateFailed',
  paymentHoldFailed: 'errorPaymentHoldFailed',
};

interface WizardState {
  service: ServiceType | null;
  address: string;
  postal: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
}

const INITIAL: WizardState = {
  service: 'snow_removal',
  address: '',
  postal: '',
  date: '',
  time: '',
  notes: '',
};

/**
 * Combine a date (yyyy-mm-dd) and time (HH:mm) from the native inputs into an
 * ISO-8601 string with offset. The Date is constructed in the browser's local
 * timezone, then serialized to ISO — matching createJob's `.datetime({offset})`
 * Zod contract. Returns null when either field is missing/invalid.
 */
function toISO(date: string, time: string): string | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function BookingWizard() {
  const t = useTranslations('Booking');
  const tc = useTranslations('Common');
  const locale = useLocale() as MoneyLocale;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  function patch(next: Partial<WizardState>) {
    setState((s) => ({ ...s, ...next }));
  }

  // --- Derived validation ---------------------------------------------------
  const postalOk = useMemo(
    () => state.postal.trim().length > 0 && isOttawaPostal(normalizePostal(state.postal)),
    [state.postal],
  );
  const postalDirty = state.postal.trim().length > 0;
  const addressOk = state.address.trim().length > 0;

  const scheduledISO = useMemo(
    () => toISO(state.date, state.time),
    [state.date, state.time],
  );

  const quote = useMemo(
    () =>
      state.service ? getQuote(state.service, scheduledISO ?? undefined) : null,
    [state.service, scheduledISO],
  );

  // Per-step gate for the Continue button.
  function canContinue(): boolean {
    switch (step) {
      case 1:
        return addressOk && postalOk;
      case 2:
        return scheduledISO !== null;
      case 3:
        return true; // notes optional
      case 4:
        return quote !== null;
      default:
        return true;
    }
  }

  const stepTitles = [
    t('stepAddressTitle'),
    t('stepScheduleTitle'),
    t('stepNotesTitle'),
    t('stepReviewTitle'),
    t('stepConfirmTitle'),
  ];

  function next() {
    if (!canContinue()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    if (!state.service || !scheduledISO) return;
    setSubmitting(true);
    const res = await createJob({
      service_type: state.service,
      address: state.address.trim(),
      postal_code: normalizePostal(state.postal),
      scheduled_for: scheduledISO,
      notes: state.notes.trim() ? state.notes.trim() : undefined,
    });
    if (res.ok) {
      toast.success(t('bookingSuccess'));
      router.push('/dashboard');
      return; // keep the spinner up through navigation
    }
    const key = ERROR_KEY[res.error];
    toast.error(key ? t(key) : t('bookingError'));
    setSubmitting(false);
  }

  const scheduledLabel = useMemo(() => {
    if (!scheduledISO) return '';
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(scheduledISO));
  }, [scheduledISO, locale]);

  return (
    <div className="flex min-h-[60vh] flex-col">
      {/* Header + progress */}
      <header className="mb-6">
        <p className="eyebrow mb-1">{t('title')}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {stepTitles[step - 1]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('stepOf', { current: step, total: TOTAL_STEPS })}
        </p>
        <StepDots step={step} total={TOTAL_STEPS} />
      </header>

      {/* Step body */}
      <div className="flex-1">
        {step === 1 && (
          <AddressStep
            address={state.address}
            postal={state.postal}
            addressOk={addressOk}
            postalDirty={postalDirty}
            postalOk={postalOk}
            onAddress={(address) => patch({ address })}
            onPostal={(postal) => patch({ postal })}
          />
        )}

        {step === 2 && (
          <ScheduleStep
            date={state.date}
            time={state.time}
            onDate={(date) => patch({ date })}
            onTime={(time) => patch({ time })}
          />
        )}

        {step === 3 && (
          <NotesStep value={state.notes} onChange={(notes) => patch({ notes })} />
        )}

        {step === 4 && quote && (
          <ReviewStep
            service={state.service!}
            address={state.address.trim()}
            postal={normalizePostal(state.postal)}
            scheduledLabel={scheduledLabel}
            quote={quote}
            locale={locale}
          />
        )}

        {step === 5 && quote && (
          <ConfirmStep
            service={state.service!}
            address={state.address.trim()}
            scheduledLabel={scheduledLabel}
            notes={state.notes.trim()}
            quote={quote}
            locale={locale}
          />
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-11 flex-1"
            onClick={back}
            disabled={step === 1 || submitting}
          >
            <ChevronLeft className="size-4" aria-hidden />
            {tc('back')}
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              className="h-11 flex-1"
              onClick={next}
              disabled={!canContinue()}
            >
              {tc('continue')}
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 flex-1"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden />
                  {t('confirmBooking')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress indicator
// ---------------------------------------------------------------------------

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="mt-4 flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <span
            key={n}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              done && 'bg-primary',
              active && 'bg-primary',
              !done && !active && 'bg-muted',
            )}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Address + postal
// ---------------------------------------------------------------------------

function AddressStep({
  address,
  postal,
  addressOk,
  postalDirty,
  postalOk,
  onAddress,
  onPostal,
}: {
  address: string;
  postal: string;
  addressOk: boolean;
  postalDirty: boolean;
  postalOk: boolean;
  onAddress: (v: string) => void;
  onPostal: (v: string) => void;
}) {
  const t = useTranslations('Booking');
  const showPostalError = postalDirty && !postalOk;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="address">{t('address')}</Label>
        <Input
          id="address"
          name="address"
          autoComplete="street-address"
          value={address}
          onChange={(e) => onAddress(e.target.value)}
          className="h-11"
          placeholder="123 Bank St"
        />
        {!addressOk && address.length > 0 && (
          <p className="text-sm text-[var(--status-danger)]">
            {t('addressRequired')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postal">{t('postalCode')}</Label>
        <Input
          id="postal"
          name="postal"
          autoComplete="postal-code"
          inputMode="text"
          value={postal}
          onChange={(e) => onPostal(e.target.value)}
          className={cn('h-11 uppercase', showPostalError && 'border-[var(--status-danger)]')}
          aria-invalid={showPostalError}
          placeholder="K1A 0B1"
        />
        {showPostalError ? (
          <p className="text-sm text-[var(--status-danger)]">{t('postalInvalid')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('postalHelp')}</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-3">
        <p className="eyebrow mb-1.5">{t('serviceArea')}</p>
        <p className="text-sm text-muted-foreground">
          {SERVICE_AREA_NAMES.join(' · ')}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Date / time
// ---------------------------------------------------------------------------

function ScheduleStep({
  date,
  time,
  onDate,
  onTime,
}: {
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  const t = useTranslations('Booking');
  // Min today (local) so users can't schedule in the past.
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="date">{t('date')}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => onDate(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">{t('time')}</Label>
        <Input
          id="time"
          name="time"
          type="time"
          value={time}
          onChange={(e) => onTime(e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Notes
// ---------------------------------------------------------------------------

function NotesStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations('Booking');
  const tc = useTranslations('Common');
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="notes">{t('notes')}</Label>
        <span className="text-xs text-muted-foreground">{tc('optional')}</span>
      </div>
      <Textarea
        id="notes"
        name="notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder={t('notesPlaceholder')}
        className="resize-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Review (transparent quote)
// ---------------------------------------------------------------------------

function ReviewStep({
  service,
  address,
  postal,
  scheduledLabel,
  quote,
  locale,
}: {
  service: ServiceType;
  address: string;
  postal: string;
  scheduledLabel: string;
  quote: ReturnType<typeof getQuote>;
  locale: MoneyLocale;
}) {
  const t = useTranslations('Booking');

  return (
    <div className="space-y-5">
      {/* Booking summary */}
      <Card className="gap-0 divide-y divide-border p-0">
        <SummaryRow label={t('reviewService')}>
          <ServiceBadge service={service} />
        </SummaryRow>
        <SummaryRow label={t('reviewAddress')}>
          <span className="text-right">
            {address}
            <br />
            <span className="text-muted-foreground">{postal}</span>
          </span>
        </SummaryRow>
        <SummaryRow label={t('reviewSchedule')}>
          <span className="text-right">{scheduledLabel}</span>
        </SummaryRow>
      </Card>

      {/* Transparent quote */}
      <Card className="p-4">
        <p className="eyebrow mb-3">{t('quoteTitle')}</p>
        <dl className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t('basePrice')}</dt>
            <dd>
              <Money cents={quote.baseCents} locale={locale} />
            </dd>
          </div>

          {quote.isWinterSurge && (
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">{t('winterSurge')}</dt>
              <dd className="text-[var(--status-warning)]">
                +<Money cents={quote.totalCents - quote.baseCents} locale={locale} />
              </dd>
            </div>
          )}

          <div className="mt-1 flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>{t('total')}</dt>
            <dd>
              <Money cents={quote.totalCents} locale={locale} className="font-mono" />
            </dd>
          </div>
        </dl>

        {quote.isWinterSurge && (
          <p className="mt-3 text-xs text-muted-foreground">{t('winterSurgeNote')}</p>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6 — Confirm
// ---------------------------------------------------------------------------

function ConfirmStep({
  service,
  address,
  scheduledLabel,
  notes,
  quote,
  locale,
}: {
  service: ServiceType;
  address: string;
  scheduledLabel: string;
  notes: string;
  quote: ReturnType<typeof getQuote>;
  locale: MoneyLocale;
}) {
  const t = useTranslations('Booking');

  return (
    <div className="space-y-5">
      <Card className="gap-0 divide-y divide-border p-0">
        <SummaryRow label={t('reviewService')}>
          <ServiceBadge service={service} />
        </SummaryRow>
        <SummaryRow label={t('reviewAddress')}>
          <span className="text-right">{address}</span>
        </SummaryRow>
        <SummaryRow label={t('reviewSchedule')}>
          <span className="text-right">{scheduledLabel}</span>
        </SummaryRow>
        <SummaryRow label={t('reviewNotes')}>
          <span className="text-right text-muted-foreground">
            {notes || t('noNotes')}
          </span>
        </SummaryRow>
        <SummaryRow label={t('total')}>
          <Money
            cents={quote.totalCents}
            locale={locale}
            className="font-mono text-base font-semibold text-foreground"
          />
        </SummaryRow>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared summary row
// ---------------------------------------------------------------------------

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, Loader2, Zap, CalendarClock } from 'lucide-react';

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
import {
  getSnowQuote,
  snowPackageBaseCents,
  DRIVEWAY_BASE_CENTS,
  WALKWAY_ADDON_CENTS,
  type DrivewaySize,
} from '@/lib/pricing/quote';
import {
  isOttawaPostal,
  normalizePostal,
  SERVICE_AREA_NAMES,
} from '@/lib/geo/ottawa';
import type { MoneyLocale } from '@/lib/format/money';
import type { ServiceType } from '@/types/database.types';

// Snow-only product: every booking IS snow removal, done as fast as possible.
// Step 1 picks the package (driveway size + optional walkway); the schedule
// step remains for booking ahead of an incoming storm.
const TOTAL_STEPS = 6;

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
  size: DrivewaySize | null; // snow package: driveway size
  walkway: boolean; // walkway + steps add-on
  name: string; // guest contact — no account required
  email: string;
  phone: string;
  address: string;
  postal: string;
  asap: boolean; // ASAP is the default — clear as fast as possible
  date: string; // yyyy-mm-dd (only when scheduling for later)
  time: string; // HH:mm
  notes: string;
  agreed: boolean; // liability waiver acceptance
}

const INITIAL: WizardState = {
  service: 'snow_removal',
  size: null,
  walkway: false,
  name: '',
  email: '',
  phone: '',
  address: '',
  postal: '',
  asap: true,
  date: '',
  time: '',
  notes: '',
  agreed: false,
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

export function BookingWizard({
  initialSize = null,
  initialWalkway = false,
  initialAddress = '',
}: {
  // Prefilled from the homepage hero "See prices" form. When a size is passed
  // the package step is already answered, so we open on the details step.
  initialSize?: DrivewaySize | null;
  initialWalkway?: boolean;
  initialAddress?: string;
} = {}) {
  const t = useTranslations('Booking');
  const tc = useTranslations('Common');
  const locale = useLocale() as MoneyLocale;
  const router = useRouter();

  const [step, setStep] = useState(initialSize ? 2 : 1);
  const [state, setState] = useState<WizardState>({
    ...INITIAL,
    size: initialSize,
    walkway: initialWalkway,
    address: initialAddress,
  });
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
  const nameOk = state.name.trim().length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
  const detailsOk = nameOk && emailOk && addressOk && postalOk;

  // When scheduling for later, this is the chosen slot; for ASAP it stays null
  // and the timestamp is stamped at submit time (see `submit`).
  const scheduledISO = useMemo(
    () => (state.asap ? null : toISO(state.date, state.time)),
    [state.asap, state.date, state.time],
  );

  // Effective date drives the quote's winter-surge check — "now" for ASAP.
  const quoteDate = state.asap ? new Date() : scheduledISO;

  const quote = useMemo(
    () =>
      state.size
        ? getSnowQuote({ size: state.size, walkway: state.walkway }, quoteDate ?? undefined)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.size, state.walkway, state.asap, scheduledISO],
  );

  // Per-step gate for the Continue button.
  function canContinue(): boolean {
    switch (step) {
      case 1:
        return state.size !== null;
      case 2:
        return detailsOk;
      case 3:
        return state.asap || scheduledISO !== null;
      case 4:
        return true; // notes optional
      case 5:
        return quote !== null;
      default:
        return true;
    }
  }

  const stepTitles = [
    t('stepPackageTitle'),
    t('stepDetailsTitle'),
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
    if (!state.service || !state.size) return;
    // ASAP stamps the current time; scheduled uses the chosen slot.
    const when = state.asap ? new Date().toISOString() : scheduledISO;
    if (!when) return;
    setSubmitting(true);
    const res = await createJob({
      service_type: state.service,
      driveway_size: state.size,
      walkway: state.walkway,
      contact_name: state.name.trim(),
      contact_email: state.email.trim(),
      contact_phone: state.phone.trim() || undefined,
      agreed_terms: state.agreed,
      address: state.address.trim(),
      postal_code: normalizePostal(state.postal),
      scheduled_for: when,
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
    if (state.asap) return t('asapLabel');
    if (!scheduledISO) return '';
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(scheduledISO));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.asap, scheduledISO, locale]);

  const packageLabel = useMemo(() => {
    if (!state.size) return '';
    const base = state.size === 'double' ? t('pkgDoubleName') : t('pkgSingleName');
    return state.walkway ? `${base} + ${t('pkgWalkwayName')}` : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.size, state.walkway]);

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
          <PackageStep
            size={state.size}
            walkway={state.walkway}
            onSize={(size) => patch({ size })}
            onWalkway={(walkway) => patch({ walkway })}
            locale={locale}
          />
        )}

        {step === 2 && (
          <DetailsStep
            name={state.name}
            email={state.email}
            phone={state.phone}
            address={state.address}
            postal={state.postal}
            nameOk={nameOk}
            emailOk={emailOk}
            addressOk={addressOk}
            postalDirty={postalDirty}
            postalOk={postalOk}
            onName={(name) => patch({ name })}
            onEmail={(email) => patch({ email })}
            onPhone={(phone) => patch({ phone })}
            onAddress={(address) => patch({ address })}
            onPostal={(postal) => patch({ postal })}
          />
        )}

        {step === 3 && (
          <ScheduleStep
            asap={state.asap}
            date={state.date}
            time={state.time}
            onAsap={(asap) => patch({ asap })}
            onDate={(date) => patch({ date })}
            onTime={(time) => patch({ time })}
          />
        )}

        {step === 4 && (
          <NotesStep value={state.notes} onChange={(notes) => patch({ notes })} />
        )}

        {step === 5 && quote && (
          <ReviewStep
            service={state.service!}
            packageLabel={packageLabel}
            address={state.address.trim()}
            postal={normalizePostal(state.postal)}
            scheduledLabel={scheduledLabel}
            quote={quote}
            locale={locale}
          />
        )}

        {step === 6 && quote && (
          <ConfirmStep
            service={state.service!}
            packageLabel={packageLabel}
            name={state.name.trim()}
            address={state.address.trim()}
            scheduledLabel={scheduledLabel}
            notes={state.notes.trim()}
            quote={quote}
            locale={locale}
            agreed={state.agreed}
            onAgree={(agreed) => patch({ agreed })}
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
              disabled={submitting || !state.agreed}
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
// Step 1 — Snow removal package (driveway size + walkway add-on)
// ---------------------------------------------------------------------------

function PackageStep({
  size,
  walkway,
  onSize,
  onWalkway,
  locale,
}: {
  size: DrivewaySize | null;
  walkway: boolean;
  onSize: (s: DrivewaySize) => void;
  onWalkway: (v: boolean) => void;
  locale: MoneyLocale;
}) {
  const t = useTranslations('Booking');
  const sizes: { key: DrivewaySize; name: string; body: string }[] = [
    { key: 'single', name: t('pkgSingleName'), body: t('pkgSingleBody') },
    { key: 'double', name: t('pkgDoubleName'), body: t('pkgDoubleBody') },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3" role="radiogroup" aria-label={t('stepPackageTitle')}>
        {sizes.map((s) => {
          const selected = size === s.key;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSize(s.key)}
              className={cn(
                'flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
                'min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50',
              )}
            >
              <span>
                <span className="text-base font-semibold text-foreground">{s.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{s.body}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <Money
                  cents={DRIVEWAY_BASE_CENTS[s.key]}
                  locale={locale}
                  className="font-mono text-lg font-semibold text-foreground"
                />
                <RadioDot selected={selected} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Walkway add-on toggle */}
      <button
        type="button"
        role="checkbox"
        aria-checked={walkway}
        onClick={() => onWalkway(!walkway)}
        className={cn(
          'flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
          walkway ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50',
        )}
      >
        <span>
          <span className="text-base font-semibold text-foreground">{t('pkgWalkwayName')}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{t('pkgWalkwayBody')}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-lg font-semibold text-foreground">
            +<Money cents={WALKWAY_ADDON_CENTS} locale={locale} />
          </span>
          <span
            className={cn(
              'mt-0.5 flex size-5 items-center justify-center rounded-md border',
              walkway ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
            )}
            aria-hidden
          >
            {walkway && <Check className="size-3.5" />}
          </span>
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Address + postal
// ---------------------------------------------------------------------------

function DetailsStep({
  name,
  email,
  phone,
  address,
  postal,
  nameOk,
  emailOk,
  addressOk,
  postalDirty,
  postalOk,
  onName,
  onEmail,
  onPhone,
  onAddress,
  onPostal,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
  postal: string;
  nameOk: boolean;
  emailOk: boolean;
  addressOk: boolean;
  postalDirty: boolean;
  postalOk: boolean;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onAddress: (v: string) => void;
  onPostal: (v: string) => void;
}) {
  const t = useTranslations('Booking');
  const tc = useTranslations('Common');
  const showPostalError = postalDirty && !postalOk;
  const showEmailError = email.trim().length > 0 && !emailOk;

  return (
    <div className="space-y-5">
      {/* No account needed — guest contact details */}
      <p className="rounded-lg border border-border bg-[var(--brand-50)] px-3.5 py-3 text-sm text-muted-foreground">
        {t('guestNote')}
      </p>

      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          className="h-11"
          placeholder="Jane Doe"
        />
        {!nameOk && name.length > 0 && (
          <p className="text-sm text-[var(--status-danger)]">{t('nameRequired')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          className={cn('h-11', showEmailError && 'border-[var(--status-danger)]')}
          aria-invalid={showEmailError}
          placeholder="jane@example.com"
        />
        {showEmailError && (
          <p className="text-sm text-[var(--status-danger)]">{t('emailInvalid')}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone">{t('phone')}</Label>
          <span className="text-xs text-muted-foreground">{tc('optional')}</span>
        </div>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          className="h-11"
          placeholder="613 555 0199"
        />
      </div>

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
// Step 2 — Timing: ASAP (default) or schedule a specific date/time
// ---------------------------------------------------------------------------

function ScheduleStep({
  asap,
  date,
  time,
  onAsap,
  onDate,
  onTime,
}: {
  asap: boolean;
  date: string;
  time: string;
  onAsap: (v: boolean) => void;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  const t = useTranslations('Booking');
  // Min today (local) so users can't schedule in the past.
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-3">
      {/* ASAP — the default, matching the "cleared as fast as possible" model */}
      <button
        type="button"
        role="radio"
        aria-checked={asap}
        onClick={() => onAsap(true)}
        className={cn(
          'flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
          'min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          asap ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50',
        )}
      >
        <span>
          <span className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Zap className="size-5 text-primary" aria-hidden />
            {t('asapTitle')}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{t('asapBody')}</span>
        </span>
        <RadioDot selected={asap} />
      </button>

      {/* Schedule for later — expands the native date/time inputs when chosen */}
      <button
        type="button"
        role="radio"
        aria-checked={!asap}
        onClick={() => onAsap(false)}
        className={cn(
          'flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
          'min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !asap ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50',
        )}
      >
        <span>
          <span className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarClock className="size-5 text-primary" aria-hidden />
            {t('scheduleLaterTitle')}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {t('scheduleLaterBody')}
          </span>
        </span>
        <RadioDot selected={!asap} />
      </button>

      {!asap && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-4">
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
      )}
    </div>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
      )}
      aria-hidden
    >
      {selected && <Check className="size-3.5" />}
    </span>
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
  packageLabel,
  address,
  postal,
  scheduledLabel,
  quote,
  locale,
}: {
  service: ServiceType;
  packageLabel: string;
  address: string;
  postal: string;
  scheduledLabel: string;
  quote: ReturnType<typeof getSnowQuote>;
  locale: MoneyLocale;
}) {
  const t = useTranslations('Booking');

  return (
    <div className="space-y-5">
      {/* Booking summary */}
      <Card className="gap-0 divide-y divide-border p-0">
        <SummaryRow label={t('reviewService')}>
          <div className="flex flex-col items-end gap-1">
            <ServiceBadge service={service} />
            <span className="text-muted-foreground">{packageLabel}</span>
          </div>
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
                +<Money cents={quote.subtotalCents - quote.baseCents} locale={locale} />
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm">
            <dt className="text-muted-foreground">{t('subtotal')}</dt>
            <dd>
              <Money cents={quote.subtotalCents} locale={locale} />
            </dd>
          </div>

          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t('hst')}</dt>
            <dd>
              <Money cents={quote.taxCents} locale={locale} />
            </dd>
          </div>

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
  packageLabel,
  name,
  address,
  scheduledLabel,
  notes,
  quote,
  locale,
  agreed,
  onAgree,
}: {
  service: ServiceType;
  packageLabel: string;
  name: string;
  address: string;
  scheduledLabel: string;
  notes: string;
  quote: ReturnType<typeof getSnowQuote>;
  locale: MoneyLocale;
  agreed: boolean;
  onAgree: (v: boolean) => void;
}) {
  const t = useTranslations('Booking');

  return (
    <div className="space-y-5">
      <Card className="gap-0 divide-y divide-border p-0">
        <SummaryRow label={t('reviewService')}>
          <div className="flex flex-col items-end gap-1">
            <ServiceBadge service={service} />
            <span className="text-muted-foreground">{packageLabel}</span>
          </div>
        </SummaryRow>
        <SummaryRow label={t('reviewName')}>
          <span className="text-right">{name}</span>
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

      {/* Liability waiver — must be accepted to confirm */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="eyebrow mb-2">{t('liabilityTitle')}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('liabilityBody')}</p>
        <button
          type="button"
          role="checkbox"
          aria-checked={agreed}
          onClick={() => onAgree(!agreed)}
          className="mt-4 flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border',
              agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
            )}
            aria-hidden
          >
            {agreed && <Check className="size-3.5" />}
          </span>
          <span className="text-sm font-medium text-foreground">{t('liabilityAgree')}</span>
        </button>
      </div>
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

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { ArrowSlide } from '@/components/marketing/parts';

// Shared field recipes — h-12 rounded-lg, paper-white fill, accent focus ring.
const inputClass =
  'h-12 w-full rounded-lg border border-[var(--cc-line)] bg-white/70 px-3.5 text-base text-[var(--cc-ink)] outline-none transition-shadow duration-150 placeholder:text-[var(--cc-ink-soft)] focus:shadow-[0_0_0_2px_var(--cc-accent)] motion-reduce:transition-none';
const textareaClass =
  'w-full rounded-lg border border-[var(--cc-line)] bg-white/70 px-3.5 py-3 text-base text-[var(--cc-ink)] outline-none transition-shadow duration-150 placeholder:text-[var(--cc-ink-soft)] focus:shadow-[0_0_0_2px_var(--cc-accent)] motion-reduce:transition-none';
const labelClass =
  'font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]';

/**
 * Contact form — client component. The MVP has no contact backend, so this
 * validates locally and confirms with a toast (mirrors the app's
 * `PAYMENTS_MODE=simulated` philosophy). Drop a server action / API route in
 * `onSubmit` to wire real delivery later.
 */
export function ContactForm() {
  const t = useTranslations('Contact');
  const [submitted, setSubmitted] = useState(false);

  const schema = z.object({
    name: z.string().min(2, t('errName')),
    email: z.string().email(t('errEmail')),
    message: z.string().min(10, t('errMessage'))
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(_values: Values) {
    // Simulate a network round-trip; no backend in the MVP.
    await new Promise((r) => setTimeout(r, 700));
    toast.success(t('successTitle'), { description: t('successBody') });
    reset();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className={labelClass}>
          {t('name')}
        </label>
        <input id="name" autoComplete="name" className={inputClass} {...register('name')} />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className={labelClass}>
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className={labelClass}>
          {t('message')}
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          className={textareaClass}
          {...register('message')}
        />
        {errors.message ? (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--cc-accent)] px-5 py-3 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {t('sending')}
          </>
        ) : (
          <>
            {submitted ? t('sendAgain') : t('send')} <ArrowSlide />
          </>
        )}
      </button>
    </form>
  );
}

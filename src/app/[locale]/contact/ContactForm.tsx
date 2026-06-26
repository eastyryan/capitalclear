'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        <Label htmlFor="name" className="font-barlow text-foreground">
          {t('name')}
        </Label>
        <Input id="name" autoComplete="name" {...register('name')} />
        {errors.name ? (
          <p className="font-barlow text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-barlow text-foreground">
          {t('email')}
        </Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email ? (
          <p className="font-barlow text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="font-barlow text-foreground">
          {t('message')}
        </Label>
        <Textarea
          id="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          {...register('message')}
        />
        {errors.message ? (
          <p className="font-barlow text-xs text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-gradient-ember inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-barlow text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {t('sending')}
          </>
        ) : (
          <>
            {submitted ? t('sendAgain') : t('send')} <ArrowUpRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}

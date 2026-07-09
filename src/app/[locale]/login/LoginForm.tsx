'use client';

import { useState, useTransition } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter, Link } from '@/i18n/navigation';
import { signIn } from '@/app/actions/auth';

// Client login form. Validates with zod, calls the `signIn` server action, and
// on success routes to the correct dashboard based on the returned role.
// Mobile-first: 48px touch targets, sticky submit on small screens.

const inputClass =
  'h-12 w-full rounded-lg border border-[var(--cc-line)] bg-white/70 px-3.5 text-base text-[var(--cc-ink)] outline-none transition-shadow duration-150 placeholder:text-[var(--cc-ink-soft)] focus:shadow-[0_0_0_2px_var(--cc-accent)] motion-reduce:transition-none';
const labelClass =
  'font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]';

export function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().trim().email({ message: t('invalidEmail') }),
    password: z.string().min(1, { message: t('invalidCredentials') }),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // @hookform/resolvers@5.4.0 ships zod 4.0.x core type tags that don't unify
    // with the installed zod 4.4.3 (the `_zod.version.minor` mismatch). The
    // cast is structurally safe — the runtime resolver is unchanged.
    resolver: zodResolver(
      schema as unknown as Parameters<typeof zodResolver>[0]
    ) as unknown as Resolver<FormValues>,
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn(values);
      if (!result.ok) {
        const message = t(result.error as Parameters<typeof t>[0]);
        setServerError(message);
        toast.error(message);
        return;
      }
      const dest =
        result.data.role === 'pro'
          ? '/pro'
          : result.data.role === 'admin'
            ? '/admin'
            : '/dashboard';
      router.push(dest);
    });
  };

  return (
    <div className="w-full rounded-xl border border-[var(--cc-line)] bg-white/60 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tighter text-[var(--cc-ink)]">
        {t('loginTitle')}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
        {t('loginSubtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('emailPlaceholder')}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className={labelClass}>
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className={inputClass}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="sticky bottom-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--cc-accent)] px-5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none"
        >
          {isPending ? t('signingIn') : t('signInCta')}
        </button>
      </form>

      <p className="mt-6 border-t border-[var(--cc-line)] pt-5 text-center font-mono text-xs text-[var(--cc-ink-soft)]">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-[var(--cc-accent)] underline-offset-4 hover:underline"
        >
          {t('registerHere')}
        </Link>
      </p>
    </div>
  );
}

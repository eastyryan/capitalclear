'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { signUp, signIn } from '@/app/actions/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Client registration form. Role is a segmented toggle (homeowner / pro) that
// honors ?role=pro from the URL. Language preference is a Select. On success we
// rely on email-confirmation being OFF (demo): signUp returns a live session,
// so we route straight to the role's dashboard. As a belt-and-suspenders step
// we also attempt signIn (no-op if already signed in) before redirecting.

const inputClass =
  'h-12 w-full rounded-lg border border-[var(--cc-line)] bg-white/70 px-3.5 text-base text-[var(--cc-ink)] outline-none transition-shadow duration-150 placeholder:text-[var(--cc-ink-soft)] focus:shadow-[0_0_0_2px_var(--cc-accent)] motion-reduce:transition-none';
const labelClass =
  'font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]';

export function RegisterForm() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialRole = searchParams.get('role') === 'pro' ? 'pro' : 'homeowner';

  const schema = z.object({
    role: z.enum(['homeowner', 'pro']),
    preferredLanguage: z.enum(['en', 'fr']),
    fullName: z.string().trim().min(1, { message: t('fullNameRequired') }),
    email: z.string().trim().email({ message: t('invalidEmail') }),
    password: z.string().min(8, { message: t('passwordTooShort') }),
    phone: z.string().trim().optional(),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // @hookform/resolvers@5.4.0 ships zod 4.0.x core type tags that don't unify
    // with the installed zod 4.4.3 (the `_zod.version.minor` mismatch). The
    // cast is structurally safe — the runtime resolver is unchanged.
    resolver: zodResolver(
      schema as unknown as Parameters<typeof zodResolver>[0]
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      role: initialRole,
      preferredLanguage: locale === 'fr' ? 'fr' : 'en',
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const role = useWatch({ control, name: 'role' });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signUp(values);
      if (!result.ok) {
        const message = t(result.error as Parameters<typeof t>[0]);
        setServerError(message);
        toast.error(message);
        return;
      }

      toast.success(t('signupSuccess'));

      // Email confirmation is OFF for the demo, so a session already exists.
      // Confirm we have one (harmless if redundant) then route by role.
      await signIn({ email: values.email, password: values.password });

      const dest = values.role === 'pro' ? '/pro' : '/dashboard';
      router.push(dest);
    });
  };

  const roleOptions = [
    { value: 'homeowner' as const, label: t('roleHomeowner') },
    { value: 'pro' as const, label: t('rolePro') },
  ];

  return (
    <div className="w-full rounded-xl border border-[var(--cc-line)] bg-white/60 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tighter text-[var(--cc-ink)]">
        {t('registerTitle')}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
        {t('registerSubtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        {/* Role toggle — segmented buttons */}
        <div className="flex flex-col gap-2">
          <span className={labelClass}>{t('role')}</span>
          <div
            role="radiogroup"
            aria-label={t('role')}
            className="grid grid-cols-2 gap-2"
          >
            {roleOptions.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setValue('role', opt.value)}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none',
                    selected
                      ? 'border-[var(--cc-accent)] bg-[var(--cc-accent)] text-[var(--cc-accent-ink)]'
                      : 'border-[var(--cc-line)] bg-transparent text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className={labelClass}>
            {t('fullName')}
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            aria-invalid={!!errors.fullName}
            className={inputClass}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className={labelClass}>
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className={inputClass}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : (
            <p className="font-mono text-[11px] text-[var(--cc-ink-soft)]">
              {t('passwordHint')}
            </p>
          )}
        </div>

        {/* Phone (optional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>
            {t('phone')}{' '}
            <span className="normal-case text-[var(--cc-ink-soft)]">
              ({t('phonePlaceholder')})
            </span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={t('phonePlaceholder')}
            className={inputClass}
            {...register('phone')}
          />
        </div>

        {/* Language preference */}
        <div className="flex flex-col gap-2">
          <label htmlFor="preferredLanguage" className={labelClass}>
            {t('preferredLanguage')}
          </label>
          <Controller
            control={control}
            name="preferredLanguage"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger
                  id="preferredLanguage"
                  className="h-12 w-full rounded-lg border-[var(--cc-line)] bg-white/70"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('langEnglish')}</SelectItem>
                  <SelectItem value="fr">{t('langFrench')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
          {isPending ? t('signingUp') : t('signUpCta')}
        </button>
      </form>

      <p className="mt-6 border-t border-[var(--cc-line)] pt-5 text-center font-mono text-xs text-[var(--cc-ink-soft)]">
        {t('haveAccount')}{' '}
        <Link
          href="/login"
          className="font-medium text-[var(--cc-accent)] underline-offset-4 hover:underline"
        >
          {t('loginHere')}
        </Link>
      </p>
    </div>
  );
}

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Client registration form. Role is a segmented toggle (homeowner / pro) that
// honors ?role=pro from the URL. Language preference is a Select. On success we
// rely on email-confirmation being OFF (demo): signUp returns a live session,
// so we route straight to the role's dashboard. As a belt-and-suspenders step
// we also attempt signIn (no-op if already signed in) before redirecting.

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{t('registerTitle')}</CardTitle>
        <CardDescription>{t('registerSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {/* Role toggle */}
          <div className="flex flex-col gap-2">
            <Label>{t('role')}</Label>
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
                      'flex h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-transparent text-foreground hover:bg-muted'
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
            <Label htmlFor="fullName">{t('fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder={t('fullNamePlaceholder')}
              aria-invalid={!!errors.fullName}
              className="h-11"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t('emailPlaceholder')}
              aria-invalid={!!errors.email}
              className="h-11"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="h-11"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('passwordHint')}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              {t('phone')}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                ({t('phonePlaceholder')})
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder={t('phonePlaceholder')}
              className="h-11"
              {...register('phone')}
            />
          </div>

          {/* Language preference */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="preferredLanguage">{t('preferredLanguage')}</Label>
            <Controller
              control={control}
              name="preferredLanguage"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="preferredLanguage" className="h-11 w-full">
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

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="sticky bottom-4 h-11 w-full"
          >
            {isPending ? t('signingUp') : t('signUpCta')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('loginHere')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

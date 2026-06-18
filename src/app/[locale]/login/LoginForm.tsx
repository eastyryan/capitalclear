'use client';

import { useState, useTransition } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter, Link } from '@/i18n/navigation';
import { signIn } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Client login form. Validates with zod, calls the `signIn` server action, and
// on success routes to the correct dashboard based on the returned role.
// Mobile-first: 44px touch targets, sticky submit on small screens.

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="h-11"
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

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="sticky bottom-4 h-11 w-full"
          >
            {isPending ? t('signingIn') : t('signInCta')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('registerHere')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Snowflake, Scissors, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/types/database.types';

const ICON: Record<ServiceType, typeof Snowflake> = {
  snow_removal: Snowflake,
  lawn_mowing: Scissors,
  seasonal_maintenance: Leaf,
};

export function ServiceBadge({
  service,
  className,
}: {
  service: ServiceType;
  className?: string;
}) {
  const t = useTranslations('Services');
  const Icon = ICON[service];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {t(service)}
    </span>
  );
}

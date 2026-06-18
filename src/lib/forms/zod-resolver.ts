import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Wraps `zodResolver` to bridge a type-identity skew between the installed zod
 * (4.4.3) and the build `@hookform/resolvers@5.4.0` was compiled against
 * (its internal `_zod.version` tags don't unify). Runtime behaviour is
 * identical — this just yields a clean `Resolver<T>` so forms don't each need
 * an inline cast. Use `zodForm(schema)` in place of `zodResolver(schema)`.
 */
export function zodForm<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return zodResolver(schema as never) as unknown as Resolver<T>;
}

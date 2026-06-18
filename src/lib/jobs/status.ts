import type { JobStatus, ServiceType } from '@/types/database.types';

// Job lifecycle state machine. The canonical set of legal transitions lives
// here and is enforced both in Server Actions and reflected in the UI.

/** Allowed next states for each job status. Empty array = terminal state. */
export const LEGAL_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['posted', 'cancelled'],
  posted: ['accepted', 'cancelled'],
  accepted: ['en_route', 'cancelled'],
  en_route: ['in_progress', 'cancelled'],
  in_progress: ['awaiting_approval'],
  awaiting_approval: ['completed'],
  completed: [],
  cancelled: [],
};

/** True if `to` is a legal next state from `from`. */
export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

/** Statuses from which a job may still be cancelled. */
export function isCancellable(status: JobStatus): boolean {
  return (
    status === 'draft' ||
    status === 'posted' ||
    status === 'accepted' ||
    status === 'en_route'
  );
}

/**
 * Maps each status to a semantic color token (CSS variable suffix) used by
 * the status badge component.
 */
export const STATUS_COLOR_VAR: Record<JobStatus, string> = {
  draft: 'muted',
  posted: 'info',
  accepted: 'info',
  en_route: 'warning',
  in_progress: 'warning',
  awaiting_approval: 'violet',
  completed: 'success',
  cancelled: 'danger',
};

/** i18n key for each job status label. */
export const STATUS_LABEL_KEY: Record<JobStatus, string> = {
  draft: 'JobStatus.draft',
  posted: 'JobStatus.posted',
  accepted: 'JobStatus.accepted',
  en_route: 'JobStatus.en_route',
  in_progress: 'JobStatus.in_progress',
  awaiting_approval: 'JobStatus.awaiting_approval',
  completed: 'JobStatus.completed',
  cancelled: 'JobStatus.cancelled',
};

/** i18n key for each service type label. */
export const SERVICE_LABEL_KEY: Record<ServiceType, string> = {
  snow_removal: 'Services.snow_removal',
  lawn_mowing: 'Services.lawn_mowing',
  seasonal_maintenance: 'Services.seasonal_maintenance',
};

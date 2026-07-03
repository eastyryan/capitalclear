import type { Job } from '@/types/database.types';
import type { AdminJobRow } from '../(admin)/admin/_components/JobsTable';
import type { AdminUserRow } from '../(admin)/admin/_components/UsersTable';
import type { AdminReviewRow } from '../(admin)/admin/_components/ReviewsTable';
import type { AdminPaymentRow } from '../(admin)/admin/_components/PaymentsTable';

/**
 * Throwaway sample data for the /demo preview of the authenticated app.
 * Lets the dashboards render with no Supabase backend and no login. Snow-only,
 * Ottawa addresses. Not used by the real (auth-guarded) pages.
 */

// Pro-card / feed shape: the subset the cards actually read.
type FeedJob = Pick<
  Job,
  | 'id'
  | 'service_type'
  | 'status'
  | 'address'
  | 'postal_code'
  | 'scheduled_for'
  | 'quoted_price_cents'
  | 'final_price_cents'
>;

const feed = (
  id: string,
  status: FeedJob['status'],
  address: string,
  postal_code: string,
  scheduled_for: string | null,
  quoted: number,
  final: number | null = null
): FeedJob => ({
  id,
  service_type: 'snow_removal',
  status,
  address,
  postal_code,
  scheduled_for,
  quoted_price_cents: quoted,
  final_price_cents: final
});

// ---- Homeowner dashboard ----
export const HOMEOWNER_JOBS = [
  feed('h1', 'awaiting_approval', '212 Holland Ave', 'K1Y 0Y4', '2026-02-12T06:30:00-05:00', 5500),
  feed('h2', 'in_progress', '88 Riverside Dr', 'K1H 7X5', '2026-02-13T05:00:00-05:00', 4500),
  feed('h3', 'accepted', '15 Sweetland Ave', 'K1N 7T7', '2026-02-14T04:30:00-05:00', 4500),
  feed('h4', 'completed', '4500 Innes Rd', 'K4A 3W3', '2026-02-02T06:00:00-05:00', 5500, 5500),
  feed('h5', 'cancelled', '1235 Bank St', 'K1S 3Y3', '2026-01-28T06:00:00-05:00', 4500)
] as unknown as Job[];

// ---- Pro dashboard ----
export const PRO_AVAILABLE: FeedJob[] = [
  feed('p1', 'posted', '63 Clarey Ave', 'K1S 2R7', '2026-02-12T05:00:00-05:00', 4500),
  feed('p2', 'posted', '300 Kanata Ave', 'K2T 1V7', '2026-02-12T05:30:00-05:00', 5500),
  feed('p3', 'posted', '99 Barrhaven Dr', 'K2J 4R1', '2026-02-12T06:00:00-05:00', 4500)
];
export const PRO_ACTIVE: FeedJob[] = [
  feed('p4', 'en_route', '21 Orleans Blvd', 'K1C 2K8', '2026-02-12T04:30:00-05:00', 5500),
  feed('p5', 'in_progress', '7 Stittsville Main St', 'K2S 1A1', '2026-02-12T05:00:00-05:00', 4500)
];
export const PRO_COMPLETED: FeedJob[] = [
  feed('p6', 'completed', '140 Nepean St', 'K2P 0B4', '2026-02-08T06:00:00-05:00', 4500, 4500),
  feed('p7', 'completed', '55 ByWard Market Sq', 'K1N 9C3', '2026-02-06T05:30:00-05:00', 5500, 5500),
  feed('p8', 'completed', '90 Wellington St', 'K1A 0A6', '2026-02-04T06:00:00-05:00', 4500, 4950)
];
export const PRO_EARNINGS = {
  heldCents: PRO_ACTIVE.reduce((s, j) => s + (j.quoted_price_cents ?? 0), 0),
  releasedCents: PRO_COMPLETED.reduce((s, j) => s + (j.final_price_cents ?? j.quoted_price_cents ?? 0), 0),
  jobsCompleted: 37,
  ratingAvg: 4.8
};

// ---- Admin console ----
export const ADMIN_KPIS = { jobs: 128, users: 86, pros: 14, revenueCents: 372_000 };

/** Subcontractor company behind each pro account. */
export const ADMIN_PRO_COMPANIES: Record<string, string> = {
  u2: 'Lefebvre Snow Co.',
  u4: 'Gallagher Property Services',
  u6: 'Volkov Winter Services'
};

// Pro names carry their company so the Jobs table shows which subcontractor
// did the work at a glance.
export const ADMIN_NAMES: Record<string, { full_name: string | null; email: string | null }> = {
  u1: { full_name: 'Sarah Tremblay', email: 'sarah.t@example.com' },
  u2: { full_name: 'Marc Lefebvre · Lefebvre Snow Co.', email: 'marc.l@example.com' },
  u3: { full_name: 'Priya Sharma', email: 'priya.s@example.com' },
  u4: { full_name: 'Owen Gallagher · Gallagher Property Services', email: 'owen.g@example.com' },
  u5: { full_name: 'Demo Admin', email: 'admin@capitalclear.ca' },
  u6: { full_name: 'Dmitri Volkov · Volkov Winter Services', email: 'dmitri.v@example.com' }
};

export const ADMIN_JOBS: AdminJobRow[] = [
  { id: 'j1', service_type: 'snow_removal', status: 'completed', homeowner_id: 'u1', pro_id: 'u2', final_price_cents: 5500, quoted_price_cents: 5500, created_at: '2026-02-08T11:00:00Z' },
  { id: 'j2', service_type: 'snow_removal', status: 'in_progress', homeowner_id: 'u3', pro_id: 'u4', final_price_cents: null, quoted_price_cents: 4500, created_at: '2026-02-12T10:00:00Z' },
  { id: 'j3', service_type: 'snow_removal', status: 'posted', homeowner_id: 'u1', pro_id: null, final_price_cents: null, quoted_price_cents: 4500, created_at: '2026-02-12T09:30:00Z' },
  { id: 'j4', service_type: 'snow_removal', status: 'awaiting_approval', homeowner_id: 'u3', pro_id: 'u2', final_price_cents: null, quoted_price_cents: 5500, created_at: '2026-02-11T22:00:00Z' },
  { id: 'j5', service_type: 'snow_removal', status: 'cancelled', homeowner_id: 'u1', pro_id: null, final_price_cents: null, quoted_price_cents: 4500, created_at: '2026-02-09T14:00:00Z' },
  { id: 'j6', service_type: 'snow_removal', status: 'completed', homeowner_id: 'u3', pro_id: 'u6', final_price_cents: 4500, quoted_price_cents: 4500, created_at: '2026-02-07T09:00:00Z' },
  { id: 'j7', service_type: 'snow_removal', status: 'completed', homeowner_id: 'u1', pro_id: 'u6', final_price_cents: 5500, quoted_price_cents: 5500, created_at: '2026-02-05T08:30:00Z' },
  { id: 'j8', service_type: 'snow_removal', status: 'completed', homeowner_id: 'u3', pro_id: 'u4', final_price_cents: 4500, quoted_price_cents: 4500, created_at: '2026-02-03T07:45:00Z' }
];

export const ADMIN_USERS: AdminUserRow[] = [
  { id: 'u1', full_name: 'Sarah Tremblay', email: 'sarah.t@example.com', role: 'homeowner', created_at: '2026-01-15T12:00:00Z', isPro: false, verified: null },
  { id: 'u2', full_name: 'Marc Lefebvre · Lefebvre Snow Co.', email: 'marc.l@example.com', role: 'pro', created_at: '2026-01-10T12:00:00Z', isPro: true, verified: true },
  { id: 'u3', full_name: 'Priya Sharma', email: 'priya.s@example.com', role: 'homeowner', created_at: '2026-01-20T12:00:00Z', isPro: false, verified: null },
  { id: 'u4', full_name: 'Owen Gallagher · Gallagher Property Services', email: 'owen.g@example.com', role: 'pro', created_at: '2026-01-12T12:00:00Z', isPro: true, verified: false },
  { id: 'u5', full_name: 'Demo Admin', email: 'admin@capitalclear.ca', role: 'admin', created_at: '2026-01-05T12:00:00Z', isPro: false, verified: null },
  { id: 'u6', full_name: 'Dmitri Volkov · Volkov Winter Services', email: 'dmitri.v@example.com', role: 'pro', created_at: '2026-01-18T12:00:00Z', isPro: true, verified: true }
];

export const ADMIN_REVIEWS: AdminReviewRow[] = [
  { id: 'r1', rating: 5, comment: 'Driveway cleared before I woke up. Incredible.', created_at: '2026-02-09T13:00:00Z', reviewerName: 'Sarah Tremblay', proName: 'Marc Lefebvre' },
  { id: 'r2', rating: 4, comment: 'Fast and tidy, did the steps too.', created_at: '2026-02-07T13:00:00Z', reviewerName: 'Priya Sharma', proName: 'Marc Lefebvre' },
  { id: 'r3', rating: 5, comment: null, created_at: '2026-02-05T13:00:00Z', reviewerName: 'Owen Gallagher', proName: 'Marc Lefebvre' }
];

export const ADMIN_PAYMENTS: AdminPaymentRow[] = [
  { id: 'pay1', job_id: 'j1', amount_cents: 5500, status: 'released', created_at: '2026-02-08T12:00:00Z' },
  { id: 'pay2', job_id: 'j2', amount_cents: 4500, status: 'authorized', created_at: '2026-02-12T10:05:00Z' },
  { id: 'pay3', job_id: 'j4', amount_cents: 5500, status: 'authorized', created_at: '2026-02-11T22:05:00Z' },
  { id: 'pay4', job_id: 'j5', amount_cents: 4500, status: 'none', created_at: '2026-02-09T14:05:00Z' },
  { id: 'pay5', job_id: 'j6', amount_cents: 4500, status: 'released', created_at: '2026-02-07T10:00:00Z' },
  { id: 'pay6', job_id: 'j7', amount_cents: 5500, status: 'released', created_at: '2026-02-05T09:30:00Z' },
  { id: 'pay7', job_id: 'j8', amount_cents: 4500, status: 'released', created_at: '2026-02-03T08:30:00Z' }
];

// Per-subcontractor rating snapshots for the admin Pros rollup.
export const ADMIN_PRO_STATS: Record<string, { ratingAvg: number | null }> = {
  u2: { ratingAvg: 4.8 },
  u4: { ratingAvg: 4.5 },
  u6: { ratingAvg: 4.9 }
};

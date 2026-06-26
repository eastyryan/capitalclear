/**
 * Hotlinked stock photography (Pexels, free to use). Snow-removal themed.
 * `px(id, w)` builds a compressed, width-capped CDN URL.
 */
const px = (id: number, w = 1280) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}`;

export const PHOTOS = {
  /** Dusk plow truck with headlights in heavy snowfall — hero. */
  hero: px(35826492, 1920),
  /** Grader clearing a downtown city street in snow. */
  cityPlow: px(10885729, 1280),
  /** Person clearing a residential driveway with a snow shovel. */
  driveway: px(6952498, 1080),
  /** Resident running a snowblower along a townhouse walkway. */
  snowblower: px(10885790, 1080),
  /** Plow truck throwing snow off a winter road. */
  roadPlow: px(13603742, 1280)
} as const;

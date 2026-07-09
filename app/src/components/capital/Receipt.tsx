import type { Provider, Season, Service } from "../../lib/capital/data";
import { HST_RATE, SEASON_COPY } from "../../lib/capital/data";

/**
 * Receipt (board 5): quiet centered card, the oversized price numeral as the
 * page's one structural numeral, and the 85/15 line. The "New request" CTA is
 * the full-width band whose grade shifts on hover.
 */
export function Receipt({
  season,
  provider,
  service,
  price,
  completedAt,
  onReset,
}: {
  season: Season;
  provider: Provider;
  service: Service;
  price: number;
  completedAt: string;
  onReset: () => void;
}) {
  const hst = Math.round(price * HST_RATE * 100) / 100;
  const total = price + hst;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-[var(--cc-paper)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="border border-[var(--cc-ink)]">
          <div className="px-8 pt-8 text-center">
            <img
              src="/assets/vignette-done.webp"
              alt=""
              aria-hidden
              className="cc-vignette mx-auto h-20 object-contain mix-blend-multiply"
              draggable={false}
            />
            <p className="mt-4 font-[family-name:var(--cc-font-mono)] text-sm text-[var(--cc-ink-soft)]">
              {service.name}, completed {completedAt}
            </p>
            <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{SEASON_COPY[season].doneLine}</p>
            <p className="mt-2 font-[family-name:var(--cc-font-mono)] text-8xl tracking-tighter">
              ${total.toFixed(2)}
            </p>
            <p className="mt-2 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
              Subtotal ${price}
              <span aria-hidden className="px-1.5">·</span>
              HST 13% ${hst.toFixed(2)}
            </p>
            <hr className="mt-6 border-[var(--cc-line)]" />
            <p className="py-5 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
              {provider.name} keeps 85 percent.
              <br />
              CapitalClear runs on 15 percent.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="block min-h-[52px] w-full bg-[var(--cc-ink)] py-4 text-center text-base font-medium text-[var(--cc-paper)] transition-colors duration-300 hover:bg-[var(--cc-accent)] hover:text-[var(--cc-accent-ink)] active:translate-y-[1px] motion-reduce:transition-none"
          >
            Book another clearing
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-[var(--cc-ink-soft)]">
          Snowed in again? It takes one tap.
        </p>
        <p className="mt-2 text-center font-[family-name:var(--cc-font-mono)] text-[11px] text-[var(--cc-ink-soft)]">
          Demo with sample providers. No payment was made.
        </p>
      </div>
    </div>
  );
}

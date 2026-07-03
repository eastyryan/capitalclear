'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Address type-ahead. As the user types (debounced), it queries the free,
 * no-API-key Photon geocoder (OpenStreetMap data), biased to Ottawa, and shows
 * a suggestion dropdown. Picking a suggestion fills the street address and,
 * when available, the postal code and city. Typing manually always works — the
 * input stays fully controlled by `value`/`onChange`.
 *
 * For production-grade coverage you can later swap the fetch for Google Places
 * or Mapbox (both need an API key); the component contract stays the same.
 */

export interface AddressSelection {
  address: string;
  postal: string | null;
  city: string | null;
}

interface Suggestion extends AddressSelection {
  label: string;
}

// Ottawa city centre — biases results toward the service area.
const OTTAWA = { lat: 45.4215, lon: -75.6972 };

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  ariaLabel,
  fieldClassName,
  inputClassName,
  leading,
  trailing,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (sel: AddressSelection) => void;
  placeholder?: string;
  ariaLabel?: string;
  fieldClassName?: string;
  inputClassName?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  // Set true only when the change came from the user typing, so selecting a
  // suggestion (which also calls onChange) doesn't immediately refetch.
  const typingRef = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (!typingRef.current) return;
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url =
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
          `&limit=6&lang=en&lat=${OTTAWA.lat}&lon=${OTTAWA.lon}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const items: Suggestion[] = (data.features ?? [])
          .map((f: { properties: Record<string, string> }) => {
            const p = f.properties;
            const line1 = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
            const address = line1 || p.name || '';
            const label = [address, p.city, p.state].filter(Boolean).join(', ');
            return {
              address,
              postal: p.postcode ?? null,
              city: p.city ?? null,
              label,
              cc: p.countrycode,
            };
          })
          .filter((i: Suggestion & { cc?: string }) => i.cc === 'CA' && i.address)
          .slice(0, 6);
        setSuggestions(items);
        setOpen(items.length > 0);
        setActive(-1);
      } catch {
        // Network/geocoder hiccup — fall back silently to manual entry.
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  function choose(s: Suggestion) {
    typingRef.current = false;
    onChange(s.address);
    onSelect({ address: s.address, postal: s.postal, city: s.city });
    setSuggestions([]);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className={fieldClassName}>
        {leading}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            typingRef.current = true;
            onChange(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          className={inputClassName}
        />
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden /> : trailing}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-[0_10px_30px_rgba(11,42,74,.18)]"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                // onMouseDown (not onClick) so it fires before the input blur
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex w-full items-start gap-2.5 px-4 py-2.5 text-left',
                  i === active ? 'bg-[var(--brand-50)]' : 'bg-transparent',
                )}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{s.address}</span>
                  {s.city ? <span className="text-muted-foreground">, {s.city}</span> : null}
                  {s.postal ? (
                    <span className="ml-1 font-mono text-xs uppercase text-muted-foreground">
                      {s.postal}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

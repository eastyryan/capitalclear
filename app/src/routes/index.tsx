import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import type { Provider, Scope, Season, Step } from "../lib/capital/data";
import { SERVICES, estimate, providerPrice } from "../lib/capital/data";
import { useSeason } from "../lib/capital/useSeason";
import { ProviderRail } from "../components/capital/ProviderRail";
import { Receipt } from "../components/capital/Receipt";
import { RequestPanel } from "../components/capital/RequestPanel";
import { SeasonStage, type PinPos } from "../components/capital/SeasonStage";
import { ServicesSheet } from "../components/capital/ServicesSheet";
import { SiteHeader } from "../components/capital/SiteHeader";
import { TrackingPanel } from "../components/capital/TrackingPanel";

const SITE_ORIGIN = "https://capitalclear.higgsfield.app";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/` }],
  }),
  component: CapitalClear,
});

const DEFAULT_PIN: PinPos = { x: 58, y: 44 };

function CapitalClear() {
  const [season, setSeason] = useSeason();
  const [step, setStep] = useState<Step>("locate");
  const [pin, setPin] = useState<PinPos | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("medium");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [searching, setSearching] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [etaMin, setEtaMin] = useState(0);
  const [completedAt, setCompletedAt] = useState("");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const service = SERVICES[season].find((s) => s.id === serviceId) ?? SERVICES[season][0];
  const basePrice = estimate(service, scope);
  const finalPrice = provider ? providerPrice(basePrice, provider) : basePrice;

  const changeSeason = (next: Season) => {
    if (next === season) return;
    clearTimers();
    setSeason(next);
    setServiceId(null);
    setProvider(null);
    setSearching(false);
    setStageIdx(0);
    setStep(pin ? "services" : "locate");
  };

  const confirmLocation = () => {
    if (!pin) setPin(DEFAULT_PIN);
    setStep("services");
  };

  const request = () => {
    setStep("match");
    setSearching(true);
    timers.current.push(window.setTimeout(() => setSearching(false), 1600));
  };

  const choose = (p: Provider) => {
    setProvider(p);
    setEtaMin(p.etaMin);
    setStageIdx(0);
    setStep("track");
    // ETA ticks down while the truck drives in.
    timers.current.push(
      window.setTimeout(() => setEtaMin((m) => Math.max(2, m - Math.ceil(m / 2))), 2600),
    );
    timers.current.push(window.setTimeout(() => setEtaMin(2), 5000));
  };

  const truckArrived = () => {
    setStageIdx(1);
    timers.current.push(window.setTimeout(() => setStageIdx(2), 2000));
    timers.current.push(
      window.setTimeout(() => {
        setStageIdx(3);
        setCompletedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
        timers.current.push(window.setTimeout(() => setStep("done"), 1400));
      }, 5500),
    );
  };

  const reset = () => {
    clearTimers();
    setStep("locate");
    setServiceId(null);
    setProvider(null);
    setSearching(false);
    setStageIdx(0);
  };

  return (
    <main className="relative h-dvh min-h-[560px] w-full overflow-hidden">
      <SeasonStage
        season={season}
        pin={pin}
        onDropPin={step === "locate" ? setPin : undefined}
        dimmed={step === "services" || (step === "match" && searching)}
        searching={step === "match" && searching}
        truck={step === "track" ? (stageIdx === 0 ? "driving" : "parked") : null}
        onTruckArrive={truckArrived}
      />

      <SiteHeader season={season} onSeason={changeSeason} current="app" overlay />

      {step === "locate" && (
        <RequestPanel season={season} hasPin={pin !== null} onConfirm={confirmLocation} />
      )}

      {step === "services" && (
        <ServicesSheet
          season={season}
          serviceId={serviceId}
          scope={scope}
          onSelect={setServiceId}
          onScope={setScope}
          onRequest={request}
          onBack={() => setStep("locate")}
        />
      )}

      {step === "match" && (
        <ProviderRail
          season={season}
          basePrice={basePrice}
          searching={searching}
          onChoose={choose}
        />
      )}

      {step === "track" && provider && (
        <TrackingPanel
          season={season}
          provider={provider}
          service={service}
          stageIdx={stageIdx}
          etaMin={etaMin}
        />
      )}

      {step === "done" && provider && (
        <Receipt
          season={season}
          provider={provider}
          service={service}
          price={finalPrice}
          completedAt={completedAt}
          onReset={reset}
        />
      )}

      {step !== "done" && (
        <p className="pointer-events-none absolute bottom-2 right-3 z-10 font-[family-name:var(--cc-font-mono)] text-[10px] text-[var(--cc-ink-soft)] sm:bottom-3 sm:right-4">
          Demo with sample providers
        </p>
      )}
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import type { Provider, Scope } from "../lib/capital/data";
import { SERVICES, estimate, providerPrice } from "../lib/capital/data";
import { useSeason } from "../lib/capital/useSeason";
import { CrewConfirm } from "../components/capital/CrewConfirm";
import { Receipt } from "../components/capital/Receipt";
import { RequestSheet } from "../components/capital/RequestSheet";
import { SeasonStage, type PinPos } from "../components/capital/SeasonStage";
import { SiteHeader } from "../components/capital/SiteHeader";
import { TrackingPanel } from "../components/capital/TrackingPanel";

const SITE_ORIGIN = "https://capitalclear.higgsfield.app";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/` }],
  }),
  component: CapitalClear,
});

type Flow = "request" | "match" | "track" | "done";

const DEFAULT_PIN: PinPos = { x: 58, y: 40 };

function CapitalClear() {
  const season = useSeason();
  const [step, setStep] = useState<Flow>("request");
  const [pin, setPin] = useState<PinPos | null>(null);
  const [address, setAddress] = useState("");
  const [serviceId, setServiceId] = useState("driveway");
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

  const service = SERVICES.winter.find((s) => s.id === serviceId) ?? SERVICES.winter[0];
  const basePrice = estimate(service, scope);
  const finalPrice = provider ? providerPrice(basePrice, provider) : basePrice;

  const request = () => {
    if (!pin) setPin(DEFAULT_PIN);
    setStep("match");
    setSearching(true);
    timers.current.push(window.setTimeout(() => setSearching(false), 1100));
  };

  const confirmCrew = (p: Provider) => {
    setProvider(p);
    setEtaMin(p.etaMin);
    setStageIdx(0);
    setStep("track");
    // ETA visibly counts down while the truck drives in.
    timers.current.push(
      window.setTimeout(() => setEtaMin((m) => Math.max(2, Math.ceil(m / 2))), 1800),
    );
    timers.current.push(window.setTimeout(() => setEtaMin(2), 3400));
  };

  const truckArrived = () => {
    setStageIdx(1);
    timers.current.push(window.setTimeout(() => setStageIdx(2), 1400));
    timers.current.push(
      window.setTimeout(() => {
        setStageIdx(3);
        setCompletedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
        timers.current.push(window.setTimeout(() => setStep("done"), 1100));
      }, 4200),
    );
  };

  const reset = () => {
    clearTimers();
    setStep("request");
    setProvider(null);
    setSearching(false);
    setStageIdx(0);
  };

  return (
    <main className="relative h-dvh min-h-[560px] w-full overflow-hidden">
      <SeasonStage
        season={season}
        pin={pin}
        onDropPin={step === "request" ? setPin : undefined}
        dimmed={step === "match"}
        searching={step === "match" && searching}
        truck={step === "track" ? (stageIdx === 0 ? "driving" : "parked") : null}
        onTruckArrive={truckArrived}
      />

      <SiteHeader current="app" overlay />

      {step === "request" && (
        <RequestSheet
          address={address}
          onAddress={setAddress}
          pinSet={pin !== null}
          serviceId={serviceId}
          onSelect={setServiceId}
          scope={scope}
          onScope={setScope}
          onSubmit={request}
        />
      )}

      {step === "match" && (
        <CrewConfirm
          basePrice={basePrice}
          searching={searching}
          onConfirm={confirmCrew}
          onBack={() => setStep("request")}
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

      {step !== "done" && step !== "request" && (
        <p className="pointer-events-none absolute bottom-2 right-3 z-10 font-[family-name:var(--cc-font-mono)] text-[10px] text-[var(--cc-ink-soft)] sm:bottom-3 sm:right-4">
          Demo with sample providers
        </p>
      )}
    </main>
  );
}

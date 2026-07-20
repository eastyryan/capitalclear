import { useEffect, useRef, useState } from "react"
import SiteHeader from "../components/SiteHeader"
import SeasonStage from "../components/request/SeasonStage"
import RequestSheet from "../components/request/RequestSheet"
import CrewConfirm from "../components/request/CrewConfirm"
import TrackingPanel from "../components/request/TrackingPanel"
import Receipt from "../components/request/Receipt"
import {
  PROVIDERS,
  SERVICES,
  priceFor,
  providerPrice,
  type Provider,
  type ScopeId,
} from "../lib/data"
import { useSeason } from "../lib/season"
import { submitRequest } from "../lib/supabase"
import { hasStripe, startCheckout } from "../lib/stripe"
import type { Pt } from "../lib/path"

const DEFAULT_PIN: Pt = { x: 58, y: 40 }
const PENDING_KEY = "cc-pending-booking"

type Step = "request" | "match" | "track" | "done"

export default function Request() {
  const { season } = useSeason()
  const [step, setStep] = useState<Step>("request")
  const [pin, setPin] = useState<Pt | null>(null)
  const [address, setAddress] = useState("")
  const [area, setArea] = useState("")
  const [contact, setContact] = useState("")
  const [serviceId, setServiceId] = useState<string>(SERVICES.winter[0].id)
  const [scope, setScope] = useState<ScopeId>("medium")
  const [provider, setProvider] = useState<Provider | null>(null)
  const [searching, setSearching] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [etaMin, setEtaMin] = useState(0)
  const [completedAt, setCompletedAt] = useState("")
  const [paid, setPaid] = useState(false)

  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => {
    document.title = "CapitalClear: request a clearing"
    return clearTimers
  }, [])

  const services = SERVICES[season]
  const service = services.find((s) => s.id === serviceId) ?? services[0]
  const basePrice = priceFor(service, scope)
  const finalPrice = provider ? providerPrice(basePrice, provider) : basePrice

  const submit = () => {
    if (!pin) setPin(DEFAULT_PIN)
    setStep("match")
    setSearching(true)
    later(() => setSearching(false), 1100)
  }

  // Enter the live-tracking sequence with a chosen crew.
  const startTracking = (p: Provider) => {
    setProvider(p)
    setEtaMin(p.etaMin)
    setStageIdx(0)
    setStep("track")
    later(() => setEtaMin((m) => Math.max(2, Math.ceil(m / 2))), 1800)
    later(() => setEtaMin(2), 3400)
  }

  const confirmCrew = async (p: Provider) => {
    const rowFields = {
      address: address.trim() || "Pin drop",
      pin_x: pin?.x ?? DEFAULT_PIN.x,
      pin_y: pin?.y ?? DEFAULT_PIN.y,
      service_id: service.id,
      service_name: service.name,
      scope,
      price: basePrice,
      season,
      contact: contact.trim() || null,
      area: area || null,
    }

    // Pay-to-book: create the request, then redirect to Stripe Checkout and
    // resume into tracking on return. Falls back to the simulated flow if
    // Stripe isn't configured or the session can't be created.
    if (hasStripe) {
      const id = await submitRequest(rowFields)
      if (id) {
        sessionStorage.setItem(
          PENDING_KEY,
          JSON.stringify({
            serviceId: service.id,
            scope,
            season,
            providerId: p.id,
            address,
            area,
            contact,
            pin,
          }),
        )
        const url = await startCheckout(id)
        if (url) {
          window.location.href = url
          return
        }
      }
      // Checkout unavailable: continue as a demo rather than dead-ending.
      startTracking(p)
      return
    }

    // Demo path: real queue entry (no-op without Supabase), simulated tracking.
    void submitRequest(rowFields)
    startTracking(p)
  }

  const onArrive = () => {
    setEtaMin(0)
    setStageIdx(1)
    later(() => setStageIdx(2), 1400)
    later(() => {
      setStageIdx(3)
      setCompletedAt(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      )
    }, 4200)
    later(() => setStep("done"), 5300)
  }

  const reset = () => {
    clearTimers()
    setStep("request")
    setPin(null)
    setAddress("")
    setArea("")
    setContact("")
    setProvider(null)
    setSearching(false)
    setStageIdx(0)
    setEtaMin(0)
    setCompletedAt("")
    setPaid(false)
  }

  // Return from Stripe Checkout: resume the paid booking into tracking, or
  // fall back to the request sheet if the payment was canceled.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const clearUrl = () =>
      window.history.replaceState({}, "", window.location.pathname)

    if (params.has("canceled")) {
      clearUrl()
      return
    }
    if (!params.has("paid")) return

    const raw = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    clearUrl()
    if (!raw) return
    try {
      const s = JSON.parse(raw)
      const p = PROVIDERS[s.season as "winter" | "summer"]?.find(
        (x) => x.id === s.providerId,
      )
      if (!p) return
      setServiceId(s.serviceId)
      setScope(s.scope)
      setAddress(s.address ?? "")
      setArea(s.area ?? "")
      setContact(s.contact ?? "")
      setPin(s.pin ?? DEFAULT_PIN)
      setPaid(true)
      startTracking(p)
    } catch {
      /* ignore malformed stash */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Flipping the season mid-flow restarts the request with that season's
  // services and crews. Skips the initial mount so a Checkout resume isn't
  // clobbered.
  const seasonMounted = useRef(false)
  useEffect(() => {
    if (!seasonMounted.current) {
      seasonMounted.current = true
      return
    }
    clearTimers()
    setStep("request")
    setProvider(null)
    setSearching(false)
    setStageIdx(0)
    setEtaMin(0)
    setServiceId(SERVICES[season][0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season])

  return (
    <main className="relative h-dvh overflow-hidden bg-paper">
      <SeasonStage
        pin={pin}
        onPin={(p) => step === "request" && setPin(p)}
        searching={step === "match" && searching}
        driving={step === "track" && stageIdx === 0}
        onArrive={onArrive}
        cleared={step !== "request" && stageIdx >= 2}
        flowActive={step !== "request"}
      />

      <SiteHeader current="request" overlay />

      {step === "request" && (
        <RequestSheet
          address={address}
          onAddress={setAddress}
          area={area}
          onArea={setArea}
          contact={contact}
          onContact={setContact}
          hasPin={pin !== null}
          serviceId={serviceId}
          onService={setServiceId}
          scope={scope}
          onScope={setScope}
          onSubmit={submit}
        />
      )}

      {step === "match" && (
        <CrewConfirm
          searching={searching}
          basePrice={basePrice}
          onConfirm={confirmCrew}
          onBack={() => {
            clearTimers()
            setSearching(false)
            setStep("request")
          }}
        />
      )}

      {step === "track" && provider && (
        <TrackingPanel
          provider={provider}
          service={service}
          etaMin={etaMin}
          stageIdx={stageIdx}
        />
      )}

      {step === "done" && provider && (
        <Receipt
          provider={provider}
          service={service}
          price={finalPrice}
          completedAt={completedAt}
          paid={paid}
          onReset={reset}
        />
      )}

      {(step === "match" || step === "track") && (
        <p className="absolute right-4 bottom-3 z-10 font-mono text-[11px] text-ink-soft sm:right-6">
          Demo with sample providers
        </p>
      )}
    </main>
  )
}

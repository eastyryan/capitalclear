// GA4 wrapper. Loads gtag.js only when VITE_GA_ID is configured; every call
// is a safe no-op otherwise, so the site runs fine without analytics.

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID: string | undefined = import.meta.env.VITE_GA_ID

let loaded = false

export function initAnalytics() {
  if (!GA_ID || loaded) return
  loaded = true
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag("js", new Date())
  // SPA: we send page_view manually on route change.
  window.gtag("config", GA_ID, { send_page_view: false })
}

export function trackPageview(path: string) {
  if (!GA_ID || !window.gtag) return
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (!GA_ID || !window.gtag) return
  window.gtag("event", name, params ?? {})
}

import { useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Landing from "./routes/Landing"
import Request from "./routes/Request"
import Partners from "./routes/Partners"
import PartnerLogin from "./routes/PartnerLogin"
import PartnerDashboard from "./routes/PartnerDashboard"
import { initAnalytics, trackPageview } from "./lib/analytics"

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ block: "start" })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function Analytics() {
  const { pathname } = useLocation()
  useEffect(() => {
    initAnalytics()
  }, [])
  useEffect(() => {
    trackPageview(pathname)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Analytics />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/request" element={<Request />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/partners/login" element={<PartnerLogin />} />
        <Route path="/partners/dashboard" element={<PartnerDashboard />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

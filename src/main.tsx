import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@fontsource-variable/outfit"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"
import "@fontsource/ibm-plex-mono/600.css"
import "./styles.css"
import App from "./App"
import { SeasonProvider } from "./lib/season"
import { AuthProvider } from "./lib/auth"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SeasonProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SeasonProvider>
    </AuthProvider>
  </StrictMode>,
)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import "./helpers/i18n";
import { setupGlobalErrorLogging } from "./helpers/global-error-logging";
import App from "./App.tsx";

setupGlobalErrorLogging();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

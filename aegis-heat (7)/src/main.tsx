import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign Vite HMR WebSockets & Recharts initial layout measurement warnings
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const reasonStr = reason ? String(reason.message || reason.description || reason) : "";
    if (
      reasonStr.toLowerCase().includes("websocket") ||
      reasonStr.toLowerCase().includes("vite") ||
      reasonStr.toLowerCase().includes("hmr") ||
      reasonStr.toLowerCase().includes("closed without opened")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const originalError = console.error;
  console.error = function (...args) {
    const firstArg = String(args[0] || "");
    if (
      firstArg.toLowerCase().includes("websocket") ||
      firstArg.toLowerCase().includes("vite") ||
      firstArg.toLowerCase().includes("hmr")
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const firstArg = String(args[0] || "");
    if (
      firstArg.toLowerCase().includes("websocket") ||
      firstArg.toLowerCase().includes("vite") ||
      firstArg.toLowerCase().includes("hmr") ||
      firstArg.includes("width(-1)") ||
      firstArg.includes("height(-1)") ||
      firstArg.includes("ResponsiveContainer")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


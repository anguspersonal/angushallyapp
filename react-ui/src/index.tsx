import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./general.css";
import App from "./App";
import * as serviceWorker from './serviceWorker';

// ✅ Import Mantine for UI styling & theming
import "@mantine/core/styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Register service worker for PWA functionality
// Only register in production to avoid cache issues in development
if (process.env.NODE_ENV === 'production') {
  serviceWorker.register({
    onSuccess: () => {
      console.log('PWA: Service worker registered successfully');
    },
    onUpdate: () => {
      console.log('PWA: New content available, please refresh');
    }
  });
} else {
  // Always unregister in development to avoid stale cache issues
  serviceWorker.unregister();
}

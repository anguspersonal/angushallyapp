import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./general.css";
import App from "./App";
import * as serviceWorker from './serviceWorker.js';

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
// This enables the app to appear in mobile share menus
serviceWorker.register({
  onSuccess: () => {
    console.log('PWA: Service worker registered successfully');
  },
  onUpdate: () => {
    console.log('PWA: New content available, please refresh');
  }
});

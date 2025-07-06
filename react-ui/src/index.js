import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./general.css";
import App from "./App.js";
import * as serviceWorker from './serviceWorker.js';
import "@mantine/core/styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

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

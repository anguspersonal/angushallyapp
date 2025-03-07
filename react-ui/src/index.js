import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Enables routing in the app
import "./index.css";
import App from "./App.js";

// ✅ Import Mantine for UI styling & theming
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

const root = ReactDOM.createRoot(document.getElementById("root"));

// // ✅ Dynamically Load Tabler Icons CSS
// const tablerCSS = document.createElement("link");
// tablerCSS.href = "https://unpkg.com/@tabler/icons/tabler-icons.css";
// tablerCSS.rel = "stylesheet";
// document.head.appendChild(tablerCSS);

// // ✅ Dynamically Load Tabler Core JavaScript (for interactive components)
// const tablerScript = document.createElement("script");
// tablerScript.src = "https://unpkg.com/@tabler/core@latest/dist/js/tabler.min.js";
// tablerScript.defer = true; // Ensures it loads without blocking page rendering
// document.body.appendChild(tablerScript);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Ensures proper routing in the app */}
      <MantineProvider withGlobalStyles withNormalizeCSS> {/* ✅ Ensures Mantine UI styles apply */}
        <ColorSchemeScript /> {/* ✅ Handles dark/light mode switching */}
        <App /> {/* ✅ Main application component */}
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);

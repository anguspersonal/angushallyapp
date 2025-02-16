import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Import BrowserRouter
import "./index.css";
import App from "./App.js";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Wrap App in Router HERE */}
      <MantineProvider>
        {/*theme={{
            colors: {
            teal: ['#E6FCF5', '#C3FAE8', '#96F2D7', '#63E6BE', '#38D9A9', '#20C997', '#12B886', '#0CA678', '#099268', '#087F5B'],
          },
        }}*/}
        <ColorSchemeScript />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);

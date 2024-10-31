import './index.css'
import React, { StrictMode } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import App from './App'; // Adjust if your App component is in a different location

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
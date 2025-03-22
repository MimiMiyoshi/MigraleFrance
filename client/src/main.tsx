import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import 'intro.js/introjs.css';
import 'intro.js/themes/introjs-modern.css';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

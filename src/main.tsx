import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./fantasy.css";
import "./atlas.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

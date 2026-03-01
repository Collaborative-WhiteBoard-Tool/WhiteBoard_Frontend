// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
<script
  src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1"
  type="module"
></script>;
if (import.meta.env?.PROD || process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>,
);

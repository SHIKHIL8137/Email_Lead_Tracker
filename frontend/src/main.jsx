import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import App from "./App";
import "./index.css";
import "./lib/shadcn.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";

gsap.registerPlugin(ScrollToPlugin);

// Smooth scroll handler
function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest("a[href^='#']");
      if (target) {
        e.preventDefault();
        const id = target.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (el) {
          gsap.to(window, {
            duration: 1,
            scrollTo: { y: el, offsetY: 80 },
            ease: "power2.inOut"
          });
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

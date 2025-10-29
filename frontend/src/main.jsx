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

function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest("a[href^='#']");
      if (!target) return;

      const id = target.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      const main = document.querySelector("main");

      if (el && main) {
        e.preventDefault();
        const targetY = el.offsetTop - 80;

        gsap.to(main, {
          duration: 0.1,
          scrollTo: { y: targetY },
          ease: "expo.out",
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

function Root() {
  useSmoothScroll();

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

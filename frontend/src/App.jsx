import React, { useEffect, useRef, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navebar";
import PrivateRoute from "./components/PrivateRoutes";
import PageTransition from "./components/PageTransition";
import LoadingComponent from "./components/LoadingComponent";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Leads = lazy(() => import("./pages/Leads"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const EmailHistory = lazy(() => import("./pages/EmailHistory"));
const Templates = lazy(() => import("./pages/Templates"));

export default function App() {
  const location = useLocation();

  useEffect(() => {
    gsap.to(window, {
      duration: 0.6,
      scrollTo: { y: 0 },
      ease: "power2.out",
    });
  }, [location.pathname]);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
        <Navbar />

        <main className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <PageTransition>
                      <Login />
                    </PageTransition>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <PageTransition>
                      <Register />
                    </PageTransition>
                  </PublicRoute>
                }
              />

              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Leads />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Campaigns />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <EmailHistory />
                    </PageTransition>
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Templates />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>

        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
          />
        </div>
      </div>
    </Suspense>
  );
}

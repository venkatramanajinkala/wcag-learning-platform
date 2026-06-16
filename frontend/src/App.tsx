/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import CriterionPage from "./pages/criterion/CriterionPage";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ToastProvider } from "./components/toast/ToastProvider";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import PublicLayout from "./pages/public/PublicLayout";
import Landing from "./pages/public/Landing";
import Features from "./pages/public/Features";
import About from "./pages/public/About";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public marketing pages */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <Landing />
                  </PublicLayout>
                }
              />
              <Route
                path="/features"
                element={
                  <PublicLayout>
                    <Features />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <About />
                  </PublicLayout>
                }
              />

              {/* Auth pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected app */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/criterion/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CriterionPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

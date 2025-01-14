/**
 * @file App.tsx
 * @description Main application component with routing and providers
 */

import * as React from "react";
import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme/theme-provider";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { LoadingSpinner } from "./components/ui/loading";
import { trackPageView } from "./services/analytics";

// Lazy load components
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const PrayerRequestsPage = React.lazy(() => 
  import("./features/prayer-requests/pages/PrayerRequestsPage").then(mod => ({
    default: mod.PrayerRequestsPage
  }))
);
const PrayerRequestDetailPage = React.lazy(() => 
  import("./features/prayer-requests/pages/PrayerRequestDetailPage").then(mod => ({
    default: mod.PrayerRequestDetailPage
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.code === 'not-found' || error?.code === 'permission-denied') {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Analytics wrapper component
function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prayer-requests"
            element={
              <ProtectedRoute>
                <PrayerRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prayer-requests/:id"
            element={
              <ProtectedRoute>
                <PrayerRequestDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AnalyticsWrapper>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </AnalyticsWrapper>
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;

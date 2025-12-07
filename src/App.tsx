import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Mistakes from "./pages/Mistakes";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import ProtectedAdminRoute from "./components/layout/ProtectedAdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TradeManagement from "./pages/admin/TradeManagement";
import SystemLogs from "./pages/admin/SystemLogs";
import Announcements from "./pages/admin/Announcements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import BrokerConnections from "./pages/BrokerConnections";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/mistakes" element={<Mistakes />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/broker-connections" element={<BrokerConnections />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedAdminRoute />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/trades" element={<TradeManagement />} />
                <Route path="admin/analytics" element={<AdminAnalytics />} />
                <Route path="admin/logs" element={<SystemLogs />} />
                <Route path="admin/announcements" element={<Announcements />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

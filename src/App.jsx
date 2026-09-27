import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Splash from "./pages/auth/Splash";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import Scanner from "./pages/user/Scanner";
import QRScanner from "./pages/user/QRScanner";
import Pickup from "./pages/user/Pickup";
import Donation from "./pages/user/Donation";
import Rewards from "./pages/user/Rewards";
import Certificate from "./pages/user/Certificate";
import Awareness from "./pages/user/Awareness";
import Centers from "./pages/user/Centers";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManagePickups from "./pages/admin/ManagePickups";

// Delivery Agent Pages
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryScan from "./pages/delivery/DeliveryScan";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public & Authentication Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/" element={<Splash />} />
                <Route path="/splash" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Main Application Routes Guarded by Dashboard Layout */}
              <Route element={<DashboardLayout />}>
                {/* 1. User Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scanner"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Scanner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/qr-scanner"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <QRScanner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pickup"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Pickup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donation"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Donation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Rewards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificate"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Certificate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/awareness"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <Awareness />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <History />
                    </ProtectedRoute>
                  }
                />

                {/* 2. Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pickups"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <ManagePickups />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Delivery Operations Protected Routes */}
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute allowedRoles={["DELIVERY"]}>
                      <DeliveryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery/scan"
                  element={
                    <ProtectedRoute allowedRoles={["DELIVERY"]}>
                      <DeliveryScan />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Common Authenticated Routes */}
                <Route
                  path="/centers"
                  element={
                    <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                      <Centers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={["USER", "ADMIN", "DELIVERY"]}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={["USER", "ADMIN", "DELIVERY"]}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import GuestLayout from "@/components/layout/GuestLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute, GuestOnlyRoute } from "@/components/layout/ProtectedRoute";
import { SplashScreen } from "@/components/common/SplashScreen";

import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

import Dashboard from "@/pages/shared/Dashboard";
import Events from "@/pages/shared/Events";
import EventDetail from "@/pages/shared/EventDetail";
import EventForm from "@/pages/shared/EventForm";
import MyTeams from "@/pages/player/MyTeams";
import TeamDetail from "@/pages/shared/TeamDetail";
import NotificationsPage from "@/pages/shared/Notifications";
import SendNotification from "@/pages/shared/SendNotification";
import Approvals from "@/pages/admin/Approvals";
import Profile from "@/pages/shared/Profile";
import SearchPage from "@/pages/shared/Search";
import Matches from "@/pages/shared/Matches";
import Leaderboard from "@/pages/shared/Leaderboard";
import Matchmaking from "@/pages/shared/Matchmaking";
import ReviewJoinRequest from "@/pages/shared/ReviewJoinRequest";
import TeamFormationReports from "@/pages/shared/TeamFormationReports";

import NotFound from "@/pages/NotFound";
import Forbidden from "@/pages/Forbidden";

// Module-level flag: splash only plays once per page load, never on re-renders/remounts
let splashDone = false;

function Bootstrapped({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [show, setShow] = useState(!splashDone);

  useEffect(() => {
    if (splashDone) return;
    const t = setTimeout(() => {
      setShow(false);
      splashDone = true;
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SplashScreen show={show || (loading && !splashDone)} />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Bootstrapped>
          <Routes>
            <Route element={<GuestLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
              <Route path="/signup" element={<GuestOnlyRoute><Signup /></GuestOnlyRoute>} />
              <Route path="/403" element={<Forbidden />} />
            </Route>

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/new" element={<ProtectedRoute roles={["ORGANIZER", "ADMIN"]}><EventForm /></ProtectedRoute>} />
              <Route path="/events/edit/:id" element={<ProtectedRoute roles={["ORGANIZER", "ADMIN"]}><EventForm /></ProtectedRoute>} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/teams" element={<ProtectedRoute roles={["PLAYER"]}><MyTeams /></ProtectedRoute>} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/send" element={<ProtectedRoute roles={["ORGANIZER", "ADMIN"]}><SendNotification /></ProtectedRoute>} />
              <Route path="/review-request/:teamId/:username" element={<ReviewJoinRequest />} />
              <Route path="/admin/approvals" element={<ProtectedRoute roles={["ADMIN"]}><Approvals /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/formation-reports" element={<TeamFormationReports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Bootstrapped>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
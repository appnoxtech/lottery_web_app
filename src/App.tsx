import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import AppShell from "./components/AppShell";
import Balance from "./pages/Balance";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Results from "./pages/Results";
import Tickets from "./pages/Tickets";
import { LogoMark } from "./components/Logo";
import { Spinner } from "./components/Icons";

/** Shown while a stored session is being checked with the server. */
function Splash() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-screen place-content-center justify-items-center gap-4 bg-hero text-white">
      <LogoMark size={64} />
      <span className="flex items-center gap-2 text-sm">
        <Spinner className="text-gold-400" />
        Loading…
      </span>
    </div>
  );
}

/** Signed-in customers only; a stored session is confirmed with the server before anything is shown. */
function RequireSession() {
  const { session, checking } = useAuth();
  if (checking) return <Splash />;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const { session, checking } = useAuth();
  if (checking) return <Splash />;
  return session ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<RequireSession />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/results" element={<Results />} />
              <Route path="/balance" element={<Balance />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

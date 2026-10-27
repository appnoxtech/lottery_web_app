import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import AppShell from "./components/AppShell";
import Balance from "./pages/Balance";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";

/** Signed-in customers only; a stored session is confirmed with the server before anything is shown. */
function RequireSession() {
  const { session, checking } = useAuth();
  if (checking) return <div className="grid min-h-screen place-items-center text-muted">Loading…</div>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const { session, checking } = useAuth();
  if (checking) return <div className="grid min-h-screen place-items-center text-muted">Loading…</div>;
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
              <Route path="/balance" element={<Balance />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

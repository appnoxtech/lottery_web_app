import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

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
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

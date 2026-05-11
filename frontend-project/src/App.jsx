import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout    from './components/Layout';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import SparePart from './pages/SparePart';
import StockIn   from './pages/StockIn';
import StockOut  from './pages/StockOut';
import Reports   from './pages/Reports';

/* ── Protected route wrapper ─────────────────────────────────────────────── */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading SmartPark SIMS…</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected – all share the Layout shell */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index          element={<Dashboard />} />
            <Route path="spare-parts" element={<SparePart />} />
            <Route path="stock-in"    element={<StockIn   />} />
            <Route path="stock-out"   element={<StockOut  />} />
            <Route path="reports"     element={<Reports   />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { RequireRole } from './components/RouteGuards';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Verifier = lazy(() => import('./pages/Verifier'));
const UploaderDashboard = lazy(() => import('./pages/UploaderDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProofVerification = lazy(() => import('./pages/ProofVerification'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="mesh-bg">
        <span className="mesh-blob-3" />
      </div>
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/verifier" />} />
            <Route path="/verifier" element={<Verifier />} />
            <Route path="/verify-proof/:proofHash" element={<ProofVerification />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Uploader Routes */}
            <Route element={<RequireRole roles={['uploader']} />}>
              <Route path="/uploader" element={<UploaderDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RequireRole roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;

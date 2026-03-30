import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import KanbanBoard from './components/KanbanBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyResumes from './pages/MyResumes';
import SettingsPage from './pages/SettingsPage';
import AIAssistant from './pages/AIAssistant';
import { Loader2 } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex bg-background min-h-screen items-center justify-center">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ✅ Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={
            <div className="flex bg-background min-h-screen transition-all duration-300">
              <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
              <div className={`flex-1 flex flex-col ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
                <Navbar isCollapsed={isCollapsed} />
                <main className="flex-1 p-8 pt-24 max-w-[1400px] mx-auto w-full">
                  <Outlet />
                </main>
              </div>
            </div>
          }>

            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/optimizer" element={<PageTransition><ResumeAnalysis /></PageTransition>} />
            <Route path="/applications" element={<PageTransition><KanbanBoard /></PageTransition>} />
            <Route path="/resumes" element={<PageTransition><MyResumes /></PageTransition>} />
            <Route path="/ask-ai" element={<PageTransition><AIAssistant /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />

          </Route>
        </Route>

        {/* ✅ Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
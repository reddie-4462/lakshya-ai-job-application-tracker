import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'My Resumes', path: '/resumes' },
    { icon: Briefcase, label: 'Applications', path: '/applications' },
    { icon: Sparkles, label: 'AI Optimizer', path: '/optimizer' },
    { icon: MessageSquare, label: 'Ask AI', path: '/ask-ai' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside
      className={`
        h-screen fixed left-0 top-0 z-40 bg-surface-subtle border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full p-6">
        {/* Brand */}
        <div className="flex items-center gap-4 mb-12 px-1 overflow-hidden">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-10 h-10 rounded-2xl bg-ai-gradient flex items-center justify-center shrink-0 shadow-ai-glow"
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-black tracking-tight whitespace-nowrap text-white"
              >
                Lakshya<span className="text-primary">.ai</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                group relative flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300
                ${isActive
                  ? 'bg-white/5 text-white shadow-inner-glass border border-white/5'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110`} />
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              {/* Active Indicator Dot */}
              <AnimatePresence>
                {/* We use a hidden state to keep the dot always present but invisible if not active if we wanted, 
                    but AnimatePresence is better for the fade effect */}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/5 space-y-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
                navigate('/');
              }
            }}
            className={`
              flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

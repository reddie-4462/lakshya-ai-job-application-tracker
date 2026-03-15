import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  isCollapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isCollapsed }) => {
  const { user } = useAuth();
  return (
    <header
      className={`
        h-20 fixed top-0 right-0 z-30 bg-background/60 backdrop-blur-xl border-b border-white/5
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isCollapsed ? 'left-20' : 'left-64'}
      `}
    >
      <div className="flex items-center justify-between h-full px-8 w-full max-w-[1400px] mx-auto">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative group">
          <motion.div
            initial={false}
            animate={{ scale: 1 }}
            whileFocus={{ scale: 1.02 }}
            className="relative"
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Quick search (⌘K)"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[13px] font-medium text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all shadow-inner-glass"
            />
          </motion.div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          <button
            title="Notifications"
            className="p-3 text-gray-500 hover:text-white bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all relative group shadow-inner-glass"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-glow animate-pulse" />
          </button>

          <div className="h-10 w-px bg-white/5" />

          <button
            className="flex items-center gap-4 pl-3 pr-2 py-2 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group shadow-inner-glass"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white leading-tight uppercase tracking-widest">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-primary font-black leading-tight uppercase tracking-widest mt-0.5">Pro Tier</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ai-gradient flex items-center justify-center border border-white/10 group-hover:border-primary/50 group-hover:shadow-ai-glow transition-all">
              <User size={18} className="text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
